angular.module('gsApp.workspaces.workspace', [
  'ngGrid', 'ngSanitize'
])
.config(['$stateProvider',
    function($stateProvider) {
      $stateProvider.state('workspace.home', {
        url: '/home',
        templateUrl: '/workspaces/detail/workspace-home.tpl.html',
        controller: 'WorkspaceHomeCtrl'
      });
    }])
.controller('WorkspaceHomeCtrl', ['$scope', '$stateParams',
  'GeoServer', '$log', '$sce', 'baseUrl', '$window', '$state',
    function($scope, $stateParams, GeoServer, $log, $sce, baseUrl,
      $window, $state) {

      var wsName = $stateParams.workspace;
      $scope.title = wsName;
      $scope.thumbnails = {};
      $scope.olmaps = {};

      // Maps

      GeoServer.maps.get({workspace: wsName}).$promise
        .then(function(maps) {

          $scope.maps = maps;

          // load all map thumbnails & metadata
          for (var i=0; i < $scope.maps.length; i++) {
            var map = $scope.maps[i];
            var layers = '';

            $scope.maps[i].workspace = wsName;
            $scope.maps[i].layergroupname = wsName + ':' + map.name;
            $scope.maps[i].layerCount = map.layers.length;
            var bbox = $scope.maps[i].bbox = '&bbox=' + map.bbox.west + ',' + map.bbox.south + ',' + map.bbox.east + ',' + map.bbox.north;

            var url = GeoServer.map.thumbnail.get(map.workspace, map,
              map.layergroupname, 250, 250);
            var srs = '&srs=' + map.proj.srs;

            $scope.thumbnails[map.name] = baseUrl + url + bbox +
              '&format=image/png' + srs;
          }
        });

      $scope.sanitizeHTML = function(description) {
        return $sce.trustAsHtml(description);
      };


      http://horizon.boundlessgeo.com/geoserver/medford/wms?service=WMS&version=1.1.0&request=GetMap&layers=medford&styles=&bbox=-122.911,42.291,-122.787,42.398&width=512&height=441&srs=EPSG:4326&format=application/openlayers

      $scope.newOLWindow = function(map) {
        var baseUrl = GeoServer.map.openlayers.get(map.workspace,
          map.name, map.bbox, 800, 500);
        $window.open(baseUrl);
      };

      $scope.onEdit = function(map) {
        $state.go('map.compose', {
          workspace: map.workspace,
          name: map.name
        });
      };

      // Data

      $scope.pagingOptions = {
        pageSizes: [25, 50, 100],
        pageSize: 25
      };
      $scope.gridOptions = {
        data: 'layer2Data',
        columnDefs: [
          {field: 'name', displayName: 'Name'},
          {field: 'title', displayName: 'Title'},
          {field: 'type', displayName: 'Type'},
          {field: 'srs', displayName: 'SRS'},
          {
            field: 'style',
            displayName: 'Style',
            cellTemplate: '<div>hello</div>'
          }
        ],
        enablePaging: true,
        enableColumnResize: false,
        showFooter: true,
        pagingOptions: $scope.pagingOptions,
        filterOptions: {
          filterText: '',
          useExternalFilter: true
        }
      };

      $scope.layerData = [];

      // TODO change this to get workspace maps and data
      GeoServer.layers.get({workspace: wsName}).$promise
      .then(function(layers) {
        $scope.layerData = layers;
      });

    }]);

