(function(){
	'use strict';

	angular
    .module('atp')
	.controller('coreController', coreController);

	function coreController($scope) {
		var vm = this;
		vm.message = 'Entered coreController';
	};	

})();