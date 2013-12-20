define(['angular', 'controllers/intervalSwing', 'controllers/partialValueFunction'], function(angular, IntervalSwingHandler, PartialValueFunctionHandler) {
  describe("IntervalSwingHandler", function() {
    beforeEach(module('elicit.controllers'));
    beforeEach(module('elicit.taskDependencies'));
    beforeEach(module('elicit.pvfService'));

    function initializeScope(problem) {
      var scope;
      inject(function($controller, $rootScope, TaskDependencies, PartialValueFunction) {
        scope = $rootScope.$new();

        var scenario = {
          state: PartialValueFunction.attach({
            problem: problem,
            prefs: [
              { type: "ordinal", criteria: ["Prox DVT", "Bleed"] },
              { type: "ordinal", criteria: ["Bleed", "Dist DVT"] }]
          }),
          update: function(state) { },
          redirectToDefaultView: function() {}
        };
        scope._scenario = scenario;

        var task = {
          requires: [],
          resets: []
        };

        $controller('IntervalSwingController', {
          $scope: scope,
          currentScenario: scenario,
          taskDefinition: TaskDependencies.extendTaskDefinition(task)
        });
      });
      return scope;
    };

    describe("initialize", function() {
      it("should start comparing the first two criteria", function() {
        var scope = initializeScope(exampleProblem());
        var problem = scope.currentStep.problem;
        expect(scope.currentStep.criterionA).toEqual("Prox DVT");
        expect(scope.currentStep.criterionB).toEqual("Bleed");
        expect(scope.currentStep.choice.lower).toEqual(problem.criteria["Prox DVT"].best());
        expect(scope.currentStep.choice.upper).toEqual(problem.criteria["Prox DVT"].worst());
        expect(scope.currentStep.worst()).toEqual(problem.criteria["Prox DVT"].worst());
        expect(scope.currentStep.best()).toEqual(problem.criteria["Prox DVT"].best());
      });

      it("should sort the worst and best values", function() {
        var problem = exampleProblem();
        problem.criteria["Prox DVT"].pvf.direction = "increasing";
        var scope = initializeScope(problem);

        expect(scope.currentStep.choice.lower).toEqual(problem.criteria["Prox DVT"].worst());
        expect(scope.currentStep.worst()).toEqual(problem.criteria["Prox DVT"].worst());
        expect(scope.currentStep.best()).toEqual(problem.criteria["Prox DVT"].best());
      });

      it("should make best() and worst() functions of choice", function() {
        var scope = initializeScope(exampleProblem());
        scope.currentStep.choice = { lower: 0.1, upper: 0.2 };
        expect(scope.currentStep.worst()).toEqual(0.2);
        expect(scope.currentStep.best()).toEqual(0.1);
      });

      it("should set the progress information", function() {
        var scope = initializeScope(exampleProblem());
        expect(scope.currentStep.step).toEqual(1);
        expect(scope.currentStep.total).toEqual(2);
      });
    });

    describe("validChoice", function() {
      it("should check that lower < upper", function() {
        var scope = initializeScope(exampleProblem());
        scope.currentStep.choice.lower = 0.2;
        scope.currentStep.choice.upper = 0.1;
        expect(scope.canProceed(scope.currentStep)).toEqual(false);
        scope.currentStep.choice.upper = 0.2;
        expect(scope.canProceed(scope.currentStep)).toEqual(false);
        scope.currentStep.choice.upper = 0.21;
        expect(scope.canProceed(scope.currentStep)).toEqual(true);
      });

      it("should check that the choice is contained in the scale range", function() {
        var scope = initializeScope(exampleProblem());
        scope.currentStep.choice.lower = -0.05;
        scope.currentStep.choice.upper = 0.26;
        expect(scope.canProceed(scope.currentStep)).toEqual(false);
        scope.currentStep.choice.upper = 0.25;
        expect(scope.canProceed(scope.currentStep)).toEqual(false);
        scope.currentStep.choice.lower = 0.0;
        expect(scope.canProceed(scope.currentStep)).toEqual(true);
        scope.currentStep.choice.upper = 0.26;
        expect(scope.canProceed(scope.currentStep)).toEqual(false);
      });
    });

    describe("nextState", function() {
      it("should transition to the next two criteria", function() {
        var scope = initializeScope(exampleProblem());
        var problem = scope.currentStep.problem;
        scope.nextStep(scope.currentStep);
        expect(scope.currentStep.criterionA).toEqual("Bleed");
        expect(scope.currentStep.criterionB).toEqual("Dist DVT");
        expect(scope.currentStep.choice.lower).toEqual(problem.criteria["Bleed"].best());
        expect(scope.currentStep.choice.upper).toEqual(problem.criteria["Bleed"].worst());
      });

      it("should transition to done when criteria run out", function() {
        var scope = initializeScope(exampleProblem());
        scope.nextStep(scope.currentStep);
        scope.nextStep(scope.currentStep);
        expect(scope.currentStep.type).toEqual("done");
      });

      it("should set the title", function() {
        var scope = initializeScope(exampleProblem());
        scope.nextStep(scope.currentStep);
        expect(scope.currentStep.step).toEqual(2);
        expect(scope.currentStep.total).toEqual(2);
      });

      it("should store the preference information", function() {
        var scope = initializeScope(exampleProblem());
        scope.currentStep.choice.lower = 0.11;
        scope.currentStep.choice.upper = 0.13;
        scope.nextStep(scope.currentStep);

        expect(scope.currentStep.prefs[2].type).toEqual("ratio bound");
        expect(scope.currentStep.prefs[2].criteria).toEqual(["Prox DVT", "Bleed"]);
        expect(scope.currentStep.prefs[2].bounds.length).toEqual(2);
        expect(scope.currentStep.prefs[2].bounds[0]).toBeCloseTo(1.79);
        expect(scope.currentStep.prefs[2].bounds[1]).toBeCloseTo(2.08);

        scope.currentStep.choice.lower = 0.04;
        scope.currentStep.choice.upper = 0.05;
        expect(scope.canSave(scope.currentStep)).toBeTruthy();

        spyOn(scope._scenario, "update");
        scope.save(scope.currentStep);
        expect(scope._scenario.update).toHaveBeenCalled();
        var prefs = scope._scenario.update.mostRecentCall.args[0].prefs;

        expect(prefs[3].type).toEqual("ratio bound");
        expect(prefs[3].criteria).toEqual(["Bleed", "Dist DVT"]);
        expect(prefs[3].bounds.length).toEqual(2);
        expect(prefs[3].bounds[0]).toBeCloseTo(1.67);
        expect(prefs[3].bounds[1]).toBeCloseTo(2.00);

        prefs.pop();
        expect(prefs).toEqual(scope.currentStep.prefs);

        var problem = exampleProblem();
        problem.criteria["Prox DVT"].pvf.direction = "increasing";
        scope = initializeScope(problem);

        scope.currentStep.choice.lower = 0.12;
        scope.currentStep.choice.upper = 0.14;
        scope.nextStep(scope.currentStep);
        expect(scope.currentStep.prefs[2].type).toEqual("ratio bound");
        expect(scope.currentStep.prefs[2].criteria).toEqual(["Prox DVT", "Bleed"]);
        expect(scope.currentStep.prefs[2].bounds.length).toEqual(2);
        expect(scope.currentStep.prefs[2].bounds[0]).toBeCloseTo(1.79);
        expect(scope.currentStep.prefs[2].bounds[1]).toBeCloseTo(2.08);
      });

      it("should sort the worst and best values", function() {
        var problem = exampleProblem();
      	problem.criteria["Prox DVT"].pvf.direction = "increasing";
        var scope = initializeScope(problem);
      	expect(scope.currentStep.choice.lower).toEqual(problem.criteria["Prox DVT"].worst());
      	expect(scope.currentStep.worst()).toEqual(problem.criteria["Prox DVT"].worst());
      	expect(scope.currentStep.best()).toEqual(problem.criteria["Prox DVT"].best());
      });
    });
  });
});
