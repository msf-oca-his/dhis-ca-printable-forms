var dataElement = {
  id: 'dataElementId',
  name: 'dataElement',
  displayFormName: 'displayName',
  optionSetValue: 'optionSetValue',
  optionSet: {
    options: 'options'
  },
  categoryCombo: {
    name: 'default'
  }
};
var testDataElement;
var mockedCategoryCombination;
var dhisModel;
describe("DataElement", function() {

  beforeEach(function() {
    testDataElement = _.cloneDeep(dataElement)
    angular.module('d2HeaderBar', []);
    module('DhisCommons');
  });

  beforeEach(inject(function(DhisModel) {
    mockedCategoryCombination = {};
    dhisModel = DhisModel;
    mockedCategoryCombination = dhisModel.CategoryCombination
  }));

  it("should create dataElement with value type OPTIONSET when option set value is present and catcombo is default", function() {
    var expectedDateElement = {
      id: 'dataElementId',
      name: 'dataElement',
      displayFormName: 'displayName',
      options: 'options',
      valueType: 'OPTIONSET'
    };
    var actualDataElement = new dhisModel.DataElement(testDataElement);
    expect(_.isEqual(actualDataElement, expectedDateElement)).toEqual(true)
  });

  it("should create dataElement with value type default when optionset value not present and catcombo is default", function() {
    delete(testDataElement.optionSetValue);
    delete(testDataElement.optionSet);

    var expectedDateElement = {
      id: 'dataElementId',
      name: 'dataElement',
      displayFormName: 'displayName',
      valueType: 'TEXT'
    };

    var actualDataElement = new dhisModel.DataElement(testDataElement);
    expect(_.isEqual(actualDataElement, expectedDateElement)).toEqual(true)
  });

});