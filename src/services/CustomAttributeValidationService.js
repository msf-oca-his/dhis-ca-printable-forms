TallySheets.service('CustomAttributeValidationService', ['ValidationService', 'CustomAttributeService', 'Config', 'CustomAngularTranslateService', 'ModalAlertTypes', 'ServiceError', 'DhisConstants', function(ValidationService, CustomAttributeService, config, CustomAngularTranslateService, ModalAlertTypes, ServiceError, DhisConstants) {

	var getAllCustomAttributes = function() {
		var customAttributeIds = _.map(config.customAttributes, 'id');
		return _.map(customAttributeIds, function(customAttributeId) {
			var filter = DhisConstants.ApiFilters.filterById + customAttributeId;
			return CustomAttributeService.getCustomAttribute(filter).then(function(customAttribute) {
				return customAttribute
			}).catch(function(err) {
				console.log(err);
				return handleError(prepareErrorObject('fetching_custom_attributes_failed', ''));
			});
		});

	};

	var prepareErrorObject = function(message, additionalInfo) {
		var err = new Error(message);
		err.errorCode = message;
		err.errorType = Severity.ERROR;
		err.errorSrc = additionalInfo;
		return err;
	};

	var handleError = function(err) {
		return CustomAngularTranslateService.getTranslation(err.errorCode).then(function(translatedMessage) {
			var messageType = {recoverable: false};
			var completeMessage = err.errorSrc ? err.errorSrc + " : " + translatedMessage : translatedMessage;
			if(err.type == Severity.ERROR || err.type == Severity.FATAL)
				return Promise.reject(new ServiceError(completeMessage, Severity.ERROR, messageType, err.errorCode));
			return Promise.reject(new ServiceError(completeMessage, Severity.WARNING, messageType, err.errorCode));
		});
	};

	this.validate = function() {
		if(!config.customAttributes) return;
		return Promise.all(getAllCustomAttributes())
			.then(ValidationService.validateAllAttributes)
			.catch(function(err) {
				return handleError(err);
			})
	}
}]);
