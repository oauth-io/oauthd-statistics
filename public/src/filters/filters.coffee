module.exports = (app) ->
	app.filter 'capitalize', () ->
		(str) ->
			return "" if not str || not str[0]
			return str[0].toUpperCase() + str.substr 1
			
	app.filter 'count', () ->
		(object) ->
			count = 0
			for k,v of object
				count++
			return count