var Page = function(template) {
	this.contents = [];
	_.assignIn(this, template);
};

TallySheets.factory('DataSetPage', ['Config','PageTypes', function(config,PageTypes) {
	return function DataSetPage() {
		var dataSetPage = {};
		dataSetPage.heightLeft = config.DataSet.availableHeight;
		dataSetPage.widthLeft = config.DataSet.availableWidth;
		dataSetPage.type = PageTypes.DATASET;
		return new Page(dataSetPage);
	}
}]);

TallySheets.factory('CoverSheetPage', ['Config','PageTypes', function(config,PageTypes) {
	return function CoverSheetPage() {
		var coverSheetPage = {};
		coverSheetPage.heightLeft = config.Coversheet.availableHeight;
		coverSheetPage.widthLeft = config.Coversheet.availableWidth;
		coverSheetPage.type = PageTypes.COVERSHEET;
		return new Page(coverSheetPage);
	}
}]);

TallySheets.factory('RegisterPage', ['Config','PageTypes', function(config,PageTypes) {
	return function RegisterPage() {
		var registerPage = {};
		registerPage.heightLeft = config.PageTypes.A4.LandScape.availableHeight - config.Register.pageHeaderHeight;
		registerPage.widthLeft = config.PageTypes.A4.LandScape.availableWidth;
		registerPage.type = PageTypes.REGISTER;
		return new Page(registerPage)
	}
}]);

TallySheets.factory('CodeSheetPage', ['Config','PageTypes', function(config,PageTypes) {
	return function CodeSheetPage() {
		var codeSheetPage = {};
		codeSheetPage.heightLeft = config.PageTypes.A4.Portrait.availableHeight;
		codeSheetPage.widthLeft = config.PageTypes.A4.Portrait.availableWidth;
		codeSheetPage.type = PageTypes.CODESHEET;
		codeSheetPage.columns = new Array(config.CodeSheet.numberOfColumns);
		return new Page(codeSheetPage)
	}
}]);
