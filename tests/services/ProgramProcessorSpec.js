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

  describe("process program of type coversheet", function () {
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


      it("should process the program with sections of type catcomb without category optionCombos", function () {
        var currentTestProgram = _.clone(testProgram);
        //section height would be 32 and dataset title would be 10 and datasection title would be 7 total height is 237-49=188
        var expectedPages = [
          {
            heightLeft: 188,
            widthLeft: 183,
            contents: [
              {type: 'dataSetName', name: "test program"},
              {type: 'section', section: currentTestProgram.stageSections[0]},
              {type: 'comments'}
            ],
            programName: "test program"
          }
        ];
        var actualPages = programProcessor.process(currentTestProgram,"coversheet");
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
            heightLeft: 188,
            widthLeft: 183,
            contents: [
              {type: 'dataSetName', name: "test program"},
              {type: 'section', section: expectedSection},
              {type: 'comments'}
            ],
            programName: "test program"
          }
        ];
        var actualPages = programProcessor.process(currentTestProgram,'coversheet');
        expect(actualPages).toEqual(expectedPages);
      });


      it("should process the program with sections of type catcomb with catgory option combos are overflowed", function () {

        var currentProgram = _.cloneDeep(testProgram);

        currentProgram.stageSections[0].dataElements[0].categoryCombo.categoryOptionCombos = ["male,<5", "female,<7", "male,<10", "female,<11", "female,<12", "male,<10"];

        var expectedSection1 = _.cloneDeep(currentProgram.stageSections[0]);

        expectedSection1.dataElements[0].categoryCombo.categoryOptionCombos = ["male<br><5", "female<br><7", "male<br><10", "female<br><11"];

        var expectedDuplicateSection = {
          name: "test section",
          id: "1234",
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
        };


        var expectedPages = [{
          heightLeft: 156,
          widthLeft: 183,
          contents: [
            {type: 'dataSetName', name: "test program"},
            {type: 'section', section: expectedSection1},
            {type: 'section', section: expectedDuplicateSection},
            {type: 'comments'}
          ],
          programName: "test program"
        }];

        var actualPages = programProcessor.process(currentProgram,'coversheet');
        expect(actualPages[0]).toEqual(expectedPages[0]);

      });

      it("should process the program with overflowed section of type catcomb", function () {
        var currentTestProgram = _.cloneDeep(testProgram);

        var assignCOCToSection = function (section, numofDe) {
          for (var index = 0; index < numofDe; index++) {
            section.dataElements[index] = _.cloneDeep(testProgram.stageSections[0].dataElements[0]);
          }
        };

        assignCOCToSection(currentTestProgram.stageSections[0], 20);

        var expectedSection1 = _.cloneDeep(testProgram.stageSections[0]);
        assignCOCToSection(expectedSection1, 16); //because 16 elements will fit into the first page

        var expectedSection2 = _.cloneDeep(testProgram.stageSections[0]);
        assignCOCToSection(expectedSection2, 4);
        expectedSection2.isDuplicate = false;
        var expectedPages = [{
          heightLeft: 0,
          width: 183,
          contents: [
            {type: 'dataSetName', name: "test program"},
            {type: 'section', section: expectedSection1}],
          datasetName: "test program"
        },
          {
            heightLeft: 164,
            width: 183,
            contents: [
              {type: 'section', section: expectedSection2},
              {type: 'comments'}],
            datasetName: "test program"
          }];

        var actualPages = programProcessor.process(currentTestProgram,'coversheet');

        expect(actualPages[0].contents).toEqual(expectedPages[0].contents);
        expect(actualPages[1].contents).toEqual(expectedPages[1].contents);
      });

    });

  })
});
