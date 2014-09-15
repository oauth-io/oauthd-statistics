restify = require 'restify'
ecstatic = require 'ecstatic'
fs = require 'fs'
plugin_data = require '../plugin.json'

exports.setup = (callback) ->
	@server.get /^(\/oauthd\/plugins\/statistics(\/.*)?)/, (req, res, next) ->
		str = req.params[0].replace('/oauthd/plugins/statistics', '')
		fs.stat __dirname + '/public' + str, (err, stat) ->
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

	callback()