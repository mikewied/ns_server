/**
 * This file contains the HTML and js for the query workbench UI. Putting the HTML here allows
 * us to edit it without touching index.html.
 *
 * This .js file is included at the spot where the HTML would go, so first we just write out
 * the HTML:
 */

document.write('\
	   <div ng-controller="QueryUIController" id="js_query" class="query" style="display:none"> \
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
		<div id="query_box" class="query_box" style="margin-left:250px"> \
            <div  class="shadow_box" > \
            <div class="hdr"> \
				Query \
                  <a class="btn_1 dynamic_enabled" style="float:right;margin:5px" id="query_run"><span>Run</span></a> \
                  <a class="btn_1 dynamic_enabled" style="float:right;margin:5px" id="query_explain"><span>Explain</span></a> \
		    </div> \
              <textarea id="query_doc" spellcheck="false" cols=30 rows="20"></textarea> \
            </div> \
          </div> \
\
          <div id="result_box" class="result_box" style="margin-left:250px"> \
            <div class="shadow_box"> \
            <div class="hdr"> \
				Result \
                  <a class="btn_1 dynamic_enabled" style="float:right;margin:5px" id="query_result_save"><span>Save</span></a> \
              </div> \
             <textarea id="result_doc" spellcheck="false" cols="30" rows="20"></textarea> \
            </div> \
          </div> \
         </div>\
');

/**
 * Here is the Javascript object, QuerySection, which is referred to in app.js, which makes
 * visible our UI when the user selects the appropriate tab at the top of the UI
 */

//var appElement = document.querySelector("[id=js_query]");

var QuerySection = {
		queryEditor: {}, // the text editor where queries are entered
		resultEditor: {},// the text editorwhere results appear
		
		/*
		 * Here is the angular module, which handles the list of buckets 
		 */

		app: angular.module('cbApp', [])
		.controller('QueryUIController', ['$scope', function($scope) {
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

		}]),

		/**
		 * This method is called by app.js as part of the UI initialization
		 */
		init: function () {
			var self = this;
			
			
			queryEditor = CodeMirror.fromTextArea($("#query_doc")[0], {
		        lineNumbers: true,
		        matchBrackets: false,
		        tabSize: 2,
		        mode: { name: "javascript", json: true },
		        theme: 'default',
		        autofocus: true
		       //readOnly: 'nocursor',
		       // onChange: jsonCodeEditorOnChange
		      });
			

	    	resultEditor = CodeMirror.fromTextArea($("#result_doc")[0], {
		        lineNumbers: true,
		        matchBrackets: false,
		        tabSize: 2,
		        mode: { name: "javascript", json: true },
		        theme: 'default',
		        readOnly: 'cursor'
		       // onChange: jsonCodeEditorOnChange
		      });
			
	    	var queryRunBtn = $('#query_run');
		    var queryExplainBtn = $('#query_explain');
		    var resultSaveBtn = $('#query_result_save');

		    queryRunBtn.click(function (e) {
		    	resultEditor.setValue("");
		    	var url = "http://127.0.0.1:9000/query";
		    	var client = new XMLHttpRequest();
		    	client.open("POST",url,false);
		    	client.send(null);
		    	//client.send(queryEditor.getValue());
		    	
		    	if (client.status == 200)
		    		resultEditor.setValue(url + "\n" + "Query succeeeded: " + client.responseText);
		    	else
		    		resultEditor.setValue(url + "\n" + "Query failure, status: " + client.status +
		    				"\n" + client.statusText + "\n" + client.responseText);
		    	
		    	//console.log("Run query! " + queryEditor.getValue());
		    	
		    });

		    queryExplainBtn.click(function (e) {
		    	resultEditor.setValue("");
		    	var url = "http://127.0.0.1:9000/pools/nodes";
		    	var client = new XMLHttpRequest();
		    	client.open("GET",url,false);
		    	client.send(null);
		    	//client.send(queryEditor.getValue());
		    	
		    	if (client.status == 200)
		    		resultEditor.setValue(url + "\n" + "Query succeeeded: " + client.responseText);
		    	else
		    		resultEditor.setValue(url + "\n" + "Query failure, status: " + client.status +
		    				"\n" + client.statusText + "\n" + client.responseText);
		    	
		    	//console.log("Run query! " + queryEditor.getValue());
		    	
		    });

		    resultSaveBtn.click(function (e) {
		    	
		    	console.log("save result!");
		    });

		},
		
		/**
		 * This method is called when we leave the tab
		 */
		onLeave: function () {
			console.log("on leave query");		  
			//$("#js_query").hide();
		},

		onEnter: function () 
		{
			console.log("on enter query");

			if (!queryEditor.getValue())
				queryEditor.setValue("select * from ");
			queryEditor.focus();
			
			//$("#js_query").show();
		},

		domId: function (sec) {
			return 'query';
		}
};