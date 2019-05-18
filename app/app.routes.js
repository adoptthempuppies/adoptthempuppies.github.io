(function(){
	'use strict';

	angular
	.module('atp')
	.config(routeConfig);

	function routeConfig($routeProvider, $locationProvider) {
		    $routeProvider
		        // route for the home page
		        .when('/', {
		            templateUrl : '/app/components/home/homeView.html',
		            controller  : 'homeController',
		            controllerAs: 'vm'
		        })

		        // route for the about page
		        .when('/puppy/:id/:alias/', {
		            templateUrl : '/app/components/puppy/puppyView_v2.html',
		            controller  : 'puppyController',
		            controllerAs: 'vm'
		        })

		        .otherwise('/');

		   	$locationProvider.hashPrefix('');
		}
})();