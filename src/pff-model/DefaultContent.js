TallySheets.factory('DefaultContent', [ function() {
	return function DefaultContent(section, dataElementsKey) {
		if(!section) return;
		this.title = section.name;
		this.leftSideDataElements = _.map(_.slice(section[dataElementsKey], 0, Math.ceil(section[dataElementsKey].length / 2)), _.curryRight(_.pick,2)(['name','valueType']));
		this.rightSideDataElements = _.map(_.slice(section[dataElementsKey], Math.ceil(section[dataElementsKey].length / 2)), _.curryRight(_.pick,2)(['name','valueType']));
	}
}]);