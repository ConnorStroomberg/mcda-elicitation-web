'use strict';
define(function(require) {
  var angular = require("angular");
  var _ = require("underscore");
  var Config = require("app/js/config");

  require('mmfoundation');
  require('angular-ui-router');
  require('angular-resource');
  require('app/js/services/remarks');
  require('app/js/services/routeFactory');
  require('app/js/services/workspaceResource');
  require('app/js/services/workspaceService');
  require('app/js/services/scenarioResource');
  require('app/js/services/taskDependencies');
  require('app/js/services/errorHandling');
  require('app/js/services/hashCodeService');
  require('app/js/services/pataviService');
  require('app/js/services/partialValueFunction');
  require('app/js/services/util');
  require('app/js/services/scaleRangeService');
  require('app/js/controllers');
  require('app/js/directives');
  require('error-reporting');

  var dependencies = [
    'ngResource',
    'ui.router',
    'mm.foundation',
    'elicit.scaleRangeService',
    'elicit.remarks',
    'elicit.workspaceResource',
    'elicit.workspaceService',
    'elicit.scenarioResource',
    'elicit.util',
    'elicit.directives',
    'elicit.pataviService',
    'elicit.controllers',
    'elicit.taskDependencies',
    'elicit.errorHandling',
    'elicit.routeFactory',
    'elicit.pvfService',
    'errorReporting'
  ];

  var app = angular.module('elicit', dependencies);
  app.constant('Tasks', Config.tasks);

  // Detect our location so we can get the templates from the correct place
  app.constant('mcdaRootPath', (function() {
    return require.toUrl(".").replace("js", "");
  })());

  app.config(function(mcdaRootPath, Tasks, $stateProvider, $urlRouterProvider, $httpProvider, MCDARouteProvider) {
    var baseTemplatePath = mcdaRootPath + 'views/';

    //ui-router code starts here
    $stateProvider.state('workspace', {
      url: '/workspaces/:workspaceId',
      templateUrl: baseTemplatePath + 'workspace.html',
      controller: 'WorkspaceController',
      resolve: {
        currentWorkspace: function($stateParams, WorkspaceResource) {
          return WorkspaceResource.get($stateParams).$promise;
        }}
    });

    MCDARouteProvider.buildRoutes($stateProvider, 'workspace', baseTemplatePath);

    // Default route
    $stateProvider.state('choose-problem', {
      url: '/choose-problem',
      templateUrl: baseTemplatePath + 'chooseProblem.html',
      controller: 'ChooseProblemController'
    });

    $urlRouterProvider.otherwise('/choose-problem');
  });

  app.run(function($rootScope, $window, $http, Tasks) {
    var csrfToken = $window.config._csrf_token;
    var csrfHeader = $window.config._csrf_header;

    $http.defaults.headers.common[csrfHeader] = csrfToken;

    $rootScope.$safeApply = function($scope, fn) {
      var phase = $scope.$root.$$phase;
      if (phase === '$apply' || phase === '$digest') {
        this.$eval(fn);
      } else {
        this.$apply(fn);
      }
    };

  });

  return app;
});
