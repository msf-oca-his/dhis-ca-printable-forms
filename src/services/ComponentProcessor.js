TallySheets.service('ComponentProcessor', ['TemplateTitle', 'Header', 'SectionTitle', 'TextField', 'LongTextField', 'BooleanField', 'YesOnlyField', 'Section', 'PageComponent', function(TemplateTitle, Header, SectionTitle, TextField, LongTextField, BooleanField, YesOnlyField, Section, PageComponent) {

	var pages = [];

	var page;

	var componentTemplates;

	var currentTemplate;

	var componentConfig;

	var addSectionTitle = function(title, section) {
        var titleHeight = componentConfig.components.section.titleHeight;
		page.components.push(new SectionTitle(title, titleHeight));
        section.left.height = section.left.height - titleHeight;
	};

	var addTextField = function(dataElement, section) {

        var textFieldHeight = componentConfig.components.TEXT.height;
        if(section.left.height > 0) {

			section.left.components.push(new TextField(dataElement, textFieldHeight));

			section.left.height -= textFieldHeight;
		} else {

			section.right.components.push(new TextField(dataElement, textFieldHeight));

			section.right.height -= textFieldHeight;
		}
	};

	var addLongTextField = function(dataElement, section) {

        var longTextFieldHeight = componentConfig.components.LONG_TEXT.height;
        if(section.left.height > 0) {

			section.left.components.push(new LongTextField(dataElement, longTextFieldHeight));

			section.left.height -= longTextFieldHeight;
		} else {

			section.right.components.push(new LongTextField(dataElement, longTextFieldHeight));

			section.right.height -= longTextFieldHeight;
		}
	};

	var addBooleanField = function(dataElement, section) {

        var booleanFieldHeight = componentConfig.components.BOOLEAN.height;
        if(section.left.height > 0) {

			section.left.components.push(new BooleanField(dataElement, booleanFieldHeight));

			section.left.height -= booleanFieldHeight;
		} else {

			section.right.components.push(new BooleanField(dataElement, booleanFieldHeight));

			section.right.height -= booleanFieldHeight;
		}
	};

	var addYesOnlyField = function(dataElement, section) {

        var yesOnlyFieldHeight = componentConfig.components.YES_ONLY.height;
        if(section.left.height > 0) {

			section.left.components.push(new YesOnlyField(dataElement, yesOnlyFieldHeight));

			section.left.height -= yesOnlyFieldHeight;
		} else {

			section.right.components.push(new YesOnlyField(dataElement, yesOnlyFieldHeight));

			section.right.height -= yesOnlyFieldHeight;
		}
	};

	var getType = function(type) {
		switch(type) {
			case "LONG_TEXT" :
				return "LONG_TEXT";
            case "BOOLEAN" :
                return "BOOLEAN";
            case "TRUE_ONLY" :
                return "YES_ONLY";
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

		var yesOnlyElements = _.filter(section.dataElements, function (dataElement) {
            return getType(dataElement.valueType) == 'YES_ONLY';
        });

		height += Math.ceil(section.dataElements.length / 2) * componentConfig.components.TEXT.height; //minimum height

        height += Math.ceil(booleanElements.length / 2) * (componentConfig.components.BOOLEAN.height - componentConfig.components.TEXT.height);

        height += Math.ceil(yesOnlyElements.length / 2) * (componentConfig.components.YES_ONLY.height - componentConfig.components.TEXT.height);

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

				if(getType(dataElement.valueType) == 'YES_ONLY')

					addYesOnlyField(dataElement, sectionComponent)

			});

			page.components.push(sectionComponent);

			page.height = page.height - sectionHeight;

		}
		else {

			breakAndAddSection(section, sectionHeight)

		}
	};

	var addHeader = function() {
        var headerHeight = componentConfig.components.header.height;
		page.components.push(new Header(headerHeight));
        page.height = page.height - headerHeight;
	};

	var addTitle = function(title) {
        var titleHeight = componentConfig.components.dataSetTitle.height;
		page.components.push(new TemplateTitle(title, titleHeight));
        page.height = page.height - titleHeight;
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