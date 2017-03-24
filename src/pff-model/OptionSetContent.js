TallySheets.factory('OptionSetContent', ['Config', 'CommonUtils', function(config, commonUtils) {

	var getOptionRows = function(section, dataElementsKey) {
		var dataElement = (section[dataElementsKey])[0];
		var rows = [];
		var numberOfRows = Math.ceil(dataElement.options.length / config.OptionSet.numberOfColumns);
		for(var i = 0; i < numberOfRows; i++) {
			var j = 0;
			while(j < dataElement.options.length) {
				if(j == 0)
					rows.push([dataElement.options[i]]);
				else if(dataElement.options[i + j] != undefined)
					rows[i].push(dataElement.options[i + j]);
				j = j + numberOfRows;
			}
		}
		return rows;
	};

	return function OptionSetContent(section, dataElementKey) {
		if(!section) return;
		this.title = section.displayName;
		this.dataElementName = (section[dataElementKey])[0].displayFormName;
		this.rows = getOptionRows(section, dataElementKey);

		_.map(this.rows, function(row) {
			_.map(row, function(option) {
				option.label = _.trim(commonUtils.getRightPartOfSplit(option.displayName, config.Delimiters.optionLabelEndDelimiter));
			})
		});
	}
}]);

