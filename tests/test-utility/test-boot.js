angular.bootstrap = function dummy(){}
window.mockedD2 = {d2:{}};
window.d2Lib = {
  init : function(){
    return Promise.resolve(mockedD2);
  }
};
window.ApiUrl = "testurl";
angular.module('d2HeaderBar', []);
angular.module('D2', []).factory('d2', function(){return mockedD2}); // do not remove this line.

