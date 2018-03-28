TallySheets.service('ComponentProcessor', ['TemplateTitle', 'Header', 'SectionTitle', 'TextField', 'Section', 'PageComponent', function(TemplateTitle, Header, SectionTitle, TextField, Section, PageComponent) {

	var pages = [];

	var page;

	var componentTemplates;
	
	var currentTemplate;

	var componentConfig;

	var addSectionTitle = function(title, section) {

		page.components.push(new SectionTitle(title));

		section.left.height = section.left.height - componentConfig.components.section.titleHeight;
	};

	var addTextFields = function(dataElement, section) {

		if(section.left.height > 0) {

			section.left.components.push(new TextField(dataElement));

			section.left.height -= componentConfig.components.text.height;
		} else {

			section.right.components.push(new TextField(dataElement));

			section.right.height -= componentConfig.components.text.height;
		}
	};

	var getHeightFor = function(section) {

		return Math.ceil(section.dataElements.length / 2) * componentConfig.components["text"].height + componentConfig.components.section.titleHeight;
	};

	var breakAndAddSection = function(section) {

		var numberOfComponentsThatCanFit = Math.floor((page.height - componentConfig.components.section.titleHeight) / componentConfig.components["text"].height) * 2;

		var newSection = _.cloneDeep(section);

		newSection.dataElements = section.dataElements.splice(numberOfComponentsThatCanFit);

		processSection(section);

		addNewPage();

		processSection(newSection);
	};

	var processSection = function(section) {

		var sectionHeight = getHeightFor(section);

		var sectionComponent = new Section(sectionHeight);

		if(page.height < componentConfig.components.section.titleHeight) {

			addNewPage();

			addTitle(currentTemplate.displayName);

			addHeader();

			processSection(section)
		}

		else if(sectionHeight < page.height) {

			addSectionTitle(section.displayName, sectionComponent);

			_.map(section.dataElements, function(dataElement) {

				addTextFields(dataElement, sectionComponent);

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
	};

	this.processComponents = function(templates, config) {

		pages = [];

		componentConfig = config;

		addNewPage();

		_.map(templates, function(template) {
			
			currentTemplate = template;

			addTitle(template.displayName);

			addHeader();
			
			currentTemplate = template;
			
			_.map(template.sections, processSection);

			return pages;
		});
		
		return pages;
	}

}]);