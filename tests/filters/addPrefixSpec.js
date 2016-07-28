describe("addPrefix Filter", function() {
  var addPrefix;
  var config;
  beforeEach(function() {
    module("TallySheets")
    module(function($provide) {
      config = { Prefixes: { dataSetPrefix: 'testDSPrefix', programPrefix: 'testProgramPrefix' } };
      $provide.value('Config', config);
    });
    angular.module("d2HeaderBar", [])
    inject(function(_$filter_, $sce) {
      addPrefix = _$filter_('addPrefix');
    })
  });

  describe("when template is dataset", function() {
    it("should prefix template with dataset prefix", function() {
      var dataSet = { displayName: 'testDataSet', constructor: { name: 'DataSet' } };
      expect(addPrefix(dataSet)).toBe("testDSPrefix-testDataSet")
    })
  });

  describe("when template is program", function() {
    it("should prefix template with program prefix", function() {
      var program = { displayName: 'testProgram', constructor: { name: 'Program' } };
      expect(addPrefix(program)).toBe("testProgramPrefix-testProgram")
    })
  })

});