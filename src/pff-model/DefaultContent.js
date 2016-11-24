TallySheets.factory('DefaultContent', [ function() {
	var noOfDefaultTypeColumns = 2;
	
	return function DefaultContent(section, dataElementsKey) {
		if(!section) return;
		this.title = section.name;
		this.leftSideDataElements = _.map(_.slice(section[dataElementsKey], 0, Math.ceil(section[dataElementsKey].length / noOfDefaultTypeColumns)), _.curryRight(_.pick, 2)(['name','valueType']));
		this.rightSideDataElements = _.map(_.slice(section[dataElementsKey], Math.ceil(section[dataElementsKey].length / noOfDefaultTypeColumns)), _.curryRight(_.pick, 2)(['name','valueType']));
	}
}]);