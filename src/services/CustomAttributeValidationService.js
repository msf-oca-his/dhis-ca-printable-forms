TallySheets.service("CustomAttributeValidationService", ['CustomAttributeService', 'Config', 'CustomAngularTranslateService', 'ModalAlert', 'ModalAlertTypes', 'ModalAlertsService', function(CustomAttributeService, config, CustomAngularTranslateService, ModalAlert, ModalAlertTypes, ModalAlertsService) {

	var areConfigOptionsNotEqualTo = function(attributeFromDhis, customAttributeNameFromConfig) {
		var optionsFromDhis = _.map(attributeFromDhis.optionSet.options, 'code')
		var configOptions = _.map(config.CustomAttributes[customAttributeNameFromConfig].options);
		return !_.isEqual(configOptions.sort(), optionsFromDhis.sort())
	};

	var validateOptionSetOfAttribute = function(attributeFromDhis, attributeNameFromConfig) {
		if(_.isEmpty(attributeFromDhis.optionSet))
			throw prepareErrorObject("NO_ASSOCIATION_WITH_OPTIONSET", attributeNameFromConfig, ModalAlertTypes.dismissibleError);
		if(_.isEmpty(attributeFromDhis.optionSet.options))
			throw prepareErrorObject('OPTIONSET_WITHOUT_OPTIONS', attributeNameFromConfig, ModalAlertTypes.dismissibleError);
		if(areConfigOptionsNotEqualTo(attributeFromDhis, attributeNameFromConfig))
			throw prepareErrorObject('OPTIONSET_WITH_INCORRECT_OPTIONS', attributeNameFromConfig, ModalAlertTypes.dismissibleError);
		return true;
	};

	var validateAttributeAssignment = function(attributeFromDhis, attributeNameFromConfig) {
		_.map(config.CustomAttributes[attributeNameFromConfig].associatedWith, function(associatedWith) {
			if(attributeFromDhis[associatedWith + "Attribute"] == true)
				return true;
			throw prepareErrorObject("NO_ASSOCIATION_WITH_ENTITY", attributeNameFromConfig, ModalAlertTypes.indismissibleError);
		});
	};

	var validateCustomAttribute = function(attributeFromDhis, index) {
		var attributeNameFromConfig = Object.keys(config.CustomAttributes)[index];

		if(_.isEmpty(attributeFromDhis)) {
			throw prepareErrorObject('NO_ATTRIBUTE_EXISTS', attributeNameFromConfig, ModalAlertTypes.indismissibleError);
		}

		validateAttributeAssignment(attributeFromDhis, attributeNameFromConfig);

		if(config.CustomAttributes[attributeNameFromConfig].options) {
			return validateOptionSetOfAttribute(attributeFromDhis, attributeNameFromConfig);
		}
		return true;
	};

	var validateAllAttributes = function(allCustomAtrributesFromDhis) {
		try {
			return _(allCustomAtrributesFromDhis)
				.map(validateCustomAttribute)
				.value();
		}
		catch(err) {return Promise.reject(err)}
	};

	var getAllCustomAttributes = function() {
		try {
			return _(config.CustomAttributes)
				.map('id')
				.map(CustomAttributeService.getCustomAttribute)
				.value()
		}
		catch(err) {return Promise.reject(err);}
	};

	// var validateConfigFile = function() {
	// 	_.map(config.CustomAttributes, function(customAttribute, customAttributeNameInConfig) {
	// 		if(!customAttribute.id) throw prepareErrorObject('CUSTOM_ATTRIBUTE_HAS_NO_ID_FIELD', customAttributeNameInConfig);
	// 	});
	// };

	var prepareErrorObject = function(message, additionalInfo, type) {
		var err = new Error(message);
		err.errorSrc = additionalInfo;
		err.type = type;
		return err;
	};

	var handleError = function(err) {
		CustomAngularTranslateService.getTranslation(err.message)
			.then(function(translatedMessage) {
				// alert(err.errorSrc + " : " + translatedMessage);
				ModalAlertsService.showModalAlert(new ModalAlert(err.errorSrc + " : " + translatedMessage, err.type))
			})
			.catch(function(err) {console.log(err)});
	};

	this.validate = function() {
		try {
			// validateConfigFile();
			if(!config.CustomAttributes) return;
			return Promise.all(getAllCustomAttributes())
				.then(validateAllAttributes)
				.catch(function(err) {
					handleError(err);
					return Promise.reject();
				})
		}
		catch(err) {
			return Promise.reject();
		}
	}
}]);
