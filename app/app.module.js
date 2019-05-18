(function(){
	'use strict';

	angular
    .module('atp', ['ngRoute', 'angulartics', 'angulartics.google.analytics', 'LocalStorageModule', 'hc.marked'])
    .run(function($rootScope, $location, $log) {
    	$rootScope.location = $location;
    	$log.debug($location.absUrl());
	});
})();