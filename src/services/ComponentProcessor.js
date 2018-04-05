TallySheets.service('ComponentProcessor', ['TemplateTitle', 'Header', 'SectionTitle', 'TextField', 'LongTextField', 'BooleanField', 'YesOnlyField', 'Section', 'PageComponent', function(TemplateTitle, Header, SectionTitle, TextField, LongTextField, BooleanField, YesOnlyField, Section, PageComponent) {

	var pages = [];

	var page;

	var currentTemplate;

	var componentConfig;
	
	var isFirstSectionInTemplate;
	
	var isNewPage;

	var addSectionTitle = function(title, section) {

		var titleHeight = componentConfig.components.sectionTitle.height;

		page.components.push(new SectionTitle(title, titleHeight));

		section.left.height = section.left.height - titleHeight;

		section.right.height = section.right.height - titleHeight;
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

	var predictSectionHeight = function(section, leftHeight) {

		var overFlowedHeight = leftHeight - componentConfig.components.sectionTitle.height;

		_.map(section.dataElements, function(dataElement) {

			if(overFlowedHeight > 0) {

				overFlowedHeight -= (componentConfig.components[getType(dataElement.valueType)].height);
			}
		});

		return leftHeight + Math.abs(overFlowedHeight);
	};

	var getHeightFor = function(section) {

		var height = 0;

		_.map(section.dataElements, function(dataElement) {

			height += componentConfig.components[getType(dataElement.valueType)].height;

		});

		var totalHeight = (height / 2) + componentConfig.components.sectionTitle.height;
		
		return predictSectionHeight(section, totalHeight);
	};

	var breakAndAddSection = function(section) {

		var numberOfElementfit = function() {

			var leftPageHeight = page.height - componentConfig.components.sectionTitle.height;

			var rightPageHeight = leftPageHeight;

			var leftCount = 0, rightCount = 0;
			
			var isLeftProcessingDone = false;

			_.map(section.dataElements, function(dataElement) {

				if(!isLeftProcessingDone && leftPageHeight > componentConfig.components[getType(dataElement.valueType)].height) {

					leftPageHeight -= componentConfig.components[getType(dataElement.valueType)].height;

					leftCount++;
				}
				
				else if((rightPageHeight-leftPageHeight) > componentConfig.components[getType(dataElement.valueType)].height) {
					
					isLeftProcessingDone = true;
					
					rightPageHeight -= componentConfig.components[getType(dataElement.valueType)].height;
					
					rightCount++;
				}
				
			});
			return leftCount + rightCount;
		};

		var numberOfComponentsThatCanFit = numberOfElementfit();

		var newSection = _.cloneDeep(section);

		newSection.dataElements = section.dataElements.splice(numberOfComponentsThatCanFit);

		processSection(section);

		addNewPage();

		addTitle(currentTemplate.displayName);

		processSection(newSection);
	};

	var isDataElementPresent = function(dataElements) {
		return dataElements.length > 0;
	};
	
	var processSection = function(section) {

		var sectionHeight = getHeightFor(section);

		var sectionComponent = new Section(sectionHeight);
		
		if(isFirstSectionInTemplate) {

			if((page.height - componentConfig.components.templateTitle.height) > sectionHeight ) {

				addTitle(currentTemplate.displayName);
			}
			
			isFirstSectionInTemplate = false;
		}

		if(page.height < componentConfig.components.sectionTitle.height) {

			addNewPage();

			addTitle(currentTemplate.displayName);

			processSection(section);
		}

		else if(sectionHeight < page.height) {
			
			if (isDataElementPresent(section.dataElements))
				
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
		var titleHeight = componentConfig.components.templateTitle.height;
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
			
			isFirstSectionInTemplate = true;

			currentTemplate = template;

			_.map(template.sections, processSection);

			return pages;
		});

		return pages;
	}

}]);