angular.module('mnQueryService').factory('mnQueryService',
  function ($q, mnHttp, mnTasksDetails) {
    var mnQueryService = {};

    mnQueryService.query = function(settings) {
        return mnHttp.post("/query", settings);
    };

    return mnQueryService;
});