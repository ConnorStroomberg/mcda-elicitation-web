/*jshint node: true */
define(['mcda/config', 'angular', 'angularanimate', 'mmfoundation', 'underscore'],
  function(Config, angular, angularanimate, mmfoundation, _) {
    var dependencies = ['$scope', '$stateParams', 'taskDefinition', 'RemarksResource', 'ValueTreeUtil'];
    var EffectsTableController = function($scope, $stateParams, taskDefinition, RemarksResource, ValueTreeUtil) {

      var remarksCache;
      $scope.scales = $scope.workspace.$$scales;
      $scope.valueTree = $scope.workspace.$$valueTree;

      function buildEffectsTableData(problem, valueTree) {
        var criteriaNodes = ValueTreeUtil.findCriteriaNodes(valueTree);
        var effectsTable = [];

        angular.forEach(criteriaNodes, function(criteriaNode) {
          var path = ValueTreeUtil.findTreePath(criteriaNode, valueTree);
          effectsTable.push({
            path: path.slice(1), // omit top-level node
            criteria: _.map(criteriaNode.criteria, function(criterionKey) {
              return {
                key: criterionKey,
                value: problem.criteria[criterionKey]
              };
            })
          });
        });

        return effectsTable;
      }

      $scope.problem = $scope.workspace.problem;
      $scope.effectsTableData = buildEffectsTableData($scope.problem, $scope.valueTree);
      $scope.nrAlternatives = _.keys($scope.problem.alternatives).length;
      $scope.expandedValueTree = ValueTreeUtil.addCriteriaToValueTree($scope.valueTree, $scope.problem.criteria);

      $scope.remarks = {};
      $scope.$parent.taskId = taskDefinition.id;
      $scope.alternativeVisible = {};
      // show / hide sidepanel
      $scope.showPanel = false;
      $scope.onLoadClass = 'animate-hide';

      RemarksResource.get(_.omit($stateParams, 'id'), function(remarks) {
        if (remarks.remarks) {
          $scope.remarks = remarks;
        }
        remarksCache = angular.copy(remarks);
      });

      $scope.saveRemarks = function() {
        RemarksResource.save(_.omit($stateParams, 'id'), $scope.remarks, function() {
          remarksCache = angular.copy($scope.remarks);
        });
      };

      $scope.cancelRemarks = function() {
        $scope.remarks = angular.copy(remarksCache);
      };


      $scope.toggleSidebar = function(criterion) {
        if ($scope.showPanel && criterion.key === $scope.sideParam.key) {
          $scope.showPanel = !$scope.showPanel;
        } else {
          $scope.showPanel = true;
        }
        $scope.sideParam = {
          title: criterion.value.title,
          key: criterion.key,
          scales: $scope.scales.observed[criterion.key]
        };
      };

      $scope.editRemarkModal = function(node) {
        console.log(node.remark);
      };

    };

    return dependencies.concat(EffectsTableController);
  });
