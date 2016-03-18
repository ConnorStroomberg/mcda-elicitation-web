'use strict';
define(function(require) {
  var angular = require("angular");

  var dependencies = ['ngResource'];

  var Workspaces = function($resource) {
    return $resource(config.workspacesRepositoryUrl + ':workspaceId', {
      workspaceId: '@id'
    });
  };

  return angular.module('elicit.remoteWorkspaces', dependencies).factory('WorkspaceResource', Workspaces);
});
