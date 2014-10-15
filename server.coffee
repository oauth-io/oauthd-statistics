restify = require 'restify'
fs = require 'fs'
Url = require 'url'
async = require 'async'

module.exports = (env) ->
	setup: (callback) ->
		env.server.get /^(\/oauthd\/plugins\/statistics(\/.*)?)/, (req, res, next) ->
			req.params[1] ?= ""
			req.url = req.params[1]
			req._url = Url.parse req.url
			req._path = req._url.pathname

			fs.stat __dirname + '/public' + req.params[1], (err, stat) ->
				if stat?.isFile()
					next()
					return
				else
					fs.readFile __dirname + '/public/index.html', {encoding: 'UTF-8'}, (err, data) ->
						res.setHeader 'Content-Type', 'text/html'
						res.send 200, data
						return
		, restify.serveStatic
			directory: __dirname + '/public'
			default: __dirname + '/public/index.html'


		env.data.timelines = require './db_timelines'

		env.events.on 'connect.callback', (data) =>
			env.data.timelines.addUse target:'co:a:' + data.key + ':' + data.status, (->)
			env.data.timelines.addUse target:'co:p:' + data.provider + ':' + data.status, (->)
			env.data.timelines.addUse target:'co:a:' + data.key + ':p:' + data.provider + ':' + data.status, (->)

		env.events.on 'connect.auth', (data) =>
			env.data.timelines.addUse target:'co:p:' + data.provider, (->)
			env.data.timelines.addUse target:'co:a:' + data.key + ':p:' + data.provider, (->)
			env.data.timelines.addUse target:'co:a:' + data.key, (->)

		sendStats = env.utilities.check target:'string', unit:['string','none'], start:'int', end:['int','none'], (data, callback) =>
			now = Math.floor((new Date).getTime() / 1000)
			data.unit ?= 'd'
			data.end ?= now

			err = new env.utilities.check.Error
			err.error 'unit', 'invalid unit type' if data.unit != 'm' && data.unit != 'd' && data.unit != 'h'
			err.error 'end', 'invalid format' if data.end > now + 12 * 31 * 24 * 3600 * 24
			return callback err if err.failed()

			if data.unit == 'm' && data.end - data.start > 50 * 31 * 24 * 3600 ||
				data.unit == 'd' && data.end - data.start > 50 * 24 * 3600 ||
				data.unit == 'h' && data.end - data.start > 50 * 3600
					return callback new env.utilities.check.Error 'Too large date range'

			async.parallel [
				(cb) => env.data.timelines.getTimeline data.target, data, cb
				(cb) => env.data.timelines.getTimeline data.target + ':success', data, cb
				(cb) => env.data.timelines.getTimeline data.target + ':error', data, cb
			], (e, r) ->
				return callback e if e
				res = labels:Object.keys(r[0]), ask:[], success:[], fail:[]
				for k,v of r[0]
					res.ask.push v
					res.success.push r[1][k]
					res.fail.push r[2][k]
				callback null, res

		# get statistics for an app
		env.server.get env.config.base_api + '/apps/:key/stats', env.middlewares.auth.needed, (req, res, next) =>
			req.params.target = 'co:a:' + req.params.key
			sendStats req.params, env.server.send(res, next)

		# get statistics for a keyset
		env.server.get env.config.base_api + '/apps/:key/keysets/:provider/stats', env.middlewares.auth.needed, (req, res, next) =>
			req.params.target = 'co:a:' + req.params.key + ':p:' + req.params.provider
			sendStats req.params, env.server.send(res, next)

		# get statistics for a provider
		env.server.get env.config.base_api + '/providers/:provider/stats', env.middlewares.auth.needed, (req, res, next) =>
			req.params.target = 'co:p:' + req.params.provider
			sendStats req.params, env.server.send(res, next)

		env.server.get env.config.base_api + '/analytics', env.middlewares.auth.needed, (req, res, next) =>
			req.filters = req.params.filters.split ","
			req.appkeys = req.params.appkeys.split ","
			# console.log ""
			# console.log "server_statistics analytics"
			# console.log "req.appkeys", req.appkeys
			# console.log "req.filters", req.filters
			# console.log "req.params", req.params
			# console.log ""
			tasksTime = []
			tasksTotal = []
			for filter in req.filters
				do (filter) =>
					filter = filter.replace ":allapps:", ":a:"
					tasksTime.push (cb) => env.data.timelines.getTimeline filter, req.params, cb
					tasksTotal.push (cb) => env.data.timelines.getTotal filter, cb
			async.series tasksTime, (errTime,resTime) =>
				return next errTime if errTime
				# console.log "resTime", resTime
				async.series tasksTotal, (errTotal,resTotal) =>
					return next errTotal if errTotal
					# console.log "resTotal", resTotal
					res.send totals:resTotal, timelines:resTime, params:req.params
					next()

	callback()
	
