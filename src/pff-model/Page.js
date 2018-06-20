var pageType = 'A4';

var Page = function(template) {
	this.contents = [];
	_.assignIn(this, template);
};

var pageComponent = function(height, width) {
	this.height = height;
	this.width = width;
	this.components = [];
};

TallySheets.factory('PageComponent', [function() {
	return function PageComponent(height, width) {
		return new pageComponent(height, width);
	}
}]);

TallySheets.factory('DataSetPage', ['Config', 'PageTypes', function(config, PageTypes) {
	return function DataSetPage() {
		var dataSetPage = {};
		dataSetPage.heightLeft = config.DataSet.availableHeight;
		dataSetPage.widthLeft = config.DataSet.availableWidth;
		dataSetPage.type = PageTypes.DATASET;
		return new Page(dataSetPage);
	}
}]);

TallySheets.factory('CoverSheetPage', ['Config', 'PageTypes', function(config, PageTypes) {
	return function CoverSheetPage() {
		var coverSheetPage = {};
		coverSheetPage.heightLeft = config.PageTypes[pageType].Portrait.availableHeight;
		coverSheetPage.widthLeft = config.PageTypes[pageType].Portrait.availableWidth;
		coverSheetPage.type = PageTypes.COVERSHEET;
		return new Page(coverSheetPage);
	}
}]);

TallySheets.factory('RegisterPage', ['Config', 'PageTypes', function(config, PageTypes) {
	return function RegisterPage(height, width) {
		var registerPage = {};
		registerPage.heightLeft = height - config.Register.pageHeaderHeight;
		registerPage.widthLeft = width - config.Register.widthOfSNOColumn;
		registerPage.type = PageTypes.REGISTER;
		return new Page(registerPage);
	}
}]);

TallySheets.factory('CodeSheetPage', ['Config', 'PageTypes', function(config, PageTypes) {
	return function CodeSheetPage(height, width) {
		var codeSheetPage = {};
		codeSheetPage.heightLeft = height;
		codeSheetPage.widthLeft = width;
		codeSheetPage.type = PageTypes.CODESHEET;
		codeSheetPage.columns = new Array(config.CodeSheet.numberOfColumns);
		return new Page(codeSheetPage);
	}
}]);
