TallySheets.service("CustomAttributeValidationService", ['CustomAttributeService', 'Config', 'CustomAngularTranslateService', 'ModalAlert', 'ModalAlertTypes', 'AlertTypes', function(CustomAttributeService, config, CustomAngularTranslateService, ModalAlert, ModalAlertTypes, AlertTypes) {

	var areConfigOptionsNotEqualTo = function(attributeFromDhis, customAttributeNameFromConfig) {
		var optionsFromDhis = _.map(attributeFromDhis.optionSet.options, 'code');
		var configOptions = _.map(config.customAttributes[customAttributeNameFromConfig].options);
		return !_.isEqual(configOptions.sort(), optionsFromDhis.sort())
	};

	var validateOptionSetOfAttribute = function(attributeFromDhis, attributeNameFromConfig) {
		if(_.isEmpty(attributeFromDhis.optionSet))
			throw prepareErrorObject("no_association_with_optionset", attributeNameFromConfig, ModalAlertTypes.indismissibleError);

		if(_.isEmpty(attributeFromDhis.optionSet.options) || _.isEmpty(config.customAttributes[attributeNameFromConfig].options))
			throw prepareErrorObject('optionset_without_options', attributeNameFromConfig, ModalAlertTypes.indismissibleError);

		if(areConfigOptionsNotEqualTo(attributeFromDhis, attributeNameFromConfig))
			throw prepareErrorObject('optionset_with_incorrect_options', attributeNameFromConfig, ModalAlertTypes.indismissibleError);

		return true;
	};

	var validateAttributeAssignment = function(attributeFromDhis, attributeNameFromConfig) {
		_.map(config.customAttributes[attributeNameFromConfig].associatedWith, function(associatedWith) {
			if(attributeFromDhis[associatedWith + "Attribute"] == true)
				return true;
			throw prepareErrorObject("no_association_with_entity", attributeNameFromConfig, ModalAlertTypes.indismissibleError);
		});
	};

	var validateCustomAttribute = function(attributeFromDhis, index) {
		var attributeNameFromConfig = Object.keys(config.customAttributes)[index];

		if(_.isEmpty(attributeFromDhis)) {
			throw prepareErrorObject('no_attribute_exists', attributeNameFromConfig, ModalAlertTypes.indismissibleError);
		}

		validateAttributeAssignment(attributeFromDhis, attributeNameFromConfig);

		if(config.customAttributes[attributeNameFromConfig].options) {
			return validateOptionSetOfAttribute(attributeFromDhis, attributeNameFromConfig);
		}
		return true
	};

	var validateAllAttributes = function(allCustomAttributesFromDhis) {
		try {
			return _(allCustomAttributesFromDhis)
				.map(validateCustomAttribute)
				.value();
		}
		catch(err) {return Promise.reject(err)}
	};

	var getAllCustomAttributes = function() {
		try {
			return _(config.customAttributes)
				.map('id')
				.map(CustomAttributeService.getCustomAttribute)
				.value()
		}
		catch(err) {
			var messageType = {
				recoverable: true
			};
			return Promise.reject(new ServiceError(err.message, Severity.ERROR, messageType, err.message));
		}
	};

	var prepareErrorObject = function(message, additionalInfo, type) {
		var err = new Error(message);
		err.errorSrc = additionalInfo;
		err.type = type;
		return err;
	};

	var handleError = function(err) {
		var messageType = {
			recoverable: true
		};
		return CustomAngularTranslateService.getTranslation(err.message).then(function(translatedMessage) {
			if(err.type == ModalAlertTypes.indismissibleError)
				messageType.recoverable = false;
			else if(err.type == ModalAlertTypes.dismissibleError)
				messageType.recoverable = true;

			var completeMessage = err.errorSrc ? err.errorSrc + " : " + translatedMessage : translatedMessage;
			return Promise.reject(new ServiceError(completeMessage, Severity.ERROR, messageType, err.message));
		});
	};

	this.validate = function() {
		// validateConfigFile();
		if(!config.customAttributes) return;
		return Promise.all(getAllCustomAttributes())
			.then(validateAllAttributes)
			.catch(function(err) {
				return handleError(err);
			})
	}
}]);
