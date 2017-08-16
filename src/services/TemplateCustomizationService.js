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
      var removeSection = function(sectionIndex){
        if(_.isEqual(templatesType, PageTypes.DATASET))
          _.pullAt(template.sections, sectionIndex);
        else if(_.isEqual(templatesType, PageTypes.PROGRAM))
          _.pullAt(template.programStages[0].programStageSections, sectionIndex);
      };
      if(_.isEmpty(customizations[index]))
        return;
      _.map(customizations[index].partialSectionRemoval, removeDataElement);
      _.map(_.keys(customizations[index].completeSectionRemoval), removeSection);
    };

    _.map(customizedTemplates, customizeTemplate);
    return customizedTemplates;
  };
}]);
