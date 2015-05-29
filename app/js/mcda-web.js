'use strict';
define(function(require) {
  var angular = require("angular");
  var _ = require("underscore");
  var Config = require("mcda/config");

  require('mmfoundation');
  require('angular-ui-router');
  require('angular-resource');
  require('angular-cookies');
  require('mcda/services/remarks');
  require('mcda/services/routeFactory');
  require('mcda/services/workspaceResource');
  require('mcda/services/scenarioResource');
  require('mcda/services/taskDependencies');
  require('mcda/services/errorHandling');
  require('mcda/services/hashCodeService');
  require('mcda/services/pataviService');
  require('mcda/services/partialValueFunction');
  require('mcda/services/util');
  require('mcda/services/scaleRangeService');
  require('mcda/controllers');
  require('mcda/directives');

  var dependencies = [
    'ngResource',
    'ui.router',
    'mm.foundation',
    'elicit.scaleRangeService',
    'elicit.remarks',
    'elicit.workspaceResource',
    'elicit.scenarioResource',
    'elicit.util',
    'elicit.directives',
    'elicit.pataviService',
    'elicit.controllers',
    'elicit.taskDependencies',
    'elicit.errorHandling',
    'elicit.routeFactory',
    'elicit.pvfService',
    'ngCookies'
  ];

  var app = angular.module('elicit', dependencies);
  app.run(['$rootScope', '$window', '$http', '$cookies', function($rootScope, $window, $http, $cookies) {
    var csrfToken = $cookies['XSRF-TOKEN'];

    $rootScope.$safeApply = function($scope, fn) {
      var phase = $scope.$root.$$phase;
      if (phase === '$apply' || phase === '$digest') {
        this.$eval(fn);
      } else {
        this.$apply(fn);
      }
    };

    $rootScope.$on('error', function(e, message) {
      $rootScope.$safeApply($rootScope, function() {
        $rootScope.error = _.extend(message, {
          close: function() {
            delete $rootScope.error;
          }
        });
      });
    });

  }]);

  app.constant('Tasks', Config.tasks);

  // Detect our location so we can get the templates from the correct place
  app.constant('mcdaRootPath', (function() {
    return require.toUrl(".").replace("js", "");
  })());

  app.config(function(mcdaRootPath, Tasks, $stateProvider, $urlRouterProvider, $httpProvider, MCDARouteProvider) {
    var baseTemplatePath = mcdaRootPath + 'views/';

    $httpProvider.interceptors.push('ErrorHandling');

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

    var getTask = function(taskId) {
      return _.find(Tasks.available, function(task) { return task.id === taskId; });
    };

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      var task = getTask(toState.name);
      if(task && task.activeTab) {
        $rootScope.activeTab = task.activeTab;
      } else {
        $rootScope.activeTab = toState.name;
      }
    });

    $rootScope.$on('error', function(e, message) {
      $rootScope.$safeApply($rootScope, function() {
        $rootScope.error = _.extend(message, {
          close: function() {
            delete $rootScope.error;
          }
        });
      });
    });
  });

  return app;
});