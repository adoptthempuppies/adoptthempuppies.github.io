(function(){
	'use strict';

	angular
    .module('atp', ['ngRoute', 'angulartics', 'angulartics.google.analytics', 'LocalStorageModule', 'hc.marked'])
    .run(function($rootScope, $location, $log) {
    	$rootScope.location = $location;
    	$log.debug($location.absUrl());
	});
})();
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
(function(){
	'use strict';

	angular
    .module('atp')
	.controller('homeController', homeController)

	homeController.$inject = ['$scope', '$log', 'localStorageService', '$filter'];

	function homeController($scope, $log, localStorageService, $filter) {

		var vm = this;
	    // create a message to display in our view
	    vm.message = 'Entered homeController';
	    // $log.debug($filter([{'a':1},{'a':2}],{'a':1},'a'));
	    var rightNow = Date.parse(new Date());
	    var localTrelloResponse = localStorageService.get('atp-trelloResponse') || null;
	    var localTrelloResponseExpiry = localStorageService.get('atp-trelloResponse-expiry') || null;
	    var localLitters = localStorageService.get('atp-litters') || null;
	    var localLittersExpiry = localStorageService.get('atp-litters-expiry') || null;

	    vm.trelloResponse = ((localTrelloResponse && localTrelloResponseExpiry) && Date.parse(localTrelloResponseExpiry) > rightNow)?localTrelloResponse:[]; 
		vm.litters = ((localLitters && localLittersExpiry) && Date.parse(localLittersExpiry) > rightNow)?localLitters:[]; 

	    function success(successMsg)
	    {
	    	var now = new Date();
	    	now.setMinutes(now.getMinutes() + 1);

	    	localStorageService.set('atp-trelloResponse', successMsg);
	    	localStorageService.set('atp-trelloResponse-expiry', now);
	    	vm.trelloLists = successMsg;
	    	if(successMsg.length)
	    	{
	    		angular.forEach(vm.trelloLists, function(list){
	    			if(list.name.startsWith('LITTER::'))
	    			{
	    				var litter = {cards:[], type:"LITTER"}
	    				litter.name = list.name.replace('LITTER::','').trim();

	    				angular.forEach(list.cards, function(card){
	    					if(card.name.startsWith('PUP::'))
	    					{
	    						var pup = {};
	    						var puppy_img_regex = /\!\[PUP\]\((.*)\)/g;
	    						var check_desc_for_img = puppy_img_regex.exec(card.desc);

	    						pup.name = card.name.replace('PUP::','').trim();
	    						pup.desc = card.desc.replace(check_desc_for_img[0],'');
	    						pup.image = check_desc_for_img[1];
	    						pup.id = card.shortLink;
	    						var urlsplitter = card.url.split('/')
	    						pup.slug = urlsplitter[urlsplitter.length-1];
	    						pup.labels = card.labels;
	    						litter.cards.push(pup);

	    					}
	    				});
	    				vm.litters.push(litter);
	    			}
	    			else if (list.name.startsWith('MARKDOWN::'))
	    			{
	    				var litter = {type:"MARKDOWN", blocks:[]}
	    				litter.name = list.name.replace('MARKDOWN::','').trim();
	    				if(list.cards.length)
	    				{
							angular.forEach(list.cards, function(card){
									var block = {};
									block.name = card.name;
									block.desc = card.desc;
									litter.blocks.push(block);
							});
		    				vm.litters.push(litter);
	    				}
	    				else
	    				{
	    					$log.debug("IGNORED List :", list.name);
	    				}
	    			}
	    			else
	    			{
	    				$log.debug("Ignored List: ",list.name)
	    			}
		    	})
		    	console.log(vm.litters);
		    	localStorageService.set('atp-litters', vm.litters);
	    		localStorageService.set('atp-litters-expiry', now);
	    	}

	    	$scope.$apply();
	    }

	    function error(errorMsg)
	    {
	    	console.log('ERROR:',errorMsg);
	    }

	    $log.debug("trelloResponse: ",vm.trelloResponse.length);
	    $log.debug("litters: ",vm.litters.length);
	    if(vm.trelloResponse.length && vm.litters.length)
	    {
	    	$log.debug("CACHED");
	    }
	    else
	    {
	    	Trello.get('/boards/403lRNft/lists?cards=open&card_fields=name,labels,desc,shortLink,url&fields=name', success, error);
	    }

	};	

})();
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