TallySheets.factory('DefaultContent', [function() {
	var noOfDefaultTypeColumns = 2;

	return function DefaultContent(section, dataElementsKey) {
		if(!section) return;
		this.title = section.displayName;
		this.leftSideDataElements = _.map(_.slice(section[dataElementsKey], 0, Math.ceil(section[dataElementsKey].length / noOfDefaultTypeColumns)), _.curryRight(_.pick, 2)(['name', 'displayFormName', 'valueType','greyField']));
		this.rightSideDataElements = _.map(_.slice(section[dataElementsKey], Math.ceil(section[dataElementsKey].length / noOfDefaultTypeColumns)), _.curryRight(_.pick, 2)(['name', 'displayFormName', 'valueType','greyField']));
	}
}]);