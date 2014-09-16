restify = require 'restify'
ecstatic = require 'ecstatic'
fs = require 'fs'
plugin_data = require '../plugin.json'
Url = require 'url'

exports.setup = (callback) ->
	@server.get /^(\/oauthd\/plugins\/statistics(\/.*)?)/, (req, res, next) ->
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

	callback()
	