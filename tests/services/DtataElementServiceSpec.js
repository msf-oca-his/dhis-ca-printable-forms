/**
 * Created by anilkumk on 5/11/16.
 */
describe("DataElementService",function(){
  var dataElementService;

  beforeEach(function () {
    angular.module('d2HeaderBar',[])
  });
  beforeEach(module("TallySheets"));
  beforeEach(inject(function(DataElementService){
   dataElementService=  DataElementService;
  }));
  describe("getDataElementFromData",function(){
    it("Should get data element object",function(){
      var responseData = {
        id:123,
        name:"Karma",
        categoryCombo:"",
        type:"DataSet",
        OptionSet:"OptionSets",
        Options:true
      };
      var expectedData = {
        name:"Karma",
        id:123,
        type:"DataSet",
        categoryCombo:""
      };
      var actualData = dataElementService.getDataElementFromData(responseData);
      expect(actualData).toEqual(expectedData);
    })
  });

});