angular.module('mnQuery').controller('mnQueryController',
  function ($scope, $modal, mnHelper, nodes, buckets, mnQueryService) {

    function applyNodes(nodes) {
      $scope.nodeSelector = { nodes: [], selected: '[None]' };
      _.each(nodes.allNodes, function(node) {
        if (_.contains(node.services, 'n1ql')) {
            $scope.nodeSelector.nodes.push(node.hostname);
        }
      });
      if (_.size($scope.nodeSelector.nodes) > 0) {
        $scope.nodeSelector.selected = _.first($scope.nodeSelector.nodes);
      }
    }
    applyNodes(nodes);

    function applyBuckets(buckets) {
        $scope.bucketSelector = { names: [], selected: '[None]' };
        _.each(buckets, function (bucket) {
            if (_.contains(bucket.bucketType, 'membase')) {
              $scope.bucketSelector.names.push(bucket.name);
            }
        });
        if (_.size($scope.bucketSelector.names) > 0) {
          $scope.bucketSelector.selected = _.first($scope.bucketSelector.names);
        }
    }
    applyBuckets(buckets);

    $scope.queryEditorOptions = {
      mode: 'text/x-n1ql',
      lineNumbers: true,
      indentWithTabs: true,
      smartIndent: true,
      autofocus: true,
      extraKeys: {"Ctrl-Space": "autocomplete"},
      hintOptions: {
        tables: {
          'beer-sample': { }
        }
      },
      onLoad: function(_editor) {
        _editor.setSize(null, 150);
      }
    };
    $scope.queryEditorModel = "Enter a query here...";

    $scope.resultsEditorOptions = {
      readOnly: 'cursor',
      lineNumbers: true,
      mode: { name: "javascript", json: true },
    };
    $scope.resultsEditorModel = "";
    $scope.lastResult = {
        hide: true,
        status: 'N/A',
        elapsedTime: 'N/A',
        executionTime: 'N/A',
        resultCount: 'N/A',
        resultSize: 'N/A',
        results: ''
    };

    function executeQuery(queryText) {
      $scope.queryErrors = []
      if (_.size($scope.nodeSelector.nodes) == 0) {
        $scope.queryErrors.push('You must add query nodes in order to run queries');
      }

      if (_.size($scope.bucketSelector.names) == 0) {
        $scope.queryErrors.push('You must add data buckets in order to run queries');
      }

      if (_.size($scope.queryErrors) > 0) {
        $modal.open({
          templateUrl: 'mn_admin/mn_query/errors_dialog/mn_query_errors_dialog.html',
          scope: $scope
        }).result['finally'](function () {
          delete $scope.queryErrors;
        });
        return;
      }

      var remote = 'http://' + $scope.nodeSelector.selected.split(':')[0] + ':' + 9499;
      mnQueryService.query({node : remote, query : queryText})
        .success(function(data, status, headers, config) {
          $scope.lastResult.hide = false;
          $scope.lastResult.status = data.status;
          $scope.lastResult.elapsedTime = data.metrics.elapsedTime;
          $scope.lastResult.executionTime = data.metrics.executionTime;
          $scope.lastResult.resultCount = data.metrics.resultCount;
          $scope.lastResult.resultSize = data.metrics.resultSize + 'B';
          $scope.lastResult.result = angular.toJson(data.results, true);
        })
        .error(function(data, status, headers, config) {
          $scope.lastResult.hide = false;
          $scope.lastResult.status = data.status;
          $scope.lastResult.elapsedTime = data.metrics.elapsedTime;
          $scope.lastResult.executionTime = data.metrics.executionTime;
          $scope.lastResult.resultCount = data.metrics.resultCount;
          $scope.lastResult.resultSize = data.metrics.resultSize + 'B';
          $scope.lastResult.result = angular.toJson(data.errors, true);
        });
    }

    $scope.query = function() {
      executeQuery($scope.queryEditorModel);
    };

    $scope.explain = function() {
      var trimmedQuery = $scope.queryEditorModel.trim();
      if (trimmedQuery.substr(0, 7).toLowerCase().localeCompare('explain') != 0) {
        trimmedQuery = 'EXPLAIN ' + trimmedQuery;
      }
      executeQuery(trimmedQuery);
    };

    $scope.save = function() {
      $scope.lastResult.hide = true;
      $scope.lastResult.result = "Save does not work yet";
    };
});