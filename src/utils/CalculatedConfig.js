TallySheets.factory("CalculatedConfig", [function() {
	var updatePageA4withCalculatedValues = function(config){
		config.PageTypes.A4.Portrait.heightAfterRemovingDefaultBorders = config.PageTypes.A4.Portrait.height - config.PageTypes.A4.Portrait.borderBottom - config.PageTypes.A4.Portrait.borderTop;
		config.PageTypes.A4.Portrait.widthAfterRemovingDefaultBorders = config.PageTypes.A4.Portrait.width - config.PageTypes.A4.Portrait.borderLeft - config.PageTypes.A4.Portrait.borderRight;
	};
	var updateDataSetWithCalculatedValues = function(config){
		config.DataSet.availableHeight = config.PageTypes.A4.Portrait.heightAfterRemovingDefaultBorders - config.DataSet.pageHeaderHeight;
		config.DataSet.availableWidth = config.PageTypes.A4.Portrait.widthAfterRemovingDefaultBorders;
	};

	this.getConfig = function(config) {
		updatePageA4withCalculatedValues(config);
		updateDataSetWithCalculatedValues(config);
		return config;
	};
	return this;
}]);