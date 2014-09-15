restify = require 'restify'
ecstatic = require 'ecstatic'
fs = require 'fs'
plugin_data = require '../plugin.json'

exports.setup = (callback) ->
	@server.get @config.base_api + '/oauthd/plugins/' + plugin_data.name, (req, res, next) ->
		console.log "IN OAUTHD PLUGIN PATH"
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

console.log "plugin_data.name", plugin_data.name
