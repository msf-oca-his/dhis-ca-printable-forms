TallySheets.service("ProgramService", ['$http', 'ProgramStageSectionService', function ($http, ProgramStageSectionService) {
    var programs = [];
    this.getProgram = function(programId) {
        var Program = function (data) {
            var program = {};
            program.name = data.name;
            program.id = data.id;
            program.type = "program";
            program.stageSections = new Array(data.programStageSections.length);
            program.isPrintFriendlyProcessed = false;

            var getProgramStageSections = function(){
                return Promise.all(_.map(data.programStageSections, (function(stageSection, index){
                    return ProgramStageSectionService.getStageSection(stageSection.id).then(function(stageSection){
                        return stageSection.isResolved.then(function() {
                          program.stageSections[index] = stageSection
                      })
                    })
                })));
            };
            program.isResolved = getProgramStageSections();
            return program;
        };

        var successPromise = function(response){
            var program = new Program(response.data);
            return program;
        };

        var failurePromise = function(response){
            return {isError: true, status: response.status, statusText: response.statusText}
        };

        var indexOfProgram = _.indexOf(_.map(programs,"id"), programId);

        if(indexOfProgram == -1)
            return $http.get(ApiUrl + "/programStages/"+programId+".json")
                .then(successPromise, failurePromise);
    };
}]);
