
describe('UserService', function() {
	var $httpBackend;
	var userService;
	var _$rootScope_;
	var templates;
	var $q;
	beforeEach(function() {
		angular.module('d2HeaderBar', []);
		module("TallySheets");

		inject(function($rootScope,$injector,UserService,_$q_) {
			$q=_$q_;
			_$rootScope_=$rootScope;
			$httpBackend = $injector.get('$httpBackend');
			userService=UserService;
		});

		templates = [
			{
				'dataSets':{
					'id':1,
					'name':'dataset1'
				}
			},
			{
				'programs':{
					'id':2,
					'name':'program1'
				}
			},
			{
				'dataSets':{
					'id':3,
					'name':'dataset2'
				},
				'programs':{
					'id':4,
					'name':'program3'
				}
			}
		];

	});

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it("should get all the datasets and program from the given api", function() {
		$httpBackend.when('GET', "testurl/me/organisationUnits?includeDescendants=true").respond(templates)

		var expectedTemplates = [[{'id':1,'name':'dataset1'},{'id':3,
			'name':'dataset2'}],[{'id':2, 'name':'program1'},{'id':4,'name':'program3'}]]
		userService.getDataSetsAndPrograms().then(function(templates) {
			expect(templates).toEqual(expectedTemplates)
		});
		_$rootScope_.$digest();
		$httpBackend.flush()
	});

	it("should get not give duplicate datasets and programs",function() {
		var duplicateDataset = {
			'dataSets':{
				'id':1,
				'name':'duplicateds'
			}
		};
		templates.push(duplicateDataset);
		$httpBackend.when('GET', "testurl/me/organisationUnits?includeDescendants=true").respond(templates)
		var expectedTemplates = [[{'id':1,'name':'dataset1'},{'id':3,
			'name':'dataset2'}],[{'id':2, 'name':'program1'},{'id':4,'name':'program3'}]]
		userService.getDataSetsAndPrograms().then(function(templates) {
			expect(templates).toEqual(expectedTemplates);
		});
		_$rootScope_.$digest();
		$httpBackend.flush()
	});

	it("should catch the error when api throws an error", function() {
		$httpBackend.when('GET', "testurl/me/organisationUnits?includeDescendants=true").respond(404,'')
		var expectedError = new Error('Plucking user datasets and programs failed');
		userService.getDataSetsAndPrograms().catch(function(actualError) {
			expect(actualError).toEqual(expectedError);
		});
		_$rootScope_.$digest();
		$httpBackend.flush()
	});

});
