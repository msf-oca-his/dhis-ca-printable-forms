var pageType = 'A4';

var Page = function(template) {
	this.contents = [];
	_.assignIn(this, template);
};

TallySheets.factory('DataSetPage', ['Config','PageTypes', function(config, PageTypes) {
	return function DataSetPage() {
		var dataSetPage = {};
		dataSetPage.heightLeft = config.DataSet.availableHeight;
		dataSetPage.widthLeft = config.DataSet.availableWidth;
		dataSetPage.type = PageTypes.DATASET;
		return new Page(dataSetPage);
	}
}]);

TallySheets.factory('CoverSheetPage', ['Config','PageTypes', function(config, PageTypes) {
	return function CoverSheetPage() {
		var coverSheetPage = {};
		coverSheetPage.heightLeft = config.PageTypes[pageType].Portrait.availableHeight;
		coverSheetPage.widthLeft = config.PageTypes[pageType].Portrait.availableWidth;
		coverSheetPage.type = PageTypes.COVERSHEET;
		return new Page(coverSheetPage);
	}
}]);

TallySheets.factory('RegisterPage', ['Config','PageTypes', function(config, PageTypes) {
	return function RegisterPage() {
		var registerPage = {};
		registerPage.heightLeft = config.PageTypes[pageType].LandScape.availableHeight - config.Register.pageHeaderHeight;
		registerPage.widthLeft = config.PageTypes[pageType].LandScape.availableWidth;
		registerPage.type = PageTypes.REGISTER;
		return new Page(registerPage);
	}
}]);

TallySheets.factory('CodeSheetPage', ['Config','PageTypes', function(config, PageTypes) {
	return function CodeSheetPage() {
		var codeSheetPage = {};
		codeSheetPage.heightLeft = config.PageTypes[pageType].Portrait.availableHeight;
		codeSheetPage.widthLeft = config.PageTypes[pageType].Portrait.availableWidth;
		codeSheetPage.type = PageTypes.CODESHEET;
		codeSheetPage.columns = new Array(config.CodeSheet.numberOfColumns);
		return new Page(codeSheetPage);
	}
}]);
