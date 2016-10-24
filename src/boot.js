var bootConfig = require("./config/bootConfig.js")
var determineDhisUrl = function() {
	if(window.location.href.includes("apps"))
		return window.location.href.split('api/apps/')[0];
	else
		return bootConfig.localAppUrl;
};

var createD2AngularModule = function(d2) {
	angular.module('D2', []).factory('d2', function() {
		return d2;
	});
};

var bootStrapAngularApp = function() {
	console.log('bootstrapping');
	TallySheets.value('appLoadingFailed', _.isError(arguments[0]));
	angular.bootstrap(document, ['TallySheets']);
	document.querySelector('#app').classList.remove('hidden');
};

var initializeD2 = function(ApiUrl) {
	return d2Lib.init({baseUrl: ApiUrl})
		.then(createD2AngularModule)
};

var createDummyD2DependentAngularComponents = function(){
	createD2AngularModule({});
	TallySheets.directive('d2HeaderBar', function(){return {}});
};
var loadD2UIComponents = function(){
	require('./d2-ui-components.js');
};
window.d2Lib = require("../../custom_app_commons/js/utils/d2-export.js");
window.dhisUrl = determineDhisUrl();
window.ApiUrl = bootConfig.apiVersion ? (dhisUrl + 'api/' + bootConfig.apiVersion) : (dhisUrl + 'api');

var getUiLocale = function(){
	return new Promise(function(resolve){
		jQuery.ajax({
			url: ApiUrl + '/userSettings/keyUiLocale/',
			contentType: 'text/plain',
			method: 'GET',
			dataType: 'text',
		}).done(function(data, statusText, response) {
			if(response.getResponseHeader('content-type').includes('html') || data == '')
				TallySheets.value('uiLocale', '');
			else
				TallySheets.value('uiLocale', data);
			resolve();
		}).fail(function() {
			resolve('');
			TallySheets.value('uiLocale', '')
		});
	})
};


Promise.all([initializeD2(ApiUrl), getUiLocale()])
	.then(loadD2UIComponents)
	.then(bootStrapAngularApp)
	.catch(function(err) {
		createDummyD2DependentAngularComponents();
		bootStrapAngularApp(new Error("d2 failed to load"));
		console.log(err)
	});





