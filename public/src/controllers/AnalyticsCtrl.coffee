sugar = require 'sugar'

module.exports = (app) ->
	app.controller('statistics_plugin_AnalyticsCtrl', ['$scope', '$state', '$rootScope', 'statistics_plugin_AnalyticsService', 'AppService', 
		($scope, $state, $rootScope, statistics_plugin_AnalyticsService, AppService) ->
			console.log "IN statistics_plugin_AnalyticsCtrl"
			
			AppService.all()
				.then (apps) ->
					$scope.apps = apps
					console.log "$scope.apps", $scope.apps
					# async.eachSeries apps, (app, next) ->
					# 	AppService.get app.key
					# 		.then (app_data) ->
					# 			for j of app_data
					# 				app[j] = app_data[j]
									
					# 			for k,v of app_data.keysets
					# 				$scope.providers[v] = true
					# 			next()
					# 		.fail (e) ->
					# 			console.log e
					# 			next()
					# , (err) ->
					# 	$scope.$apply()
				.fail (e) ->
					console.log e
				.finally () ->
					# $scope.loadingApps = false
					$scope.$apply()

			if not $rootScope.statistics_plugin_analytics
				$rootScope.statistics_plugin_analytics = {}
			else
				$scope.chartCanevas = $rootScope.statistics_plugin_analytics.chartCanevas
				$scope.startDate = $rootScope.statistics_plugin_analytics.startDate
				$scope.timeUnit = $rootScope.statistics_plugin_analytics.timeUnit
				$scope.lines = $rootScope.statistics_plugin_analytics.lines
				$scope.analytics_info = $rootScope.statistics_plugin_analytics.analytics_info

			initAnalytics = () ->
				$scope.analyticsLoading = true
				if not $scope.startDate
					$scope.changeStartDate $scope.startDates[3]

				if $scope.chartCanevas.labels and $scope.chartCanevas.labels.length > 0
					drawGraph()
				else
					localUpdateLine $scope.lines[0]
			#
			# Stats date time
			#
			$scope.startDates = [
				{ name:"Past 1 days", value:"1", unit:"h", unitname:"Hours"},
				{ name:"Past 3 days", value:"3", unit:"d", unitname:"Days"},
				{ name:"Past 5 days", value:"5", unit:"d", unitname:"Days"},
				{ name:"Past 15 days", value:"15", unit:"d", unitname:"Days"},
				{ name:"Past month", value:"31", unit:"d", unitname:"Days"},
				{ name:"Past 3 month", value:"92", unit:"m", unitname:"Months"},
				{ name:"Past 6 month", value:"183", unit:"m", unitname:"Months"},
				{ name:"Forever", value:"0", unit:"m", unitname:"Months"}
			]
			# $scope.startDate = $scope.startDates[3]

			$scope.changeStartDate = (selected) ->
				$scope.startDate = selected
				$rootScope.statistics_plugin_analytics.startDate = $scope.startDate
				$scope.changeUnit s=name:selected.unitname, value:selected.unit

			$scope.timeUnits = [
				{ name:"Hours", value:"h", enabled:true},
				{ name:"Days", value:"d", enabled:true},
				{ name:"Months", value:"m", enabled:true}
			]

			# $scope.timeUnit = $scope.timeUnits[1]

			$scope.changeUnit = (selected) ->
				$scope.timeUnit = selected
				$rootScope.statistics_plugin_analytics.timeUnit = $scope.timeUnit
				getGraphData()

			$scope.filterUnit = (selected) ->
				if $scope.startDate.value > 3 and selected.value is "h"
					return false
				if $scope.startDate.value > 92 and (selected.value is "h" or selected.value is "d")
					return false
				if $scope.startDate.value < 31 and selected.value is "m"
					return false
				return true

			#
			# Filters
			#
			$scope.filters = [
				{ name:"connexions", value:"co", success:false, error:false, allowuniq:true},
				{ name:"connexions success", value:"co", success:true, error:false, allowuniq:true},
				{ name:"connexions fails", value:"co", success:false, error:true, allowuniq:true},
				{ name:"requests", value:"req", success:false, error:false, allowuniq:false},
			]

			# defaultColor = "#428bca"
			defaultColor = "#474747"
			class Line
				constructor: (app, filter) ->
					@app = if app? then app else {}
					@filter = filter
					@active = false
					@sublines = []
					if @app and Object.keys(@app).length isnt 0
						if @app.keysets.length > 1
							@sublines.push new Subline(@filter, null, @app.key, @app.name)
						for provider in @app.keysets
							@sublines.push new Subline(@filter, provider, @app.key, @app.name)
					else
						counter = 0
						for app in $rootScope.me.apps
							for provider in app.keysets
								counter++
								@sublines.push new Subline(@filter, provider, null, null)
						if counter > 1
							@sublines.unshift new Subline(@filter, null, null, null)

			class Subline
				constructor: (filter, provider, appkey, appname) ->
					@filter = sugar.clone(filter, true)
					@filter.unique = false if @filter.allowuniq
					@provider = provider
					@appkey = appkey
					@allapps = if @appkey then false else true
					@appname = appname
					@active = false
					@displayed = false
					@updateValueName()
					@resetDisplay()
				updateValueName: () ->
					@name = @filter.name
					@value = @filter.value
					if @filter.allowuniq and @filter.unique
						@value += ":uid"
						@name += " (unique)"
					if @allapps
						@value += ":allapps"
					else
						@value += ":a"
						@value += ":" + @appkey
						@name = @appname+ " " + @name
					if @provider
						@value += ":p:" + @provider
						@name += " with " + @provider
					@value += ":success" if @filter.success
					@value += ":error" if @filter.error
				resetDisplay: () =>
					@total = null
					@selTotal = null
					@color = defaultColor
					@data = []

			if not $scope.lines
				$scope.lines = []
				for filter in $scope.filters
					$scope.lines.push new Line(null, sugar.clone(filter, true))
					for app in $rootScope.me.apps
						$scope.lines.push new Line(sugar.clone(app, true), sugar.clone(filter, true))

			localUpdateLine = (line) ->
				line.active = !line.active
				if line.active
					for subline, index in line.sublines
						subline.updateValueName()
						if index is 0
							subline.active = true
							subline.displayed = true
				else
					for subline in line.sublines
						subline.active = false
						subline.displayed = false
						subline.filter.unique = false
				getGraphData()
			$scope.updateLine = (line, event) ->
				if event
					event.stopPropagation();
					event.preventDefault();
				if line.sublines.length > 0
					localUpdateLine line

			updateLineActive = (line) ->
				line.active = false
				for subline in line.sublines
					if subline.active
						line.active = true
						break

			$scope.updateSubline = (subline, line, event) ->
				if event
					event.stopPropagation();
					event.preventDefault();
				if subline
					subline.updateValueName()
					subline.active = !subline.active
					subline.displayed = subline.active
					line.active = true if subline.active
					if not subline.active
						updateLineActive line
					getGraphData()

			$scope.updateSublineUnique = (subline, line, event) ->
				if event
					event.stopPropagation();
					event.preventDefault();
				subline.filter.unique = !subline.filter.unique if subline.filter.allowuniq
				subline.updateValueName()
				subline.active = true
				subline.displayed = true
				line.active = true if subline.active
				if not subline.active
					updateLineActive line
				getGraphData()

			$scope.hoverdropdownClick = (event) ->
				if event
					event.stopPropagation();
					event.preventDefault();

			$scope.displaySubline = (subline) ->
				subline.displayed = !subline.displayed
				getGraphData()

			$scope.removeSubline = (subline, line) ->
				subline.active = false
				subline.displayed = false
				updateLineActive line
				getGraphData()

			$scope.displayedSubline = (subline) ->
				return (subline.displayed and subline.active)

			$scope.undisplayedSubline = (subline) ->
				return (!subline.displayed and subline.active)

			$scope.activeLine = (line) ->
				return line.active

			$scope.displayedSublines = (line) ->
				return false if not line.active
				displayed = false
				for subline in line.sublines
					if (subline.displayed and subline.active)
						displayed = true
						break
				return displayed

			$scope.undisplayedSublines = (line) ->
				return false if not line.active
				undisplayed = false
				for subline in line.sublines
					if (!subline.displayed and subline.active)
						undisplayed = true
						break
				return undisplayed

			#
			#Chart drawing
			#
			if not $scope.chartCanevas
				$scope.chartCanevas = {}
				$scope.chartCanevas.labels = []
				$scope.chartCanevas.datasets = []
				$scope.chartCanevas.maxSelTotal = 0

			#Call to backend webservice to get timelines
			getGraphData = () =>
				sublinesValues = []
				appkeys = []
				for line in $scope.lines
					if line.active
						for subline in line.sublines
							if subline.displayed and subline.active
								if subline.allapps
									for app in $rootScope.me.apps
										value = subline.value
										sublinesValues.push value.replace ":allapps", ":allapps:" + app.key
										appkeys.push app.key
								else
									sublinesValues.push subline.value
									appkeys.push subline.appkey
				sublinesValues = sublinesValues.unique()
				if sublinesValues.length < 1
					$scope.chartCanevas.datasets = []
					updateChartData([], [], [])
				else
					dateStart = new Date()
					dateStart.setTime(dateStart.getTime() - (24*3600*1000*$scope.startDate.value))
					opts =
						start: dateStart.getTime()
						unit: $scope.timeUnit.value
						filters: sublinesValues
						appkeys: appkeys
					AnalyticsService.getGraphData opts, (successdata, status) ->
						# console.log "DashboardAnalyticsCtrl getGraphData successdata",successdata
						totals = successdata.data.totals
						timelines = successdata.data.timelines
						filters = successdata.data.params.filters.split ","
						updateChartData(filters, timelines, totals)
					, (errordata, status) ->
						# console.log "DashboardAnalyticsCtrl getGraphData errordata",errordata

			updateChartData = (filters, timelines, totals) ->
				$scope.chartCanevas.datasets = []
				$scope.chartCanevas.maxSelTotal = 0
				for line in $scope.lines
					for subline in line.sublines
						subline.resetDisplay()

				for value in filters
					total = totals.shift()
					timeline = timelines.shift()
					aPos = value.search ":allapps:"
					endPos = value.search ":p:"
					endPos = value.search ":success" if endPos is -1
					endPos = value.search ":error" if endPos is -1
					endPos = value.length if endPos is -1
					allappsValue = if aPos isnt -1 then value.replace(value.substring(aPos, endPos), ":allapps") else null
					for line in $scope.lines
						for subline in line.sublines
							if subline.displayed and ((subline.value is value and not subline.allapps) or (subline.allapps and subline.value is allappsValue))
								if subline.color is defaultColor
									subline.rgb = 'rgba(' + (Math.floor((Math.random() * 210) + 30)) + ',' + (Math.floor((Math.random() * 210) + 30)) + ',' + (Math.floor((Math.random() * 210) + 30))
								subline.total = 0 if not subline.total
								subline.total += if not total then +"0" else parseInt(total,10)
								subline.selTotal = 0 if not subline.selTotal
								i = 0
								for k,v of timeline
									subline.selTotal += v
									$scope.chartCanevas.maxSelTotal = if v > $scope.chartCanevas.maxSelTotal then v else $scope.chartCanevas.maxSelTotal
									subline.data[i] = if subline.data[i] then subline.data[i] + v else v
									i++
								if Object.keys(timeline)?
									$scope.chartCanevas.labels = Object.keys(timeline)

				for line in $scope.lines
					for subline in line.sublines
						if subline.displayed
							subline.color = subline.rgb+",1)"
							dataset = {
								fillColor : subline.rgb+",0.5)"
								strokeColor : subline.color
								pointColor : subline.color
								pointStrokeColor : "#fff"
								data: subline.data
								title: subline.name
							}
							$scope.chartCanevas.datasets.push dataset
							$rootScope.statistics_plugin_analytics.lines = $scope.lines
							$rootScope.statistics_plugin_analytics.chartCanevas = $scope.chartCanevas
				drawGraph()

			drawGraph = () ->
				chartCanevas = $("#chartCanevas").get(0)
				chartCanevas.remove() if chartCanevas
				canvas = $(".canvas").get(0)
				analyticsHeight = $(".analytics").get(0).clientHeight * 0.95
				canvas.style.height = analyticsHeight
				width = canvas.clientWidth
				# height = canvas.clientHeight
				$(".canvas").append "<canvas id=\"chartCanevas\" width=\"" + width + "\" height=\"" + analyticsHeight + "\"></canvas>"


				# old opt for chartLine
				# drawOpt =
				# 	scaleOverride: true
				# 	scaleSteps: $scope.chartCanevas.maxSelTotal
				# 	scaleStepWidth: 1
				# 	scaleStartValue: 0
				# 	showTooltips: true

				newopts =
					pointDot: true,
					pointDotRadius: 3,
					pointDotStrokeWidth: 2,
					inGraphDataShow : true,
					inGraphDataPaddingX: -3,
					inGraphDataPaddingY: 3,
					datasetFill : true,
					scaleLabel: "<%=value%>",
					scaleTickSizeRight : 5,
					scaleTickSizeLeft : 5,
					scaleTickSizeBottom : 5,
					scaleTickSizeTop : 15,
					scaleFontSize : 16,
					canvasBorders : false,
					canvasBordersWidth : 3,
					canvasBordersColor : "black",
					graphTitle : "",
					graphTitleFontFamily : "'Arial'",
					graphTitleFontSize : 24,
					graphTitleFontStyle : "bold",
					graphTitleFontColor : "#666",
					graphSubTitle : "",
					graphSubTitleFontFamily : "'Arial'",
					graphSubTitleFontSize : 18,
					graphSubTitleFontStyle : "normal",
					graphSubTitleFontColor : "#666",
					footNote : "",
					footNoteFontFamily : "'Arial'",
					footNoteFontSize : 8,
					footNoteFontStyle : "bold",
					footNoteFontColor : "#666",
					legend : true,
					legendFontFamily : "'Arial'",
					legendFontSize : 12,
					legendFontStyle : "normal",
					legendFontColor : "#666",
					legendBlockSize : 15,
					legendBorders : true,
					legendBordersWidth : 1,
					legendBordersColors : "#666",
					yAxisLeft : true,
					yAxisRight : false,
					xAxisBottom : true,
					xAxisTop : false,
					# yAxisLabel : "Y Axis Label",
					yAxisLabel : "",
					yAxisFontFamily : "'Arial'",
					yAxisFontSize : 16,
					yAxisFontStyle : "normal",
					yAxisFontColor : "#666",
					# xAxisLabel : "pX Axis Label",
					xAxisLabel : "",
					xAxisFontFamily : "'Arial'",
					xAxisFontSize : 16,
					xAxisFontStyle : "normal",
					xAxisFontColor : "#666",
					yAxisUnit : "",
					yAxisUnitFontFamily : "'Arial'",
					yAxisUnitFontSize : 8,
					yAxisUnitFontStyle : "normal",
					yAxisUnitFontColor : "#666",
					annotateDisplay : true,
					spaceTop : 0,
					spaceBottom : 0,
					spaceLeft : 30,
					spaceRight : 0,
					logarithmic: false,
					# showYAxisMin : false,
					rotateLabels : "smart",
					xAxisSpaceOver : 0,
					xAxisSpaceUnder : 0,
					xAxisLabelSpaceAfter : 0,
					xAxisLabelSpaceBefore : 0,
					legendBordersSpaceBefore : 0,
					legendBordersSpaceAfter : 0,
					footNoteSpaceBefore : 0,
					footNoteSpaceAfter : 0,
					startAngle : 0
					# dynamicDisplay : true

				drawData =
					labels: $scope.chartCanevas.labels
					datasets: $scope.chartCanevas.datasets

				if drawData.labels.length == 0 and drawData.datasets.length == 0
					$scope.noanalytics = true
					#if not $rootScope.me.apps || $rootScope.me.apps.length == 0
					#	$scope.analytics_info = "You have no analytics yet. Start by creating an app!"
					#else
					#	$scope.analytics_info = "You have no analytics yet."
					$rootScope.statistics_plugin_analytics.analytics_info = $scope.analytics_info
					$scope.analyticsLoading = false
					return false
				else
					$scope.noanalytics = false
					#$scope.analytics_info = ""
				$rootScope.statistics_plugin_analytics.analytics_info = $scope.analytics_info
				$scope.analyticsLoading = false
				chart = new Chart $("#chartCanevas").get(0).getContext('2d')
				chart.Line drawData, newopts

			initAnalytics()

	])
