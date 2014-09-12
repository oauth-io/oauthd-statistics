restify = require 'restify'
ecstatic = require 'ecstatic'
fs = require 'fs'

# shared = require '../../../bin/plugin_shared'
# {db,check} = shared

exports.setup = (callback) ->
	console.log "SETUP plugin stats"

	@server.get @config.base_api + '/oauthd/plugin/stats', (req, res, next) ->
		fs.stat __dirname + '/public' + req.params[0], (err, stat) ->
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