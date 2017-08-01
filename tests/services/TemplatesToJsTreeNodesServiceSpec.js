describe('TemplatesToJsTreeNodesServiceSpec', function() {
	var templatesToJsTreeNodesService;
	var programAttributes, dataSetAttributes;
	var dataSetTemplate, programTemplate;
	beforeEach(function() {
		angular.module('d2HeaderBar', []);
		module("TallySheets");

		inject(function($injector, TemplatesToJsTreeNodesService, DataSetAttributes, ProgramAttributes) {
			templatesToJsTreeNodesService = TemplatesToJsTreeNodesService;
			dataSetAttributes = DataSetAttributes;
			programAttributes = ProgramAttributes;
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

	it("should get nodes from sections from templates of type dataset", function() {
		var actualNode = templatesToJsTreeNodesService.getJsTreeNodes(dataSetTemplate, 'DATASET');
		expect('1').toEqual(actualNode.id);
		expect('dataset1').toEqual(actualNode.text);
		expect('template').toEqual(actualNode.path);
		expect({'opened': true, 'selected': true}).toEqual(actualNode.state);
		expect('s1').toEqual(actualNode.children[0].id);
	});

	it("should get correct path for inner dataelements and sections", function() {
		dataSetTemplate.sections[1] = {dataElements: [{}, {}, {}]};
		var actualNode = templatesToJsTreeNodesService.getJsTreeNodes(dataSetTemplate, 'DATASET');
		expect('template.sections[1]').toEqual(actualNode.children[1].path);
		expect('template.sections[1].dataElements[1]').toEqual(actualNode.children[1].children[1].path);
	});

	it("should get nodes from templates of type of program", function() {
		var actualNode = templatesToJsTreeNodesService.getJsTreeNodes(programTemplate, 'PROGRAM');
		expect('1').toEqual(actualNode.id);
		expect('program1').toEqual(actualNode.text);
		expect('template').toEqual(actualNode.path);
		expect({'opened': true, 'selected': true}).toEqual(actualNode.state);
		expect('2').toEqual(actualNode.children[0].id);
	});
	
	it("should get correct path for inner dataelements and sections",function() {
		programTemplate.programStages[0].programStageSections[1] = {programStageDataElements:[{},{},{}]};
		var actualNode = templatesToJsTreeNodesService.getJsTreeNodes(programTemplate,'PROGRAM');
		expect('template.programStages[0].programStageSections[1]').toEqual(actualNode.children[1].path);
		expect('template.programStages[0].programStageSections[1].programStageDataElements[1]').toEqual(actualNode.children[1].children[1].path)
	})

});
