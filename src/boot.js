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
};

var initializeD2 = function(ApiUrl) {
	return d2Lib.init({baseUrl: ApiUrl})
		.then(createD2AngularModule)
};

window.dhisUrl = determineDhisUrl();
window.ApiUrl = bootConfig.apiVersion ? (dhisUrl + 'api/' + bootConfig.apiVersion) : (dhisUrl + 'api');
initializeD2(ApiUrl)
	.then(bootStrapAngularApp)
	.catch(function(err) {
		createD2AngularModule({});
		bootStrapAngularApp(new Error("d2 failed to load"));
		console.log(err)
	});





