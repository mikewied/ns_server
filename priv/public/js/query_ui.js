/**
 * This file contains the HTML and js for the query workbench UI. Putting the HTML here allows
 * us to edit it without touching index.html.
 *
 * This .js file is included at the spot where the HTML would go, so first we just write out
 * the HTML:
 */

document.write('\
    <div ng-controller="mnBucketListController" id="js_query" class="query" style="display:none"> \
      <div id="query_ui"></div> \
        <span class="block nav float_right configure_view"></span> \
        <h1>Query Workbench {{AngularNotWorking}}</h1> \
\
        <div id="sidebar" class="sidebar" style="width:250px;float:left">\
          <div  class="shadow_box" > \
            <div class="hdr"> \
              Query Nodes \
            </div> <!-- end header --> \
            <li ng-repeat="node in nodes"> \
              {{node.name}}	\
            </li> \
            </div> <!-- end shadow box --> \
            <div  class="shadow_box" > \
              <div class="hdr"> \
                Buckets \
              </div> <!-- end header --> \
              <li ng-repeat="bucket in buckets"> \
                {{bucket.name}}	\
              </li> \
            </div> <!-- end shadow_box --> \
          </div> <!-- end sidebar --> \
\
          <div ng-controller="mnQueryController" id="query_panel" class="query_box" style="margin-left:250px"> \
            <div id="query_box" class="query_box"> \
              <div class="shadow_box"> \
                <div class="hdr"> \
                  Query \
                  <a ng-click="query()" class="btn_1 dynamic_enabled" style="float:right;margin:5px"><span>Run</span></a> \
                  <a ng-click="explain()" class="btn_1 dynamic_enabled" style="float:right;margin:5px"><span>Explain</span></a> \
                </div> \
                <ui-codemirror ui-codemirror-opts="queryEditorOptions" ng-model="queryEditorModel"></ui-codemirror> \
              </div> \
            </div> \
\
            <div id="result_box" class="result_box"> \
              <div class="shadow_box"> \
                <div class="hdr"> \
                  Result \
                  <a ng-click="save()" class="btn_1 dynamic_enabled" style="float:right;margin:5px"><span>Save</span></a> \
                </div> \
                <ui-codemirror ui-codemirror-opts="resultsEditorOptions" ng-model="resultsEditorModel"></ui-codemirror> \
              </div> \
            </div> \
          </div> \
        </div>\
');

/*
 * Here is the angular module, which handles the list of buckets
 */

var app = angular.module('mnQuery', ['ui.codemirror']);

app.controller('mnQueryController',
    ['$scope', '$http', function($scope, $http) {

        $scope.editor = {}
        $scope.queryEditorOptions = {
            readOnly: false,
            lineNumbers: true,
            mode: { name: "javascript", json: true },
            onLoad: function(_editor) {
                console.log("Editor: " + _editor);
                _editor.setSize(null, 150);
                _editor.redraw();
                $scope.editor = _editor;
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
            console.log("Clicked the query button");

            $http({
                method: 'POST',
                url: '/query',
                data: $.param({node : 'http://127.0.0.1:9499', query : $scope.queryEditorModel}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).
                success(function(data, status, headers, config) {
                    $scope.resultsEditorModel = angular.toJson(data, true);
                }).
                error(function(data, status, headers, config) {
                    $scope.resultsEditorModel = angular.toJson(data, true);
                });
        };

        $scope.explain = function() {
            $scope.resultsEditorModel = "Explain doesn't work yet";
        };

        $scope.save = function() {
            $scope.resultsEditorModel = "Save doesn't work yet";
        };

    }
]);

app.controller('mnBucketListController',
    ['$scope', function($scope) {
        $scope.AngularNotWorking = "";
        $scope.buckets = [];
        $scope.nodes = [];

        $scope.clearBucket = function() {$scope.buckets.length = 0;}

        $scope.updateBucket = function() {$scope.buckets.length = $scope.buckets.length;}

        $scope.addBucket = function(bucket) {
            $scope.buckets.push(bucket);
        };

        // hook into the Cells network to get an updated list of buckets
        DAL.cells.bucketsListCell.getValue(function (buckets) {
            _.each(buckets, function(bucket) {
                $scope.addBucket(bucket);
            });
            $scope.$apply($scope.updateBucket); // force an update
        });

        // now lets get a list of nodes from the Cell network
        DAL.cells.serversCell.subscribeValue(function (servers) {
            if (!servers) // sometimes we get called with undefined
                return;

            $scope.nodes = [];

            if (servers.active) for (var i=0; i < servers.active.length; i++) if (servers.active[i])
            {
                if (servers.active[i].services.indexOf("n1ql") > -1)
                {
                    $scope.nodes.push({"name":servers.active[i].hostname});
                }
            }
            $scope.$apply($scope.updateBucket); // force an update
        });
    }
]);

/**
 * Here is the Javascript object, QuerySection, which is referred to in app.js, which makes
 * visible our UI when the user selects the appropriate tab at the top of the UI
 */

//var appElement = document.querySelector("[id=js_query]");

var QuerySection = {

		/**
		 * This method is called by app.js as part of the UI initialization
		 */
		init: function () {

		},
		
		/**
		 * This method is called when we leave the tab
		 */
		onLeave: function () {
			console.log("on leave query");		  
		},

		onEnter: function () 
		{
			console.log("on enter query");
        },

		domId: function (sec) {
			return 'query';
		}
};