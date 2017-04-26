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

var bootStrap = function() {
	console.log('bootstrapping');
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

require('./d2-ui-components.js');
window.dhisUrl = determineDhisUrl();
window.ApiUrl = bootConfig.apiVersion ? (dhisUrl + 'api/' + bootConfig.apiVersion) : (dhisUrl + 'api');

var uiLocalePromise = getUiLocale();

function handleD2InitializationFailure(error) {
	console.log(error);
	TallySheets.value('appLoadingFailed', true);
	createDummyD2DependentAngularComponents();
}
TallySheets.value('appLoadingFailed', false);
Promise.resolve(ApiUrl)
    .then(initializeD2)
	.catch(handleD2InitializationFailure)
	.then(bootStrap)
	.catch(function(err) {
		console.log(err);
		document.body.innerHTML = "<h4>App loading failed... Contact Administrator.</h4>";
	});





