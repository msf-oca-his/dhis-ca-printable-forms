describe("TallySheetsController", function(){

  var $controller;

  beforeEach(function(){
    module("TallySheets");
    angular.module('d2HeaderBar', []);
  });
  
  beforeEach(inject(function (_$controller_) {
    $controller = _$controller_;
  }));

});