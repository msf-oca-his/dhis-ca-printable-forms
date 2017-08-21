describe("TemplateCustomizationService", function()
{
  var templateCustomizationService, pageTypes;
  var dataSet = {}, customizations = [], expectedDataSets;
  beforeEach(function() {
    angular.module('d2HeaderBar', []);
    module("TallySheets");

    inject(function(TemplateCustomizationService, $q, _$rootScope_, PageTypes) {
      templateCustomizationService = TemplateCustomizationService;
      pageTypes = PageTypes;
    });
    dataSet.name = 'dataSet';
    dataSet.sections = [
      { dataElements: [ 's1de1', 's1de2', 's1de3' ] }, { dataElements: [ 's2de1', 's2de2', 's2de3' ]}, { dataElements: [ 's3de1', 's3de2', 's3de3' ] }
    ];
    customizations[0] = {partialSectionRemoval: {}, completeSectionRemoval: {}};
    expectedDataSets = [_.cloneDeep(dataSet)];
  });

  describe("when template type is dataset", function(){
    describe("when 1st and 2nd dataelements are removed from 1st section", function() {
      it("should remove 1st and 2nd elements from 1st section", function(){
        customizations[0].partialSectionRemoval[0]={'0':{}, '1': {}};
        var actualCustomizedDataSets = templateCustomizationService.customizeTemplates([dataSet], customizations, pageTypes.DATASET);
        expectedDataSets[0].sections[0].dataElements = ['s1de3'];
        expect(actualCustomizedDataSets).toEqual(expectedDataSets);
      });
    });
    describe("when 1st and 3rd dataelements are removed from 2nd section", function() {
      it("should remove 1st and 3rd elements from 2nd section", function(){
        customizations[0].partialSectionRemoval[1]={'0':{}, '2': {}};
        var actualCustomizedDataSets = templateCustomizationService.customizeTemplates([dataSet], customizations, pageTypes.DATASET);
        expectedDataSets[0].sections[1].dataElements = ['s2de2'];
        expect(actualCustomizedDataSets).toEqual(expectedDataSets);
      });
    });
    describe("when 1st section is removed and 2nd dataelement from 2nd section is removed", function() {
      it("should remove 1st sections and 2nd element from 2nd section", function(){
        customizations[0].partialSectionRemoval[1]={'1':{}};
        customizations[0].completeSectionRemoval[0]={};
        var actualCustomizedDataSets = templateCustomizationService.customizeTemplates([dataSet], customizations, pageTypes.DATASET);
        expectedDataSets[0].sections[1].dataElements = ['s2de1', 's2de3'];
        _.pullAt(expectedDataSets[0].sections, 0);
        expect(actualCustomizedDataSets).toEqual(expectedDataSets);
      });
    });
    describe("when 1st data element is removed from 1st two sections", function() {
      it("should remove 1st data element from 1st two sections", function(){
        customizations[0].partialSectionRemoval[0]={'0':{}};
        customizations[0].partialSectionRemoval[1]={'0':{}};
        var actualCustomizedDataSets = templateCustomizationService.customizeTemplates([dataSet], customizations, pageTypes.DATASET);
        expectedDataSets[0].sections[0].dataElements = ['s1de2', 's1de3'];
        expectedDataSets[0].sections[1].dataElements = ['s2de2', 's2de3'];
        expect(actualCustomizedDataSets).toEqual(expectedDataSets);
      });
    });
    describe("when 2 sections are removed", function() {
      it("should remove those 2 sections from render", function(){
        customizations[0].partialSectionRemoval = {};
        customizations[0].completeSectionRemoval[0]={};
        customizations[0].completeSectionRemoval[1]={};
        var actualCustomizedDataSets = templateCustomizationService.customizeTemplates([dataSet], customizations, pageTypes.DATASET);
        _.pullAt(expectedDataSets[0].sections, [0, 1]);
        expect(actualCustomizedDataSets).toEqual(expectedDataSets);
      });
    });
  });

});