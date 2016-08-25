/**
 * Created by durgaman on 8/25/16.
 */

TallySheets.service("ConfigValidationService", ['CustomAttributeService', 'Config', '$translate', function(CustomAttributeService, config, $translate) {

	var validationObject = {};

	var isAttributeNotPresentInConfig = function(attributeUID) {
		return _.isEmpty(attributeUID);
	};

	var isAttributeAssignedToTemplate = function(attribute) {
		return attribute != undefined && (attribute.dataSetAttribute && attribute.programAttribute)
	};

	var areConfigOptionsNotEqualTo = function(systemOptions) {
		var systemOptions = _.map(systemOptions, function(option) {
			return option.code
		});

		var configOptions = _.map(config.DisplayOptions, function(option) {
			return option
		});
		return !_.isEqual(configOptions.sort(), systemOptions.sort())
	};

	var isAttributeAssignedToDataElement = function(attribute) {
		if(attribute.dataElementAttribute == false) {
			return $translate('NO_ASSOCIATION_WITH_DATAELEMENT').then(function(translatedValue) {
				validationObject.alertShown = true;
				alert(translatedValue)
				return validationObject;
			});
		} else {
			return true;
		}
	};

	var isPrintableAttributeValid = function() {
		return Promise.all([CustomAttributeService.getCustomAttribute(config.CustomAttributes.printFlagUID)])
			.then(function(customAttribute) {
				var attribute = _.flatten(customAttribute);
				if(_.isEmpty(attribute[0])) {
					return $translate('NO_ATTRIBUTE_EXISTS').then(function(translatedValue) {
						validationObject.alertShown = true;
						alert(translatedValue);
						return validationObject;
					});
				}
				else {
					if(!(isAttributeAssignedToTemplate(attribute[0]))) {
						return $translate('NO_ASSOCIATION_WITH_ATTRIBUTE').then(function(translatedValue) {
							validationObject.alertShown = true;
							alert(translatedValue);
							return validationObject;
						});
					}
					else {
						validationObject.showAllTemplates = false;
						return validationObject;
					}
				}
			});
	};

	var isAttributeValid = function(attribute) {
		if(_.isEmpty(attribute.optionSet)) {
			return $translate('NO_ASSOCIATION_WITH_OPTIONSET').then(function(translatedValue) {
				validationObject.alertShown = true;
				alert(translatedValue);
				return validationObject;
			});
		}

		else if(_.isEmpty(attribute.optionSet.options)) {
			return $translate('OPTIONSET_WITHOUT_OPTIONS').then(function(translatedValue) {
				validationObject.alertShown = true;
				alert(translatedValue);
				return validationObject;
			});
		}
		else {
			var yes = areConfigOptionsNotEqualTo(attribute.optionSet.options);
			if(yes) {
				return $translate('OPTIONSET_WITH_INCORRECT_OPTIONS').then(function(translatedValue) {
					validationObject.alertShown = true;
					alert(translatedValue);
					return validationObject;
				});
			}
			else {
				return isAttributeAssignedToDataElement(attribute);
			}
		}
	};

	var isDisplayOptionsAttributeValid = function() {
		return Promise.all([CustomAttributeService.getCustomAttribute(config.CustomAttributes.displayOptionUID)]).then(function(customAttribute) {
			var attribute = _.flatten(customAttribute);
			attribute = attribute[0];

			if(_.isEmpty(attribute)) {
				return $translate('NO_ATTRIBUTE_EXISTS').then(function(translatedValue) {
					validationObject.alertShown = true;
					alert(translatedValue);
					return validationObject;
				});
			}
			else {
				return isAttributeValid(attribute);
			}
		})
	};

	this.validate = function() {
		var promises = [];
		var noDisplayOptionUID = isAttributeNotPresentInConfig(config.CustomAttributes.displayOptionUID);
		var noPrintFlagUID = isAttributeNotPresentInConfig(config.CustomAttributes.printFlagUID);

		if(noPrintFlagUID && noDisplayOptionUID) {
			validationObject.showAllTemplates = true;
		}

		else if(!noPrintFlagUID && noDisplayOptionUID) {
			promises.push(isPrintableAttributeValid());
		}

		else if(noPrintFlagUID && !noDisplayOptionUID) {
			promises.push(isDisplayOptionsAttributeValid().then(function(isValid) {
				if(isValid) {
					validationObject.showAllTemplates = true;
				}
			}));
		}
		else {
			promises.push(isDisplayOptionsAttributeValid().then(function(isValid) {
				if(isValid) {
					validationObject.showAllTemplates = false;
				}
			}));
		}

		return Promise.all(promises).then(function() {
			return validationObject;
		})
	}
}]);
