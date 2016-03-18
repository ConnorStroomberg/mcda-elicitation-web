'use strict';
define(function(require) {
  var angular = require('angular');
  return angular.module('elicit.controllers', [])
    .controller('ChooseProblemController', require('app/js/controllers/chooseProblem'))
    .controller('WorkspaceController', require('app/js/controllers/workspace'))
    .controller('ScenarioController', require('app/js/controllers/scenario'))
    .controller('OverviewController', require('app/js/controllers/overview'))
    .controller('EffectsTableController', require('app/js/controllers/effectsTable'))
    .controller('PreferencesController', require('app/js/controllers/preferences'))
    .controller('ScaleRangeController', require('app/js/controllers/scaleRange'))
    .controller('PartialValueFunctionController', require('app/js/controllers/partialValueFunction'))
    .controller('OrdinalSwingController', require('app/js/controllers/ordinalSwing'))
    .controller('IntervalSwingController', require('app/js/controllers/intervalSwing'))
    .controller('ExactSwingController', require('app/js/controllers/exactSwing'))
    .controller('ResultsController', require('app/js/controllers/results'));
});
