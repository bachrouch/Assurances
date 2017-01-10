/* vim: fdm=marker
 */
angular.module('app')
  .controller('SavingsPolicyChartCtrl', ['$scope', 'savingsDraft',
    'savingsContract', 'savingsQuote',
    function ($scope, savingsDraft, savingsContract, savingsQuote) {
      function calcChartYears(sits) {
        // {{{
        var res = Object.keys(sits);
        res = res.map(function (v) {
            return parseInt(v);
          })
          .sort();
        return res;
        // }}}
      }

      function calcChartCumul(sits, labels, series, colours, data) {
        // {{{
        series.push('Epargne');
        colours.push({
          fillColor: 'rgba(70,191,189,0.2)',
          strokeColor: 'rgba(70,191,189,1)',
          pointColor: 'rgba(70,191,189,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(70,191,189,0.8)'
        });
        data.push(labels.map(function (y) {
          return Math.round(sits[y].cumul);
        }));
        // }}}
      }

      function calcChartDeath(sits, labels, series, colours, data) {
        // {{{
        var hasDeath = sits[labels[0]].d > 0;
        if (hasDeath) {
          series.push('Cap. Décès');
          colours.push({
            fillColor: 'rgba(247,70,74,0.2)',
            strokeColor: 'rgba(247,70,74,1)',
            pointColor: 'rgba(247,70,74,1)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(247,70,74,0.8)'
          });
          data.push(labels.map(function (y) {
            var r;
            var d = sits[y].d;
            if (d) {
              r = Math.max(d + (sits[y - 1] ? sits[y - 1].cumul : 0),
                sits[y].cumul);
            }
            else {
              r = sits[y].cumul;
            }
            return Math.round(r);
          }));
        }
        // }}}
      }

      function calcChartDeathAcc(sits, labels, series, colours, data) {
        // {{{
        var hasDeathAcc = sits[labels[0]].ad > 0;
        if (hasDeathAcc) {
          series.push('Cap. Décès Acc');
          colours.push({
            fillColor: 'rgba(153,0,204,0.2)',
            strokeColor: 'rgba(153,0,204,0.6)',
            pointColor: 'rgba(153,0,204,0.6)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(153,0,204,0.4)'
          });
          data.push(labels.map(function (y) {
            var r;
            var ad = sits[y].ad;
            if (ad) {
              r = Math.max(ad + (sits[y - 1] ? sits[y - 1].cumul : 0),
                sits[y].cumul);
            }
            else {
              r = sits[y].cumul;
            }
            return Math.round(r);
          }));
        }
        // }}}
      }

      function calcChartInval(sits, labels, series, colours, data) {
        // {{{
        var hasInval = sits[labels[0]].i > 0;
        if (hasInval) {
          series.push('Cap. Inval');
          colours.push({
            fillColor: 'rgba(253,180,92,0.2)',
            strokeColor: 'rgba(253,180,92,1)',
            pointColor: 'rgba(253,180,92,1)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(253,180,92,0.8)'
          });
          data.push(labels.map(function (y) {
            var r;
            var i = sits[y].i;
            if (i) {
              r = Math.max(i + (sits[y - 1] ? sits[y - 1].cumul : 0),
                sits[y].cumul);
            }
            else {
              r = sits[y].cumul;
            }
            return Math.round(r);
          }));
        }
        // }}}
      }

      function calcChartInvalAcc(sits, labels, series, colours, data) {
        // {{{
        var hasInvalAcc = sits[labels[0]].ai > 0;
        if (hasInvalAcc) {
          series.push('Cap. Inval Acc');
          colours.push({
            fillColor: 'rgba(255,255,0,0.2)',
            strokeColor: 'rgba(255,255,0,0.6)',
            pointColor: 'rgba(255,255,0,0.6)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(255,255,0,1)'
          });
          data.push(labels.map(function (y) {
            var r;
            var ai = sits[y].ai;
            if (ai) {
              r = Math.max(ai + (sits[y - 1] ? sits[y - 1].cumul : 0),
                sits[y].cumul);
            }
            else {
              r = sits[y].cumul;
            }
            return Math.round(r);
          }));
        }
        // }}}
      }

      function calc() {
        // {{{
        var sits = $scope.sits;
        if (Object.keys(sits)
          .length > 0) {
          var labels = calcChartYears(sits);
          var series = [];
          var colours = [];
          var data = [];
          calcChartInval(sits, labels, series, colours, data);
          calcChartInvalAcc(sits, labels, series, colours, data);
          calcChartDeath(sits, labels, series, colours, data);
          calcChartDeathAcc(sits, labels, series, colours, data);
          calcChartCumul(sits, labels, series, colours, data);
          $scope.computed.labels = labels;
          $scope.computed.series = series;
          $scope.computed.colours = colours;
          $scope.computed.data = data;
        }
        else {
          $scope.computed.labels = [];
          $scope.computed.series = [];
          $scope.computed.colours = [];
          $scope.computed.data = [];
        }
        // }}}
      }
      $scope.computed = {
        // {{{
        labels: [],
        series: [],
        colours: [],
        data: [],
        // }}}
      };
      $scope.init = function (obj) {
        // {{{
        $scope.$on('started', function () {
          var policy;
          if (obj === 'draft') {
            policy = savingsDraft;
          }
          else if (obj === 'contract') {
            policy = savingsContract;
          }
          else if (obj === 'quote') {
            policy = savingsQuote;
          }
          else {
            throw new Error('unknown policy obj:' + obj);
          }
          $scope.sits = policy.sits;
          $scope.$watch(function () {
            return policy.getEtag();
          }, calc);
        });
        // }}}
      };
    }
  ]);
