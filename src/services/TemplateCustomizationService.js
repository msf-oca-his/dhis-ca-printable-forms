TallySheets.service('TemplateCustomizationService', [ 'PageTypes', function(PageTypes) {
  this.customizeTemplates = function(templates, customizations, templatesType){
    var customizedTemplates = _.cloneDeep(templates);

    var customizeTemplate = function(template, index){
      var removeDataElement = function(dataElementIndexesAsObjects, sectionIndex){
        if(_.isEqual(templatesType, PageTypes.DATASET))
          _.pullAt(template.sections[sectionIndex].dataElements, _.keys(dataElementIndexesAsObjects));
        else if(_.isEqual(templatesType, PageTypes.PROGRAM))
          _.pullAt(template.programStages[0].programStageSections[sectionIndex].programStageDataElements, _.keys(dataElementIndexesAsObjects));
      };
      var removeSections = function(sectionIndexes){
        if(_.isEqual(templatesType, PageTypes.DATASET))
          _.pullAt(template.sections, sectionIndexes);
        else if(_.isEqual(templatesType, PageTypes.PROGRAM))
          _.pullAt(template.programStages[0].programStageSections, sectionIndexes);
      };
      if(_.isEmpty(customizations[index]))
        return;
      _.map(customizations[index].partialSectionRemoval, removeDataElement);
       removeSections(_.keys(customizations[index].completeSectionRemoval));
    };

    _.map(customizedTemplates, customizeTemplate);
    return customizedTemplates;
  };
}]);
