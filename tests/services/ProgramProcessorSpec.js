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
    httpMock.expectGET("i18n/en.json").respond(200, {});
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

      it("should process the program with overflowed section height is less than grace height", function () {
        var currentTestProgram = _.cloneDeep(testProgram);

        var assignCOCToSection = function (section, numofDe) {
          for (var index = 0; index < numofDe; index++) {
            section.dataElements[index] = _.cloneDeep(testProgram.stageSections[0].dataElements[0]);
          }
        };

        assignCOCToSection(currentTestProgram.stageSections[0], 17);

        var expectedSection1 = _.cloneDeep(testProgram.stageSections[0]);
        assignCOCToSection(expectedSection1, 17); //because 17 elements will fit into the first page
        var expectedPages = [{
          heightLeft: 0,
          width: 183,
          contents: [
            {type: 'dataSetName', name: "test program"},
            {type: 'section', section: expectedSection1}],
          datasetName: "test program"
        }];

        var actualPages = programProcessor.process(currentTestProgram,'coversheet');
        expect(actualPages[0].contents).toEqual(expectedPages[0].contents);
      });

      it("should process the dataset with overflowed elements are exactly one", function () {
        var currentTestProgram = _.cloneDeep(testProgram);

        var assignCOCToSection = function (section, numofDe) {
          for (var index = 0; index < numofDe; index++) {
            section.dataElements[index] = _.cloneDeep(testProgram.stageSections[0].dataElements[0]);
          }
        };

        assignCOCToSection(currentTestProgram.stageSections[0], 15);
        currentTestProgram.stageSections[1] = _.cloneDeep(testProgram.stageSections[0]);
        assignCOCToSection(currentTestProgram.stageSections[1],1);
        var expectedSection1 = _.cloneDeep(testProgram.stageSections[0]);
        assignCOCToSection(expectedSection1, 15); //because 17 elements will fit into the first page
        var expectedSection2 = _.cloneDeep(currentTestProgram.stageSections[1]);
        assignCOCToSection(expectedSection2,1);
        expectedSection2.isDuplicate = false;

        var expectedPages = [{
          heightLeft: 0,
          width: 183,
          contents: [
            {type: 'dataSetName', name: "test program"},
            {type: 'section', section: expectedSection1}],
          datasetName: "test program"
        },{
          contents:[
            {type:'section',section:expectedSection2},
            {type:'comments'}
          ]
        }];

        var actualPages = programProcessor.process(currentTestProgram,'coversheet');
        expect(actualPages[0].contents).toEqual(expectedPages[0].contents);
        expect(actualPages[1].contents).toEqual(expectedPages[1].contents)
      });

    });

    describe("Section with option sets", function(){
      var testProgram = {
        id: "123",
        isPrintFriendlyProcessed: true,
        isResolved: Promise.resolve({}),
        name: "test program",
        stageSections: [{
          dataElements: [{
            id: "1234",
            isResolved: Promise.resolve({}),
            name: "dataElement",
            options: [{id: 1, name: "option1"}, {id: 2, name: "option2"}],
            type: "OPTIONSET"
          }],
          id: "134",
          isResolved: Promise.resolve({}),
          name: "section"
        }],
        type: 'program'
      };

      it("should process the section contain only one dataelement of type optionset", function () {
        var currentTestProgram = _.cloneDeep(testProgram);

        var expectedSection = _.cloneDeep(currentTestProgram.stageSections[0]);

        var expectedRows = [[{id: 1, name: "option1"}, {id: 2, name: "option2"}]];

        expectedSection.dataElements[0].rows = expectedRows;
        expectedSection.isOptionSet = true;
        expectedSection.leftSideElements = [expectedSection.dataElements[0]];
        expectedSection.rightSideElements = [];


        var expectedPages = [{
          heightLeft: 0,
          width: 183,
          contents: [
            {type: 'dataSetName', name: "test program"},
            {type: 'section', section: expectedSection},
            {type:'comments'}],
          datasetName: "test program"
        }];

        var actualPages = programProcessor.process(currentTestProgram,'coversheet');
        expect(actualPages[0].contents).toEqual(expectedPages[0].contents);
      });


      it("should process the program which contians dataelement of type optionsets where options are overflowed", function () {
        var currentTestProgram = _.cloneDeep(testProgram);

        var assignOptionsToDe = function (section, numberOfOptions) {
          for (var index = 0; index < numberOfOptions; index++) {
            section.dataElements[0].options[index] = {id: 1, name: "option"};
          }
        }
        assignOptionsToDe(currentTestProgram.stageSections[0], 76);//75 options will overflow to the new page

        var expectedSection1 = _.cloneDeep(testProgram.stageSections[0]);
        assignOptionsToDe(expectedSection1, 72);
        var expectedRows1 = [];
        for (var i = 0; i < 24; i++) {
          var j = 0;
          while (j < 3) {
            if (j == 0)
              expectedRows1.push([{id: 1, name: "option"}]);
            else
              expectedRows1[i].push({id: 1, name: "option"});
            j++;
          }
        }

        expectedSection1.dataElements[0].rows = expectedRows1;
        expectedSection1.isOptionSet = true;
        expectedSection1.leftSideElements = [expectedSection1.dataElements[0]];
        expectedSection1.rightSideElements = [];

        var expectedSection2 = _.cloneDeep(testProgram.stageSections[0]);
        assignOptionsToDe(expectedSection2, 4);

        var expectedRows2 = [];
        expectedRows2[0] = [];
        expectedRows2[1] = []
        expectedRows2[0].push({id: 1, name: "option"},{id: 1, name: "option"});

        expectedRows2[1].push({id: 1, name: "option"},{id: 1, name: "option"});


        expectedSection2.dataElements[0].rows = expectedRows2;
        expectedSection2.isOptionSet = true;
        expectedSection2.leftSideElements = [expectedSection2.dataElements[0]];
        expectedSection2.rightSideElements = [];
        expectedSection2.isDuplicate = false;

        var expectedPages = [{
          contents: [
            {type: 'dataSetName', name: "test program"},
            {type: 'section', section: expectedSection1}],
          datasetName: "test program"
        }, {
          contents: [
            {type: 'section', section: expectedSection2},
            {type:'comments'}],
          datasetName: "test program"
        }];
        var acutalPages = programProcessor.process(currentTestProgram,'coversheet');
        expect(acutalPages[1].contents).toEqual(expectedPages[1].contents);
        expect(acutalPages[0].contents[1]).toEqual(expectedPages[0].contents[1]);
      });

      it("should process the program which contains dataelements of type option set and general dataelements", function () {
        var currentTestProgram = _.cloneDeep(testProgram);
        currentTestProgram.stageSections[0].dataElements[1] = {
          id: "1",
          name: "general de"
        };

        var expectedSection1 = _.cloneDeep(testProgram.stageSections[0]);
        var expectedRows1 = [[{id: 1, name: "option1"}, {id: 2, name: "option2"}]];
        expectedSection1.dataElements[0].rows = expectedRows1;
        expectedSection1.isDuplicate = false;
        expectedSection1.isOptionSet = true;
        expectedSection1.leftSideElements = [expectedSection1.dataElements[0]];
        expectedSection1.rightSideElements = [];

        var expectedSection2 = _.cloneDeep(testProgram.stageSections[0]);
        expectedSection2.dataElements[0] = currentTestProgram.stageSections[0].dataElements[1];
        expectedSection2.isDuplicate = true;
        expectedSection2.leftSideElements = [currentTestProgram.stageSections[0].dataElements[1]];
        expectedSection2.rightSideElements = [];

        var expectedPages = [{
          contents: [
            {type: 'dataSetName', name: "test program"},
            {type: 'section', section: expectedSection1},
            {type: 'section', section: expectedSection2},
            {type:'comments'}],
          datasetName: "test program"
        }];

        var actualPages = programProcessor.process(currentTestProgram,'coversheet');
        expect(actualPages[0].contents).toEqual(expectedPages[0].contents);
      });


    });

    describe("program-coversheets of type TEXT", function(){
      var testProgram = {
        id: "123",
        isPrintFriendlyProcessed: true,
        isResolved: Promise.resolve({}),
        name: "test program",
        stageSections: [{
          dataElements: [{
            id: "1234",
            isResolved: Promise.resolve({}),
            name: "dataElement",
            type: "TEXT"
          }],
          id: "134",
          isCatComb: false,
          isResolved: Promise.resolve({}),
          name: "section"
        }],
        type: 'program'
      };
      it("when dataelements of type text in a section are overflowed", function () {
        var currentTestProgram = _.cloneDeep(testProgram);
        var assignDeToSections = function (section, numberOfDe) {
          for (var i = 0; i < numberOfDe; i++) {
            section.dataElements[i] = _.cloneDeep(testProgram.stageSections[0].dataElements[0]);
          }
        }
        assignDeToSections(currentTestProgram.stageSections[0], 50);

        var expectedSection1 = _.cloneDeep(testProgram.stageSections[0]);
        var expectedNumberOfElements = 48;
        assignDeToSections(expectedSection1, expectedNumberOfElements);
        expectedSection1.leftSideElements = [];
        expectedSection1.rightSideElements = [];
        for (var i = 0; i < expectedNumberOfElements; i++) {
          if (i < (expectedNumberOfElements / 2))
            expectedSection1.leftSideElements.push(currentTestProgram.stageSections[0].dataElements[i]);
          else
            expectedSection1.rightSideElements.push(currentTestProgram.stageSections[0].dataElements[i]);
        }
        ;

        var expectedSection2 = _.cloneDeep(testProgram.stageSections[0]);
        assignDeToSections(expectedSection2, 2);//expected would be 2
        expectedSection2.leftSideElements = [{
          id: "1234",
          isResolved: Promise.resolve({}),
          name: "dataElement",
          type: "TEXT"
        }];
        expectedSection2.rightSideElements = [{
          id: "1234",
          isResolved: Promise.resolve({}),
          name: "dataElement",
          type: "TEXT"
        }];
        expectedSection2.isDuplicate = false;

        var expectedPages = [{
          contents: [
            {type: 'dataSetName', name: "test program"},
            {type: 'section', section: expectedSection1}],
          datasetName: "test program"
        }, {
          contents: [
            {type: 'section', section: expectedSection2},
            {type:"comments"}
          ]
        }];

        var actualPages = programProcessor.process(currentTestProgram,'coversheet');
        expect(actualPages[0].contents).toEqual(expectedPages[0].contents);
        expect(actualPages[1].contents).toEqual(expectedPages[1].contents);
      });

    });

    describe("program-register", function(){
      var testProgram = {
        id: "123",
        isPrintFriendlyProcessed: true,
        isResolved: Promise.resolve({}),
        name: "test program",
        stageSections: [{
          dataElements: [],
          id: "134",
          isCatComb: false,
          isResolved: Promise.resolve({}),
          name: "section"
        }],
        type: 'program'
      };


      it("should test regiseters page width and height and test the register which contains only comments data element", function(){
        var expectedPages = [{
          heightLeft:150,
          widthLeft:220,
          contents:[
            { name: 'Comments', id: undefined, type: 'TEXT', categoryCombo: undefined }],
          programName:'test program',
        }];

        var actualPages = programProcessor.process(testProgram,'register');
        expect(actualPages[0]).toEqual(expectedPages[0])
      });

      it("should test Orphan DataElements", function(){
        var currentTestProgram = _.clone(testProgram);

        for(var i=0;i<5;i++) {
          currentTestProgram.stageSections[0].dataElements[i] = {
            name: "dataElement",
            id: "1234",
            type: "TEXT"
          };
        }

        var expectedPages = [{
          heightLeft:0,
          widthLeft:0,
          contents:[
            {name:"dataElement", id:"1234" ,type:"TEXT"},
            {name:"dataElement", id:"1234" ,type:"TEXT"},
            {name:"dataElement", id:"1234" ,type:"TEXT"},
            {name:"dataElement", id:"1234" ,type:"TEXT"},
          ],
          programName:'test program',
        },
          {
            heightLeft:30,
            widthLeft:0,
            contents:[
              {name:"dataElement", id:"1234" ,type:"TEXT"},
              {name: 'Comments', id: undefined, type: 'TEXT', categoryCombo: undefined}
            ],
            programName:'test program'
          }];

        var actualPages = programProcessor.process(testProgram,'register');
        expect(actualPages[0].contents).toEqual(expectedPages[0].contents)
        expect(actualPages[1].contents).toEqual(expectedPages[1].contents)
      });

      it("should test the last second element can be fit into the current page or not", function(){
        var currentTestProgram = _.clone(testProgram);


          currentTestProgram.stageSections[0].dataElements[0] = {
            name: "dataElement",
            id: "1234",
            type: "TEXT"

        };

        currentTestProgram.stageSections[0].dataElements[1] = {
          name: "dataElement",
          id: "1234",
          type: "OPTIONSET"

        };

        currentTestProgram.stageSections[0].dataElements[2] = {
          name: "dataElement",
          id: "1234",
          type: "OPTIONSET"

        };

        currentTestProgram.stageSections[0].dataElements[3] = {
          name: "dataElement",
          id: "1234",
          type: "TEXT"

        };

        currentTestProgram.stageSections[0].dataElements[4] = {
          name: "dataElement",
          id: "1234",
          type: "TEXT"
        };

        var expectedPages = [{
          heightLeft:0,
          widthLeft:0,
          contents:[
            {name:"dataElement", id:"1234" ,type:"TEXT"},
            {name:"dataElement", id:"1234" ,type:"OPTIONSET"},
            {name:"dataElement", id:"1234" ,type:"OPTIONSET"},
            {name:"dataElement", id:"1234" ,type:"TEXT"},
            {name:"dataElement", id:"1234" ,type:"TEXT"},
            {name: 'Comments', id: undefined, type: 'TEXT', categoryCombo: undefined}
          ],
          programName:'test program',
        }];

        var actualPages = programProcessor.process(testProgram,'register');
        expect(actualPages[0].contents).toEqual(expectedPages[0].contents)
      })
    })

  })
});
