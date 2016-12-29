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
	return uiLocalePromise.then(function(uiLocale) {
		TallySheets.value('uiLocale', uiLocale);
		angular.bootstrap(document, ['TallySheets']);
		document.querySelector('#app').classList.remove('hidden');
	})
};

var initializeD2 = function(ApiUrl) {
	return d2Lib.init({baseUrl: ApiUrl})
		.then(createD2AngularModule)
};

var createDummyD2DependentAngularComponents = function() {
	createD2AngularModule({});
	TallySheets.directive('d2HeaderBar', function() {return {}});
	return new Error('d2 failed to load')
};

var loadD2UIComponents = function() {
	require('./d2-ui-components.js');
};

var getUiLocale = function() {
	return new Promise(function(resolve) {
		jQuery.ajax({
			url: ApiUrl + '/userSettings/keyUiLocale/',
			contentType: 'text/plain',
			method: 'GET',
			dataType: 'text',
		}).done(function(data, statusText, response) {
			if(response.getResponseHeader('content-type').includes('html') || data == '')
				resolve('');
			else
				resolve(data);
		}).fail(function() {
			resolve('');
		});
	})
};

window.d2Lib = require("../../custom_app_commons/js/utils/d2-export.js");
window.dhisUrl = determineDhisUrl();
window.ApiUrl = bootConfig.apiVersion ? (dhisUrl + 'api/' + bootConfig.apiVersion) : (dhisUrl + 'api');

var uiLocalePromise = getUiLocale();
Promise.resolve(ApiUrl)
	.then(initializeD2)
	.then(loadD2UIComponents, createDummyD2DependentAngularComponents)
	.then(bootStrapAngularApp)
	.catch(function(err) {
		console.log(err);
		document.body.innerHTML = "<h4>App loading failed... Contact Administrator.</h4>";
	});





