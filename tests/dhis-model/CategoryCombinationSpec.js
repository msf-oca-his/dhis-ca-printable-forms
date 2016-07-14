var CategoryCombination = require("../../src/dhis-model/CategoryCombination.js")

var data = {
  id: 'catcombid',
  name: 'catcombname',
  categories: [
    {
      id: 'catid1',
      name: 'catname1'
    },
    {
      id:'catid2',
      name: 'catname2'
    }
  ]
};
var testData;

describe("CategoryCombination", function(){

  beforeEach(function(){
    testData = _.cloneDeep(data)
  });

  it("should create valid CategoryCombination object when given valid data", function(){

    var categoryComboination = new CategoryCombination(testData);
    expect(_.isEqual(categoryComboination, testData)).toEqual(true)
  });

  it("should create a valid object if partial data is passed", function(){
    testData.name = null;
    var categoryComboination = new CategoryCombination(testData);
    expect(_.isEqual(categoryComboination, testData)).toEqual(true)
  });

  it("should create required CategoryCombination object even if extra data is passed", function(){
    testData.extraField = 'extraField';
    testData.categories[0].extraField = 'extraField';
    var categoryComboination = new CategoryCombination(testData);
    delete(testData.extraField)
    delete(testData.categories[0].extraField)
    expect(_.isEqual(categoryComboination, testData)).toEqual(true)
  });

  it("should create an empty object if null or undefined is passed", function(){
    var categoryComboination = new CategoryCombination();
    expect(_.isEqual(categoryComboination, {})).toEqual(true)

    categoryComboination = new CategoryCombination(null);
    expect(_.isEqual(categoryComboination, {})).toEqual(true)

    categoryComboination = new CategoryCombination(undefined);
    expect(_.isEqual(categoryComboination, {})).toEqual(true)
  });

  it("should create an empty categories array if categories passed is null or undefined", function(){
    delete(testData.categories);
    var categoryComboination = new CategoryCombination(testData);
    expect(_.isEqual(categoryComboination.categories, [])).toEqual(true)

    testData.categories = undefined;
    categoryComboination = new CategoryCombination(testData);
    expect(_.isEqual(categoryComboination.categories, [])).toEqual(true)
  });

  it("should create an empty category object if categories passed has an object without id and name", function(){
    delete(testData.categories[0].name);
    delete(testData.categories[0].id);
    testData.categories[0].extraField = 'extraField'
    var categoryComboination = new CategoryCombination(testData);
    expect(_.isEqual(categoryComboination.categories[0], {})).toEqual(true)
    expect(_.isEqual(categoryComboination.categories[1], testData.categories[1])).toEqual(true)
  });

  it("should create partial category object with available fields in the category's data passed", function() {
    delete(testData.categories[0].name);
    var categoryComboination = new CategoryCombination(testData);
    expect(_.isEqual(categoryComboination.categories[0], testData.categories[0])).toEqual(true)
  })
});