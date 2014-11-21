/*
 * (c) 2014 Boundless, http://boundlessgeo.com
 */
angular.module('gsApp.workspaces.new', [])
.config(['$stateProvider',
    function($stateProvider) {
      $stateProvider
        .state('workspaces.new', {
          url: '/new',
          templateUrl: '/workspaces/new.tpl.html',
          controller: 'WorkspaceNewCtrl'
        });
    }])
.controller('WorkspaceNewCtrl', ['$scope', '$rootScope', '$state',
    '$stateParams', '$log', 'GeoServer', 'workspacesListModel', '$timeout',
    'AppEvent', '_',
    function($scope, $rootScope, $state, $stateParams, $log, GeoServer,
      workspacesListModel, $timeout, AppEvent, _) {

      $scope.title = 'New Project';
      $scope.workspace = {
        default: false
      };
      $scope.workspaceCreated = false;

      $scope.defaultDesc = 'If a project is not specified ' +
        'in a GeoServer request, the DEFAULT project is used.';
      $scope.showDefaultDesc = false;

      $scope.cancel = function() {
        $state.go('workspaces.list');
      };

      $scope.updateUri = function() {
        $scope.workspace.uri = 'http://' + $scope.workspace.name;
      };

      $scope.create = function() {
        var workspace = $scope.workspace;
        GeoServer.workspace.create(workspace).then(
          function(result) {
            if (result.success || result.status===201) {
              $scope.workspace = result.data;
              $scope.workspaceCreated = true;
              workspacesListModel.addWorkspace($scope.workspace);
              $rootScope.alerts = [{
                type: 'success',
                message: 'Workspace '+ $scope.workspace.name +' created.',
                fadeout: true
              }];
              $timeout(function() {
                $rootScope.$broadcast(AppEvent.WorkspaceTab, 'layers');
              }, 250);
              $state.go('workspace', {workspace: $scope.workspace.name});
            } else {
              var msg = result.data.message?
                result.data.message : result.data;
              $rootScope.alerts = [{
                type: 'warning',
                message: msg,
                fadeout: true
              }];
            }
          });
      };

      $scope.viewWorkspace = function() {
        $state.go('workspace', {workspace: $scope.workspace});
      };
    }]);
