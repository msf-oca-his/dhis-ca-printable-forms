TallySheets.service('ComponentProcessor', ['TemplateTitle', 'Header', 'SectionTitle', 'TextField', 'LongTextField', 'BooleanField', 'YesOnlyField', 'CommentField', 'Section', 'PageComponent', function(TemplateTitle, Header, SectionTitle, TextField, LongTextField, BooleanField, YesOnlyField, CommentField, Section, PageComponent) {

	var pages = [];

	var page;
	
	var templateType;

	var currentTemplate;

	var componentConfig;

	var isFirstSectionInTemplate;

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

	var addCommentField = function(dataElement, section) {

		var commentFieldHeight = componentConfig.components.COMMENT.height;

		if(section.left.height > 0) {

			section.left.components.push(new CommentField(dataElement, commentFieldHeight));

			section.left.height -= commentFieldHeight;
		} else {

			section.right.components.push(new CommentField(dataElement, commentFieldHeight));

			section.right.height -= commentFieldHeight;
		}
	};

    var addFieldTypeOf = {
        "LONG_TEXT": addLongTextField,
        "BOOLEAN": addBooleanField,
        "YES_ONLY": addYesOnlyField,
        "COMMENT": addCommentField,
        "TEXT": addTextField
    }

    var getType = function(type) {
		var types = {
			"LONG_TEXT": "LONG_TEXT",
			"BOOLEAN": "BOOLEAN",
			"TRUE_ONLY": "YES_ONLY",
			"COMMENT": "COMMENT"
		}
		return types[type] ? types[type] : "TEXT";
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

				else if((rightPageHeight - leftPageHeight) > componentConfig.components[getType(dataElement.valueType)].height) {

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

		if(!isFirstSectionInTemplate)

			addTitle(currentTemplate.displayName);

		processSection(newSection);
	};

	var isDataElementPresent = function(dataElements) {

		return dataElements.length > 0;

	};

	var preCheckToAddTemplateTitle = function(section) {

		if(!isDataElementPresent(section.dataElements)) {

			return false;
		}
		var minimumHeight = componentConfig.components.templateTitle.height + componentConfig.components.sectionTitle.height + componentConfig.components[getType(section.dataElements[0])].height;

		return page.height > minimumHeight;
	};

	var processSection = function(section) {

		var sectionHeight = getHeightFor(section);

		var sectionComponent = new Section(sectionHeight);

		if(isFirstSectionInTemplate) {

			if(preCheckToAddTemplateTitle(section)) {

				addTitle(currentTemplate.displayName);

				isFirstSectionInTemplate = false;
			}
		}
		;

		if(page.height < componentConfig.components.sectionTitle.height) {

			addNewPage();

			addTitle(currentTemplate.displayName);

			processSection(section);
		}

		else if(sectionHeight < page.height) {

			if(isDataElementPresent(section.dataElements))
				addSectionTitle(section.displayName, sectionComponent);

			_.map(section.dataElements, function(dataElement) {
                addFieldTypeOf[getType(dataElement.valueType)](dataElement, sectionComponent)
			});
			page.components.push(sectionComponent);
			page.height = page.height - sectionHeight;
		}
		else {

			breakAndAddSection(section, sectionHeight)

		}
	};

	var addHeader = function() {
		var headerHeight;
		
		if(templateType == "DataSet")
			headerHeight = componentConfig.components.header.height;
		else
			headerHeight = componentConfig.components.header.height / 2;

		page.components.push(new Header(templateType, headerHeight));
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
		
		templateType = templates[0].constructor.name;

		addNewPage();

		_.map(templates, function(template) {

			isFirstSectionInTemplate = true;

			currentTemplate = template;

			_.map(template.sections, processSection);

			return pages;
		});

		return pages;
	}

}])
;