angular.module('mnQuery').controller('mnQueryController',
  function ($scope, $modal, mnHelper, mnQueryService) {

    $scope.queryEditorOptions = {
      readOnly: false,
      lineNumbers: true,
      mode: { name: "javascript", json: true },
      onLoad: function(_editor) {
        _editor.setSize(null, 150);
      }
    };

    $scope.queryEditorModel = "Type a query here...";

    $scope.resultsEditorOptions = {
      readOnly: 'cursor',
      lineNumbers: true,
      mode: { name: "javascript", json: true },
    };
    $scope.resultsEditorModel = "";

    $scope.query = function() {
      mnQueryService.query({node : 'http://127.0.0.1:9499', query : $scope.queryEditorModel})
        .success(function(data, status, headers, config) {
          $scope.resultsEditorModel = angular.toJson(data, true);
        })
        .error(function(data, status, headers, config) {
          $scope.resultsEditorModel = angular.toJson(data, true);
        });
    };

    $scope.explain = function() {
      $scope.resultsEditorModel = "Explain doesn't work yet";
    };

    $scope.save = function() {
      $scope.resultsEditorModel = "Save doesn't work yet";
    };

});