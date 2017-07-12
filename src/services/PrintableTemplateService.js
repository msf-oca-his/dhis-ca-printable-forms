TallySheets.service('PrintableTemplateService', ['DataSetService', 'ProgramService', 'Config', 'ModalAlert',
	'ModalAlertTypes', 'ModalAlertsService', 'CustomAngularTranslateService', '$q', 'DhisConstants', 'UserService', 'Template', 'TemplateTypes',
	function(DataSetService, ProgramService, config, ModalAlert, ModalAlertTypes, ModalAlertsService,
		CustomAngularTranslateService, $q, DhisConstants, UserService, Template, TemplateTypes) {

		var dataSetPrefix, programPrefix;
		var alertForEmptyTemplates = function(templates) {
			if(templates.length == 0) {
				CustomAngularTranslateService.getTranslation('attribute_not_set').then(function(translatedMessage) {
					ModalAlertsService.showModalAlert(new ModalAlert(translatedMessage, ModalAlertTypes.indismissibleError));
				});
			}
		};

		var getPrintableAttribute = function(attributeValues) {
			return _.reduce(_.filter(attributeValues, function(attributeValue) {
				if(attributeValue.attribute.id === config.customAttributes.printFlagUID.id) {
					return attributeValue;
				}
			}));
		};

		var isPrintableTemplate = function(template) {
			var printableAttribute = getPrintableAttribute(template.attributeValues);
			return printableAttribute && printableAttribute.value == DhisConstants.Boolean.true;
		};

		var prepareError = function(message, config) {
			var err = new Error(message);
			err.errorCode = message;
			err.errorType = "error";
			err.errorSrc = config;
			return err
		};

		var getDataSetsAndPrograms = function() {
			return (config.showUserRelatedFormsOnly) ? $q.when(UserService.getDataSetsAndPrograms()) : $q.all([DataSetService.getAllDataSets(), ProgramService.getAllPrograms()]);
		};

		var getTranslatedPrefixesForTemplates = function() {
			return $q.all([CustomAngularTranslateService.getTranslation(config.Prefixes.dataSetPrefix.translationKey), CustomAngularTranslateService.getTranslation(config.Prefixes.programPrefix.translationKey)])
				.then(function(prefixes) {
					dataSetPrefix = prefixes[0];
					programPrefix = prefixes[1];
				})
		};

		var prepareTemplates = function(dataSetsAndPrograms) {
			function prepareDataSetTemplate(dataSet) {
				return new Template(TemplateTypes.dataSet, dataSet, dataSetPrefix + dataSet.displayName)
			}

			function prepareProgramTemplate(program) {
				return new Template(TemplateTypes.program, program, programPrefix + program.displayName)
			}

			if(_.isEmpty(dataSetsAndPrograms[0]) && _.isEmpty(dataSetsAndPrograms[1]))
				return $q.reject(prepareError("no_templates", ""));

			var dataSets = config.customAttributes.printFlagUID ? _.filter(dataSetsAndPrograms[0], isPrintableTemplate) : dataSetsAndPrograms[0];
			var programs = config.customAttributes.printFlagUID ? _.filter(dataSetsAndPrograms[1], isPrintableTemplate) : dataSetsAndPrograms[1];

			var dataSetTemplates = _(dataSets)
				.map(prepareDataSetTemplate)
				.value();

			var programTemplates = _(programs)
				.map(prepareProgramTemplate)
				.value();
			return _.flatten([dataSetTemplates, programTemplates]);
		};

		//TODO: UX input: How should alerts be handled ?
		this.getTemplates = function() {
			return $q.when(getTranslatedPrefixesForTemplates())
				.then(getDataSetsAndPrograms)
				.then(prepareTemplates)
				.then(function(templates) {
					alertForEmptyTemplates(templates);
					return templates;
				})
				.catch(function(err) {
					//TODO: should not always go to home
					return CustomAngularTranslateService.getTranslation(err.errorCode).then(function(translatedMessage) {
						return CustomAngularTranslateService.getTranslation('go_to_home').then(function(buttonText) {
							return ModalAlertsService.showModalAlert(new ModalAlert(translatedMessage, ModalAlertTypes.indismissibleError, buttonText));
						});
					});
				})
		};

	}])
;