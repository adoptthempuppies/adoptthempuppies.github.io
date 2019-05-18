(function(){
	'use strict';

	angular
    .module('atp')
	.controller('puppyController', puppyController);

	puppyController.$inject = ['$scope', '$routeParams'];

	function puppyController($scope, $routeParams) {

	    // create a message to display in our view
	    var vm = this;
	    $scope.message = 'Entered puppyController';

	    vm.puppy = {};
	    vm.puppy.id = $routeParams.id;
	    vm.puppy.alias = $routeParams.alias;

	    function success(successMsg)
	    {
	    	vm.puppy = successMsg;

	    	var puppy_img_regex = /\!\[PUP\]\((.*)\)/g;
	    	var check_desc_for_img = puppy_img_regex.exec(vm.puppy.desc);


	    	vm.puppy.name = vm.puppy.name.replace('PUP::','').trim();
	    	vm.puppy.desc = vm.puppy.desc.replace(check_desc_for_img[0],'');
	    	vm.puppy.image = check_desc_for_img[1];
	    	vm.puppy.id = vm.puppy.shortLink;
	    	var urlsplitter = vm.puppy.url.split('/')
	    	vm.puppy.slug = urlsplitter[urlsplitter.length-1];

	    	$scope.$apply()
	    }

	    function error()
	    {

	    }

	    Trello.get('/cards/'+vm.puppy.id+'/?fields=name,desc,shortLink,url,labels', success, error);
	};	

})();