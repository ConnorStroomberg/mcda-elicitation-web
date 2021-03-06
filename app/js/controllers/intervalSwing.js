'use strict';
define(function(require) {
  var angular = require("angular");
  var _ = require("underscore");
  var Util = require("mcda/controllers/helpers/util");
  var Wizard = require("mcda/controllers/helpers/wizard");

  return function($scope, $state, $stateParams, $injector, currentScenario, taskDefinition, PartialValueFunction) {
    $scope.pvf = PartialValueFunction;

    $scope.title = function(step, total) {
      var base = 'Interval SWING weighting';
      if (step > total) {
        return base + ' (DONE)';
      }
      return base + ' (' + step + '/' + total + ')';
    };


    function buildInitial(criteria, criterionA, criterionB, step) {
      var bounds = PartialValueFunction.getBounds(criteria[criterionA]);
      var increasing = PartialValueFunction.isIncreasing(criteria[criterionA]);
      return {
        step: step,
        total: _.size(criteria) - 1,
        criterionA: criterionA,
        criterionB: criterionB,
        best: function() {
          return increasing ? this.choice.upper : this.choice.lower;
        },
        worst: function() {
          return increasing ? this.choice.lower : this.choice.upper;
        },
        choice: {
          lower: bounds[0],
          upper: bounds[1]
        },
        range: {
          from: bounds[0],
          to: bounds[1],
          rightOpen: true,
          leftOpen: true
        }
      };
    }

    var initialize = function(state) {
      var criteria = state.problem.criteria;
      state.prefs = Util.getOrdinalPreferences(state.prefs); // remove pre-existing ordinal/exact preferences
      state = _.extend(state, {
        'criteriaOrder': Util.getCriteriaOrder(state.prefs)
      });
      state = _.extend(state, buildInitial(criteria, state.criteriaOrder[0], state.criteriaOrder[1], 1));
      return state;
    };


    var validChoice = function(state) {
      if (!state) {
        return false;
      }

      var criteria = state.problem.criteria;
      var bounds1 = state.choice;
      var bounds2 = PartialValueFunction.getBounds(criteria[state.criterionA]);
      return bounds1.lower < bounds1.upper && bounds2[0] <= bounds1.lower && bounds2[1] >= bounds1.upper;
    };

    var nextState = function(state) {
      if (!validChoice(state)) {
        return null;
      }
      var order = state.criteriaOrder;
      var criteria = state.problem.criteria;

      var idx = _.indexOf(order, state.criterionB);
      var next;
      if (idx > order.length - 2) {
        next = {
          type: 'done',
          step: idx + 1
        };
      } else {
        next = buildInitial(criteria, order[idx], order[idx + 1], idx + 1);
      }

      function getRatioBounds(state) {
        var u = PartialValueFunction.map(criteria[state.criterionA]);
        return [1 / u(state.choice.lower), 1 / u(state.choice.upper)].sort(function(a, b) {
          return a - b;
        });
      }

      next.prefs = angular.copy(state.prefs);
      next.prefs.push({
        criteria: [order[idx - 1], order[idx]],
        bounds: getRatioBounds(state),
        type: 'ratio bound'
      });
      return _.extend(angular.copy(state), next);
    };

    $scope.canSave = function(state) {
      return state && state.step === state.total + 1;
    };

    $scope.save = function(state) {
      currentScenario.state = _.pick(state, ['problem', 'prefs']);
      currentScenario.$save($stateParams, function(scenario) {
        $state.go('preferences');
      });
    };

    $injector.invoke(Wizard, this, {
      $scope: $scope,
      handler: {
        validChoice: validChoice,
        fields: ['total', 'choice', 'criteriaOrder', 'criterionA', 'criterionB'],
        nextState: nextState,
        standardize: _.identity,
        initialize: _.partial(initialize, taskDefinition.clean(currentScenario.state))
      }
    });
  };

});
