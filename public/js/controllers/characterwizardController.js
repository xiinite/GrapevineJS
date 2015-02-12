app.controller('CharacterWizardController', ['$scope', function ($scope) {
    $scope.log = function (event) {
        console.log(event);
    }

    $scope.user = {};
}]);

app.directive('wizard', function ($timeout) {

    return {
        restrict: 'E',
        transclude: true,

        scope: {
            onBeforeStepChange: '&',
            onStepChanging: '&',
            onAfterStepChange: '&'
        },

        templateUrl: 'wizard.html',

        replace: true,

        link: function (scope) {
            scope.currentStepIndex = 0;
            scope.steps[scope.currentStepIndex].currentStep = true;
        },

        controller: function ($scope) {
            $scope.steps = [];

            this.registerStep = function (step) {
                $scope.steps.push(step);
            }

            var toggleSteps = function (showIndex) {
                var event = {event: {fromStep: $scope.currentStepIndex, toStep: showIndex}};

                if ($scope.onBeforeStepChange) {
                    $scope.onBeforeStepChange(event);
                }
                $scope.steps[$scope.currentStepIndex].currentStep = false;

                if ($scope.onStepChanging) {
                    $scope.onStepChanging(event);
                }
                $timeout(function(){
                    $scope.currentStepIndex = showIndex;
                    $scope.steps[$scope.currentStepIndex].currentStep = true;

                    if ($scope.onAfterStepChange) {
                        $scope.onAfterStepChange(event);
                    }
                }, 250);

            }

            $scope.showNextStep = function () {
                toggleSteps($scope.currentStepIndex + 1);
            }

            $scope.showPreviousStep = function () {
                toggleSteps($scope.currentStepIndex - 1);
            }

            $scope.hasNext = function () {
                return $scope.currentStepIndex < ($scope.steps.length - 1);
            }

            $scope.hasPrevious = function () {
                return $scope.currentStepIndex > 0;
            }

        }
    };

});

app.directive('step', function () {

    return {
        require: "^wizard",
        restrict: 'E',
        transclude: true,
        scope: {
            title: '@'
        },
        template: '<div class="step panel panel-default slide-right" ng-class="animation" ng-show="currentStep"><div class="panel-heading"><h3>{{title}}</h3></div> <div class="panel-body" ng-transclude></div> </div></div></div>',
        replace: true,

        link: function (scope, element, attrs, wizardController) {
            wizardController.registerStep(scope);
        }
    };

});