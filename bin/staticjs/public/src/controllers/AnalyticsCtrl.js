var sugar,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

sugar = require('sugar');

module.exports = function(app) {
  return app.controller('statistics_plugin_AnalyticsCtrl', [
    '$scope', '$state', '$rootScope', 'statistics_plugin_AnalyticsService', 'AppService', function($scope, $state, $rootScope, statistics_plugin_AnalyticsService, AppService) {
      var Line, Subline, defaultColor, drawGraph, filter, getGraphData, initAnalytics, localUpdateLine, updateChartData, updateLineActive, _i, _j, _len, _len1, _ref, _ref1;
      console.log("IN statistics_plugin_AnalyticsCtrl");
      AppService.all().then(function(apps) {
        $scope.apps = apps;
        return console.log("$scope.apps", $scope.apps);
      }).fail(function(e) {
        return console.log(e);
      })["finally"](function() {
        return $scope.$apply();
      });
      if (!$rootScope.statistics_plugin_analytics) {
        $rootScope.statistics_plugin_analytics = {};
      } else {
        $scope.chartCanevas = $rootScope.statistics_plugin_analytics.chartCanevas;
        $scope.startDate = $rootScope.statistics_plugin_analytics.startDate;
        $scope.timeUnit = $rootScope.statistics_plugin_analytics.timeUnit;
        $scope.lines = $rootScope.statistics_plugin_analytics.lines;
        $scope.analytics_info = $rootScope.statistics_plugin_analytics.analytics_info;
      }
      initAnalytics = function() {
        $scope.analyticsLoading = true;
        if (!$scope.startDate) {
          $scope.changeStartDate($scope.startDates[3]);
        }
        if ($scope.chartCanevas.labels && $scope.chartCanevas.labels.length > 0) {
          return drawGraph();
        } else {
          return localUpdateLine($scope.lines[0]);
        }
      };
      $scope.startDates = [
        {
          name: "Past 1 days",
          value: "1",
          unit: "h",
          unitname: "Hours"
        }, {
          name: "Past 3 days",
          value: "3",
          unit: "d",
          unitname: "Days"
        }, {
          name: "Past 5 days",
          value: "5",
          unit: "d",
          unitname: "Days"
        }, {
          name: "Past 15 days",
          value: "15",
          unit: "d",
          unitname: "Days"
        }, {
          name: "Past month",
          value: "31",
          unit: "d",
          unitname: "Days"
        }, {
          name: "Past 3 month",
          value: "92",
          unit: "m",
          unitname: "Months"
        }, {
          name: "Past 6 month",
          value: "183",
          unit: "m",
          unitname: "Months"
        }, {
          name: "Forever",
          value: "0",
          unit: "m",
          unitname: "Months"
        }
      ];
      $scope.changeStartDate = function(selected) {
        var s;
        $scope.startDate = selected;
        $rootScope.statistics_plugin_analytics.startDate = $scope.startDate;
        return $scope.changeUnit(s = {
          name: selected.unitname,
          value: selected.unit
        });
      };
      $scope.timeUnits = [
        {
          name: "Hours",
          value: "h",
          enabled: true
        }, {
          name: "Days",
          value: "d",
          enabled: true
        }, {
          name: "Months",
          value: "m",
          enabled: true
        }
      ];
      $scope.changeUnit = function(selected) {
        $scope.timeUnit = selected;
        $rootScope.statistics_plugin_analytics.timeUnit = $scope.timeUnit;
        return getGraphData();
      };
      $scope.filterUnit = function(selected) {
        if ($scope.startDate.value > 3 && selected.value === "h") {
          return false;
        }
        if ($scope.startDate.value > 92 && (selected.value === "h" || selected.value === "d")) {
          return false;
        }
        if ($scope.startDate.value < 31 && selected.value === "m") {
          return false;
        }
        return true;
      };
      $scope.filters = [
        {
          name: "connexions",
          value: "co",
          success: false,
          error: false,
          allowuniq: true
        }, {
          name: "connexions success",
          value: "co",
          success: true,
          error: false,
          allowuniq: true
        }, {
          name: "connexions fails",
          value: "co",
          success: false,
          error: true,
          allowuniq: true
        }, {
          name: "requests",
          value: "req",
          success: false,
          error: false,
          allowuniq: false
        }
      ];
      defaultColor = "#474747";
      Line = (function() {
        function Line(app, filter) {
          var counter, provider, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
          this.app = app != null ? app : {};
          this.filter = filter;
          this.active = false;
          this.sublines = [];
          if (this.app && Object.keys(this.app).length !== 0) {
            if (this.app.keysets.length > 1) {
              this.sublines.push(new Subline(this.filter, null, this.app.key, this.app.name));
            }
            _ref = this.app.keysets;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              provider = _ref[_i];
              this.sublines.push(new Subline(this.filter, provider, this.app.key, this.app.name));
            }
          } else {
            counter = 0;
            _ref1 = $rootScope.me.apps;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              app = _ref1[_j];
              _ref2 = app.keysets;
              for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                provider = _ref2[_k];
                counter++;
                this.sublines.push(new Subline(this.filter, provider, null, null));
              }
            }
            if (counter > 1) {
              this.sublines.unshift(new Subline(this.filter, null, null, null));
            }
          }
        }

        return Line;

      })();
      Subline = (function() {
        function Subline(filter, provider, appkey, appname) {
          this.resetDisplay = __bind(this.resetDisplay, this);
          this.filter = sugar.clone(filter, true);
          if (this.filter.allowuniq) {
            this.filter.unique = false;
          }
          this.provider = provider;
          this.appkey = appkey;
          this.allapps = this.appkey ? false : true;
          this.appname = appname;
          this.active = false;
          this.displayed = false;
          this.updateValueName();
          this.resetDisplay();
        }

        Subline.prototype.updateValueName = function() {
          this.name = this.filter.name;
          this.value = this.filter.value;
          if (this.filter.allowuniq && this.filter.unique) {
            this.value += ":uid";
            this.name += " (unique)";
          }
          if (this.allapps) {
            this.value += ":allapps";
          } else {
            this.value += ":a";
            this.value += ":" + this.appkey;
            this.name = this.appname + " " + this.name;
          }
          if (this.provider) {
            this.value += ":p:" + this.provider;
            this.name += " with " + this.provider;
          }
          if (this.filter.success) {
            this.value += ":success";
          }
          if (this.filter.error) {
            return this.value += ":error";
          }
        };

        Subline.prototype.resetDisplay = function() {
          this.total = null;
          this.selTotal = null;
          this.color = defaultColor;
          return this.data = [];
        };

        return Subline;

      })();
      if (!$scope.lines) {
        $scope.lines = [];
        _ref = $scope.filters;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          filter = _ref[_i];
          $scope.lines.push(new Line(null, sugar.clone(filter, true)));
          _ref1 = $rootScope.me.apps;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            app = _ref1[_j];
            $scope.lines.push(new Line(sugar.clone(app, true), sugar.clone(filter, true)));
          }
        }
      }
      localUpdateLine = function(line) {
        var index, subline, _k, _l, _len2, _len3, _ref2, _ref3;
        line.active = !line.active;
        if (line.active) {
          _ref2 = line.sublines;
          for (index = _k = 0, _len2 = _ref2.length; _k < _len2; index = ++_k) {
            subline = _ref2[index];
            subline.updateValueName();
            if (index === 0) {
              subline.active = true;
              subline.displayed = true;
            }
          }
        } else {
          _ref3 = line.sublines;
          for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
            subline = _ref3[_l];
            subline.active = false;
            subline.displayed = false;
            subline.filter.unique = false;
          }
        }
        return getGraphData();
      };
      $scope.updateLine = function(line, event) {
        if (event) {
          event.stopPropagation();
          event.preventDefault();
        }
        if (line.sublines.length > 0) {
          return localUpdateLine(line);
        }
      };
      updateLineActive = function(line) {
        var subline, _k, _len2, _ref2, _results;
        line.active = false;
        _ref2 = line.sublines;
        _results = [];
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          subline = _ref2[_k];
          if (subline.active) {
            line.active = true;
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      $scope.updateSubline = function(subline, line, event) {
        if (event) {
          event.stopPropagation();
          event.preventDefault();
        }
        if (subline) {
          subline.updateValueName();
          subline.active = !subline.active;
          subline.displayed = subline.active;
          if (subline.active) {
            line.active = true;
          }
          if (!subline.active) {
            updateLineActive(line);
          }
          return getGraphData();
        }
      };
      $scope.updateSublineUnique = function(subline, line, event) {
        if (event) {
          event.stopPropagation();
          event.preventDefault();
        }
        if (subline.filter.allowuniq) {
          subline.filter.unique = !subline.filter.unique;
        }
        subline.updateValueName();
        subline.active = true;
        subline.displayed = true;
        if (subline.active) {
          line.active = true;
        }
        if (!subline.active) {
          updateLineActive(line);
        }
        return getGraphData();
      };
      $scope.hoverdropdownClick = function(event) {
        if (event) {
          event.stopPropagation();
          return event.preventDefault();
        }
      };
      $scope.displaySubline = function(subline) {
        subline.displayed = !subline.displayed;
        return getGraphData();
      };
      $scope.removeSubline = function(subline, line) {
        subline.active = false;
        subline.displayed = false;
        updateLineActive(line);
        return getGraphData();
      };
      $scope.displayedSubline = function(subline) {
        return subline.displayed && subline.active;
      };
      $scope.undisplayedSubline = function(subline) {
        return !subline.displayed && subline.active;
      };
      $scope.activeLine = function(line) {
        return line.active;
      };
      $scope.displayedSublines = function(line) {
        var displayed, subline, _k, _len2, _ref2;
        if (!line.active) {
          return false;
        }
        displayed = false;
        _ref2 = line.sublines;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          subline = _ref2[_k];
          if (subline.displayed && subline.active) {
            displayed = true;
            break;
          }
        }
        return displayed;
      };
      $scope.undisplayedSublines = function(line) {
        var subline, undisplayed, _k, _len2, _ref2;
        if (!line.active) {
          return false;
        }
        undisplayed = false;
        _ref2 = line.sublines;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          subline = _ref2[_k];
          if (!subline.displayed && subline.active) {
            undisplayed = true;
            break;
          }
        }
        return undisplayed;
      };
      if (!$scope.chartCanevas) {
        $scope.chartCanevas = {};
        $scope.chartCanevas.labels = [];
        $scope.chartCanevas.datasets = [];
        $scope.chartCanevas.maxSelTotal = 0;
      }
      getGraphData = (function(_this) {
        return function() {
          var appkeys, dateStart, line, opts, subline, sublinesValues, value, _k, _l, _len2, _len3, _len4, _m, _ref2, _ref3, _ref4;
          sublinesValues = [];
          appkeys = [];
          _ref2 = $scope.lines;
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            line = _ref2[_k];
            if (line.active) {
              _ref3 = line.sublines;
              for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
                subline = _ref3[_l];
                if (subline.displayed && subline.active) {
                  if (subline.allapps) {
                    _ref4 = $rootScope.me.apps;
                    for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
                      app = _ref4[_m];
                      value = subline.value;
                      sublinesValues.push(value.replace(":allapps", ":allapps:" + app.key));
                      appkeys.push(app.key);
                    }
                  } else {
                    sublinesValues.push(subline.value);
                    appkeys.push(subline.appkey);
                  }
                }
              }
            }
          }
          sublinesValues = sublinesValues.unique();
          if (sublinesValues.length < 1) {
            $scope.chartCanevas.datasets = [];
            return updateChartData([], [], []);
          } else {
            dateStart = new Date();
            dateStart.setTime(dateStart.getTime() - (24 * 3600 * 1000 * $scope.startDate.value));
            opts = {
              start: dateStart.getTime(),
              unit: $scope.timeUnit.value,
              filters: sublinesValues,
              appkeys: appkeys
            };
            return AnalyticsService.getGraphData(opts, function(successdata, status) {
              var filters, timelines, totals;
              totals = successdata.data.totals;
              timelines = successdata.data.timelines;
              filters = successdata.data.params.filters.split(",");
              return updateChartData(filters, timelines, totals);
            }, function(errordata, status) {});
          }
        };
      })(this);
      updateChartData = function(filters, timelines, totals) {
        var aPos, allappsValue, dataset, endPos, i, k, line, subline, timeline, total, v, value, _k, _l, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _m, _n, _o, _p, _q, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
        $scope.chartCanevas.datasets = [];
        $scope.chartCanevas.maxSelTotal = 0;
        _ref2 = $scope.lines;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          line = _ref2[_k];
          _ref3 = line.sublines;
          for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
            subline = _ref3[_l];
            subline.resetDisplay();
          }
        }
        for (_m = 0, _len4 = filters.length; _m < _len4; _m++) {
          value = filters[_m];
          total = totals.shift();
          timeline = timelines.shift();
          aPos = value.search(":allapps:");
          endPos = value.search(":p:");
          if (endPos === -1) {
            endPos = value.search(":success");
          }
          if (endPos === -1) {
            endPos = value.search(":error");
          }
          if (endPos === -1) {
            endPos = value.length;
          }
          allappsValue = aPos !== -1 ? value.replace(value.substring(aPos, endPos), ":allapps") : null;
          _ref4 = $scope.lines;
          for (_n = 0, _len5 = _ref4.length; _n < _len5; _n++) {
            line = _ref4[_n];
            _ref5 = line.sublines;
            for (_o = 0, _len6 = _ref5.length; _o < _len6; _o++) {
              subline = _ref5[_o];
              if (subline.displayed && ((subline.value === value && !subline.allapps) || (subline.allapps && subline.value === allappsValue))) {
                if (subline.color === defaultColor) {
                  subline.rgb = 'rgba(' + (Math.floor((Math.random() * 210) + 30)) + ',' + (Math.floor((Math.random() * 210) + 30)) + ',' + (Math.floor((Math.random() * 210) + 30));
                }
                if (!subline.total) {
                  subline.total = 0;
                }
                subline.total += !total ? +"0" : parseInt(total, 10);
                if (!subline.selTotal) {
                  subline.selTotal = 0;
                }
                i = 0;
                for (k in timeline) {
                  v = timeline[k];
                  subline.selTotal += v;
                  $scope.chartCanevas.maxSelTotal = v > $scope.chartCanevas.maxSelTotal ? v : $scope.chartCanevas.maxSelTotal;
                  subline.data[i] = subline.data[i] ? subline.data[i] + v : v;
                  i++;
                }
                if (Object.keys(timeline) != null) {
                  $scope.chartCanevas.labels = Object.keys(timeline);
                }
              }
            }
          }
        }
        _ref6 = $scope.lines;
        for (_p = 0, _len7 = _ref6.length; _p < _len7; _p++) {
          line = _ref6[_p];
          _ref7 = line.sublines;
          for (_q = 0, _len8 = _ref7.length; _q < _len8; _q++) {
            subline = _ref7[_q];
            if (subline.displayed) {
              subline.color = subline.rgb + ",1)";
              dataset = {
                fillColor: subline.rgb + ",0.5)",
                strokeColor: subline.color,
                pointColor: subline.color,
                pointStrokeColor: "#fff",
                data: subline.data,
                title: subline.name
              };
              $scope.chartCanevas.datasets.push(dataset);
              $rootScope.statistics_plugin_analytics.lines = $scope.lines;
              $rootScope.statistics_plugin_analytics.chartCanevas = $scope.chartCanevas;
            }
          }
        }
        return drawGraph();
      };
      drawGraph = function() {
        var analyticsHeight, canvas, chart, chartCanevas, drawData, newopts, width;
        chartCanevas = $("#chartCanevas").get(0);
        if (chartCanevas) {
          chartCanevas.remove();
        }
        canvas = $(".canvas").get(0);
        analyticsHeight = $(".analytics").get(0).clientHeight * 0.95;
        canvas.style.height = analyticsHeight;
        width = canvas.clientWidth;
        $(".canvas").append("<canvas id=\"chartCanevas\" width=\"" + width + "\" height=\"" + analyticsHeight + "\"></canvas>");
        newopts = {
          pointDot: true,
          pointDotRadius: 3,
          pointDotStrokeWidth: 2,
          inGraphDataShow: true,
          inGraphDataPaddingX: -3,
          inGraphDataPaddingY: 3,
          datasetFill: true,
          scaleLabel: "<%=value%>",
          scaleTickSizeRight: 5,
          scaleTickSizeLeft: 5,
          scaleTickSizeBottom: 5,
          scaleTickSizeTop: 15,
          scaleFontSize: 16,
          canvasBorders: false,
          canvasBordersWidth: 3,
          canvasBordersColor: "black",
          graphTitle: "",
          graphTitleFontFamily: "'Arial'",
          graphTitleFontSize: 24,
          graphTitleFontStyle: "bold",
          graphTitleFontColor: "#666",
          graphSubTitle: "",
          graphSubTitleFontFamily: "'Arial'",
          graphSubTitleFontSize: 18,
          graphSubTitleFontStyle: "normal",
          graphSubTitleFontColor: "#666",
          footNote: "",
          footNoteFontFamily: "'Arial'",
          footNoteFontSize: 8,
          footNoteFontStyle: "bold",
          footNoteFontColor: "#666",
          legend: true,
          legendFontFamily: "'Arial'",
          legendFontSize: 12,
          legendFontStyle: "normal",
          legendFontColor: "#666",
          legendBlockSize: 15,
          legendBorders: true,
          legendBordersWidth: 1,
          legendBordersColors: "#666",
          yAxisLeft: true,
          yAxisRight: false,
          xAxisBottom: true,
          xAxisTop: false,
          yAxisLabel: "",
          yAxisFontFamily: "'Arial'",
          yAxisFontSize: 16,
          yAxisFontStyle: "normal",
          yAxisFontColor: "#666",
          xAxisLabel: "",
          xAxisFontFamily: "'Arial'",
          xAxisFontSize: 16,
          xAxisFontStyle: "normal",
          xAxisFontColor: "#666",
          yAxisUnit: "",
          yAxisUnitFontFamily: "'Arial'",
          yAxisUnitFontSize: 8,
          yAxisUnitFontStyle: "normal",
          yAxisUnitFontColor: "#666",
          annotateDisplay: true,
          spaceTop: 0,
          spaceBottom: 0,
          spaceLeft: 30,
          spaceRight: 0,
          logarithmic: false,
          rotateLabels: "smart",
          xAxisSpaceOver: 0,
          xAxisSpaceUnder: 0,
          xAxisLabelSpaceAfter: 0,
          xAxisLabelSpaceBefore: 0,
          legendBordersSpaceBefore: 0,
          legendBordersSpaceAfter: 0,
          footNoteSpaceBefore: 0,
          footNoteSpaceAfter: 0,
          startAngle: 0
        };
        drawData = {
          labels: $scope.chartCanevas.labels,
          datasets: $scope.chartCanevas.datasets
        };
        if (drawData.labels.length === 0 && drawData.datasets.length === 0) {
          $scope.noanalytics = true;
          $rootScope.statistics_plugin_analytics.analytics_info = $scope.analytics_info;
          $scope.analyticsLoading = false;
          return false;
        } else {
          $scope.noanalytics = false;
        }
        $rootScope.statistics_plugin_analytics.analytics_info = $scope.analytics_info;
        $scope.analyticsLoading = false;
        chart = new Chart($("#chartCanevas").get(0).getContext('2d'));
        return chart.Line(drawData, newopts);
      };
      return initAnalytics();
    }
  ]);
};
