TallySheets.service('ComponentProcessor', ['TemplateTitle', 'Header', 'SectionTitle', 'TextField', 'LongTextField', 'BooleanField', 'Section', 'PageComponent', function(TemplateTitle, Header, SectionTitle, TextField, LongTextField, BooleanField, Section, PageComponent) {

	var pages = [];

	var page;

	var componentTemplates;

	var currentTemplate;

	var componentConfig;

	var addSectionTitle = function(title, section) {

		page.components.push(new SectionTitle(title));

		section.left.height = section.left.height - componentConfig.components.section.titleHeight;
	};

	var addTextField = function(dataElement, section) {

		if(section.left.height > 0) {

			section.left.components.push(new TextField(dataElement));

			section.left.height -= componentConfig.components.TEXT.height;
		} else {

			section.right.components.push(new TextField(dataElement));

			section.right.height -= componentConfig.components.TEXT.height;
		}
	};

	var addLongTextField = function(dataElement, section) {

		if(section.left.height > 0) {

			section.left.components.push(new LongTextField(dataElement));

			section.left.height -= componentConfig.components.LONG_TEXT.height;
		} else {

			section.right.components.push(new LongTextField(dataElement));

			section.right.height -= componentConfig.components.LONG_TEXT.height;
		}
	};

	var addBooleanField = function(dataElement, section) {

		if(section.left.height > 0) {

			section.left.components.push(new BooleanField(dataElement));

			section.left.height -= componentConfig.components.BOOLEAN.height;
		} else {

			section.right.components.push(new BooleanField(dataElement));

			section.right.height -= componentConfig.components.BOOLEAN.height;
		}
	};

	var getType = function(type) {
		switch(type) {
			case "LONG_TEXT" :
				return "LONG_TEXT";
            case "BOOLEAN" :
                return "BOOLEAN";
			default:
				return "TEXT"
		}
	};

	var getHeightFor = function(section) {

		var height = 0;

		var longTextElements = _.filter(section.dataElements, function(dataElement) {

			return getType(dataElement.valueType) == 'LONG_TEXT';

		});

		var booleanElements = _.filter(section.dataElements, function (dataElement) {
            return getType(dataElement.valueType) == 'BOOLEAN';
        });

		height += Math.ceil(section.dataElements.length / 2) * componentConfig.components.TEXT.height; //minimum height

        height += Math.ceil(booleanElements.length / 2) * (componentConfig.components.BOOLEAN.height - componentConfig.components.TEXT.height);

		height += longTextElements.length * (componentConfig.components.LONG_TEXT.height - componentConfig.components.TEXT.height);

		return height + componentConfig.components.section.titleHeight;
	};

	var breakAndAddSection = function(section) {

		var numberOfElementfit = function() {

			var leftPageHeight = page.height - componentConfig.components.section.titleHeight;

			var rightPageHeight = leftPageHeight;

			var leftCount = 0, rightCount = 0;

			_.map(section.dataElements, function(dataElement) {

				if(leftPageHeight > componentConfig.components[getType(dataElement.valueType)].height) {
					
					leftPageHeight -= componentConfig.components[getType(dataElement.valueType)].height;
					
					leftCount++;
				} else if(rightPageHeight > componentConfig.components[getType(dataElement.valueType)].height) {
					
					rightPageHeight -= componentConfig.components[getType(dataElement.valueType)].height;
					
					rightCount++;
				}
			});
			return (leftCount < rightCount) ? leftCount : rightCount;
		};

		var numberOfComponentsThatCanFit = numberOfElementfit() * 2;

		var newSection = _.cloneDeep(section);

		newSection.dataElements = section.dataElements.splice(numberOfComponentsThatCanFit);

		processSection(section);

		addNewPage();

		addTitle(currentTemplate.displayName);

		processSection(newSection);
	};

	var processSection = function(section) {

		var sectionHeight = getHeightFor(section);

		var sectionComponent = new Section(sectionHeight);

		if(page.height < componentConfig.components.section.titleHeight) {

			addNewPage();

			addTitle(currentTemplate.displayName);

			processSection(section)
		}

		else if(sectionHeight < page.height) {

			addSectionTitle(section.displayName, sectionComponent);

			_.map(section.dataElements, function(dataElement) {

				if(getType(dataElement.valueType) == 'TEXT')

					addTextField(dataElement, sectionComponent);

				if(getType(dataElement.valueType) == 'LONG_TEXT')

					addLongTextField(dataElement, sectionComponent)

				if(getType(dataElement.valueType) == 'BOOLEAN')

					addBooleanField(dataElement, sectionComponent)

			});

			page.components.push(sectionComponent);

			page.height = page.height - sectionHeight;

		}
		else {

			breakAndAddSection(section, sectionHeight)

		}
	};

	var addHeader = function() {

		page.components.push(new Header());

		page.height = page.height - componentConfig.components.header.height;
	};

	var addTitle = function(title) {

		page.components.push(new TemplateTitle(title));

		page.height = page.height - componentConfig.components.dataSetTitle.height;
	};

	var removeBorders = function() {

		page.height = page.height - componentConfig.components.border.top - componentConfig.components.border.bottom;

		page.width = page.width - componentConfig.components.border.left - componentConfig.components.border.right;
	};

	var addNewPage = function() {

		page = new PageComponent(componentConfig.height, componentConfig.width);

		pages.push(page);

		removeBorders();

		addHeader();
	};

	this.processComponents = function(templates, config) {

		pages = [];

		componentConfig = config;

		addNewPage();

		_.map(templates, function(template) {

			addTitle(template.displayName);

			currentTemplate = template;

			_.map(template.sections, processSection);

			return pages;
		});

		return pages;
	}

}]);