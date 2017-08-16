describe('TemplatesToJsTreeNodesServiceSpec', function() {
	var templatesToJsTreeNodesService;
	var programAttributes, dataSetAttributes;
	var dataSetTemplate, programTemplate, treeNodeTypes;
	beforeEach(function() {
		angular.module('d2HeaderBar', []);
		module("TallySheets");

		inject(function($injector, TemplatesToJsTreeNodesService, DataSetAttributes, ProgramAttributes, TreeNodeTypes) {
			templatesToJsTreeNodesService = TemplatesToJsTreeNodesService;
			dataSetAttributes = DataSetAttributes;
			programAttributes = ProgramAttributes;
			treeNodeTypes = TreeNodeTypes;
		});

		dataSetTemplate = {
			id: '1',
			displayName: 'dataset1',
			sections: [
				{
					id: 's1',
					displayName: 'section1',
					dataElements: []
				}
			]
		};

		programTemplate = {
			id: '1',
			displayName: 'program1',
			programStages: [{
				programStageSections: [{
					id: '2',
					displayName: 'section1',
					programStageDataElements: []

				}]
			}]
		}

	});

	it("should get nodes for dataset templates", function() {
		var actualNode = templatesToJsTreeNodesService.getJsTreeNodes(dataSetTemplate, 'DATASET');
		expect('1').toEqual(actualNode.id);
		expect('dataset1').toEqual(actualNode.text);
		expect(0).toEqual(actualNode.index);
		expect({'opened': true, 'selected': true, disabled: true}).toEqual(actualNode.state);
		expect('s1').toEqual(actualNode.children[0].id);
	});

	it("should assign respective node type for each node in DATASET", function(){
    dataSetTemplate.sections[1] = {dataElements: [{}, {}, {}]};
    var actualNode = templatesToJsTreeNodesService.getJsTreeNodes(dataSetTemplate, 'DATASET');
    expect(treeNodeTypes.TEMPLATE).toEqual(actualNode.type);
		expect(treeNodeTypes.SECTION).toEqual(actualNode.children[0].type);
		expect(treeNodeTypes.DATAELEMENT).toEqual(actualNode.children[1].children[0].type);
  });

	it("should get correct index for inner dataelements and sections", function() {
		dataSetTemplate.sections[1] = {dataElements: [{}, {}, {}]};
		var actualNode = templatesToJsTreeNodesService.getJsTreeNodes(dataSetTemplate, 'DATASET');
		expect(1).toEqual(actualNode.children[1].index);
		expect(1).toEqual(actualNode.children[1].children[1].index);
	});

	it("should get nodes for program templates", function() {
		var actualNode = templatesToJsTreeNodesService.getJsTreeNodes(programTemplate, 'PROGRAM');
		expect('1').toEqual(actualNode.id);
		expect('program1').toEqual(actualNode.text);
		expect(0).toEqual(actualNode.index);
		expect({'opened': true, 'selected': true, disabled: true}).toEqual(actualNode.state);
		expect('2').toEqual(actualNode.children[0].id);
	});

	it("should assign respective node type for each node in PROGEAM", function(){
    programTemplate.programStages[0].programStageSections[1] = {programStageDataElements:[{},{},{}]};
    var actualNode = templatesToJsTreeNodesService.getJsTreeNodes(programTemplate, 'PROGRAM');
    expect(treeNodeTypes.TEMPLATE).toEqual(actualNode.type);
    expect(treeNodeTypes.SECTION).toEqual(actualNode.children[0].type);
    expect(treeNodeTypes.DATAELEMENT).toEqual(actualNode.children[1].children[0].type);
  });

	it("should get correct path for inner dataelements and sections for programs",function() {
		programTemplate.programStages[0].programStageSections[1] = {programStageDataElements:[{},{},{}]};
		var actualNode = templatesToJsTreeNodesService.getJsTreeNodes(programTemplate,'PROGRAM');
		expect(1).toEqual(actualNode.children[1].children[1].index);
		expect(1).toEqual(actualNode.children[1].index);
	})

});
