describe("ProgramProcessor", function () {
  var programProcessor;
  var httpMock;
  var $rootScope;
  var timeout;
  var p;
  var config;

  beforeEach(function () {
    angular.module('d2HeaderBar', []);
    module("TallySheets");
    optionsObject = {
      123: {id: "123", name: "male", options: {name: "option1"}},
      12: {id: "12", name: "female", options: {name: "option2"}}
    };
    module(function ($provide) {
      $provide.value('OptionSetFactory', Promise.resolve(optionsObject));
    });
  });

  beforeEach(inject(function (ProgramProcessor, $httpBackend, $q, _$rootScope_, $timeout, Config) {
    programProcessor = ProgramProcessor;
    p = $q;
    $rootScope = _$rootScope_;
    httpMock = $httpBackend;
    timeout = $timeout;
    config = Config;
    httpMock.expectGET("languages/en.json").respond(200, {});
  }));

  describe("process dataset", function () {
    it("should process the basic program without stage sections to check page width and height", function () {
      var testProgram = {
        id: "123",
        isPrintFriendlyProcessed: true,
        isResolved: Promise.resolve({}),
        name: "test program",
        stageSections:[],
        type: "program"
      };

      var expectedPages = [{
        heightLeft: config.DataSet.availableHeight,
        widthLeft: config.DataSet.availableWidth,
        contents: [{type: 'comments'}],
        programName: "test program"
      }];

      var actualPages = programProcessor.process(testProgram, 'coversheet');
      expect(actualPages).toEqual(expectedPages);
    });

    describe("sections with Only Catcombs", function () {

      var testProgram = {
        id: "123",
        isPrintFriendlyProcessed: true,
        isResolved: Promise.resolve({}),
        name: "test program",
        stageSections: [{
          dataElements: [{
            categoryCombo: {
              id: "154",
              categoryOptionCombos: ["female<br><12", "male<br><10"],
              isResolved: Promise.resolve({}),
              name: "catcomb"
            },
            id: "1234",
            isResolved: Promise.resolve({}),
            name: "dataElement",
            type: "TEXT",
          }

          ],
          id: "1234",
          isCatComb: true,
          isResolved: Promise.resolve({}),
          name: "test section"
        }],
        type: "program"
      };


      it("should process the program with sections of type catcomb with category optionCombos", function () {
        var myprogram = _.clone(testProgram);
        //section height would be 32 and dataset title would be 10 and datasection title would be 7 total height is 237-49=188
        var expectedPages = [
          {
            heightLeft: 150,
            widthLeft: 170,
            contents: [
               myprogram.stageSections[0].dataElements[0],
              { name: 'Comments', id: undefined, type:"TEXT", categoryCombo: undefined}
            ],
            programName: "test program"
          }
        ];
        var actualPages = programProcessor.process(myprogram);
        expect(actualPages).toEqual(expectedPages);
      });

      it("should process the program with sections of type catcomb with category option combos", function () {
        var currentTestProgram = _.clone(testProgram);

        currentTestProgram.stageSections[0].dataElements[0].categoryCombo.categories = [{
          id: "123",
          name: "Gender"
        }];

        currentTestProgram.stageSections[0].dataElements[0].categoryCombo.categoryOptionCombos = ["male,5", "female,7"];

        var expectedSection = _.cloneDeep(currentTestProgram.stageSections[0]);

        expectedSection.dataElements[0].categoryCombo.categoryOptionCombos = ["male<br>5", "female<br>7"];

        var expectedPages = [
          {
            heightLeft: 150,
            widthLeft: 170,
            contents: [
              currentTestProgram.stageSections[0].dataElements[0],
              { name: 'Comments', id: undefined, type:"TEXT", categoryCombo: undefined}
            ],
            programName: "test program"
          }
        ];
        var actualPages = programProcessor.process(currentTestProgram);
        expect(actualPages).toEqual(expectedPages);
      });

      
      it("should process the dataset with sections of type catcomb with catgory option combos are overflowed", function () {

        var currentProgram = _.cloneDeep(testProgram);

        currentProgram.stageSections[0].dataElements[0].categoryCombo.categoryOptionCombos = ["male,<5", "female,<7", "male,<10", "female,<11", "female,<12", "male,<10"];

        var expectedSection1 = _.cloneDeep(currentProgram.stageSections[0]);

        expectedSection1.dataElements[0].categoryCombo.categoryOptionCombos = ["male<br><5", "female<br><7", "male<br><10", "female<br><11"];

        var expectedDuplicateSection = {
          name: "section",
          id: "134",
          dataElements: [{
            name: "dataElement",
            id: "1234",
            type: "TEXT",
            categoryCombo: {
              id: "154",
              categoryOptionCombos: ["female<br><12", "male<br><10"],
              isResolved: Promise.resolve({}),
              name: "catcomb",
              categories: [{id: '123', name: 'Gender'}]
            }
          }],
          isCatComb: true,
          isDuplicate: true
        }


        var expectedPages = [
          currentProgram.stageSections[0].dataElements[0]
        ];

        var actualPages = programProcessor.process(currentProgram);
        expect(actualPages[0].contents[0]).toEqual(expectedPages[0]);

      });

    });

    describe("sections of type Optionsets", function () {

      var testProgram = {
        id: "123",
        isPrintFriendlyProcessed: true,
        isResolved: Promise.resolve({}),
        name: "test program",
        stageSections: [{
          dataElements: [{
            categoryCombo: {
              id: "154",
              isResolved: Promise.resolve({}),
              name: "dataElement",
              options: [{id: 1, name: "option1"}, {id: 2, name: "option2"}],
              type: "OPTIONSET"
            },
            id: "1234",
            isResolved: Promise.resolve({}),
            name: "dataElement",
            type: "TEXT",
          }

          ],
          id: "1234",
          isResolved: Promise.resolve({}),
          name: "test section"
        }],
        type: "program"
      };

      it("should process the section contain only one dataelement of type optionset", function () {
        var currentTestDataSet = _.cloneDeep(testProgram);

        var expectedSection = _.cloneDeep(currentTestDataSet.stageSections[0]);

        var expectedRows = [[{id: 1, name: "option1"}, {id: 2, name: "option2"}]];

        expectedSection.dataElements[0].rows = expectedRows;
        expectedSection.isOptionSet = true;
        expectedSection.leftSideElements = [expectedSection.dataElements[0]];
        expectedSection.rightSideElements = [];


        var expectedPages = [
          currentTestDataSet.stageSections[0].dataElements[0],
          { name: 'Comments', id: undefined, type:"TEXT", categoryCombo: undefined}
        ];

        var actualPages = programProcessor.process(currentTestDataSet);
        expect(actualPages[0].contents).toEqual(expectedPages);
      });





    });

  })
});
