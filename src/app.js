window.TallySheets = angular.module('TallySheets', [ 'ngResource', 'pascalprecht.translate', 'ngRoute', 'ngCookies', 'd2HeaderBar', 'DhisModel', 'DhisServices' ]);
var dhisUrl;
if( window.location.href.includes("apps") )
  dhisUrl = window.location.href.split('api/apps/')[ 0 ];
else
  dhisUrl = "http://localhost:8000/";
window.ApiUrl = dhisUrl + 'api';

TallySheets.filter('to_trusted', [ '$sce', function($sce) {
  return function(text) {
    return $sce.trustAsHtml(text);
  };
} ]);
TallySheets.controller('TallySheetsController', [ "$scope", "DataSetService", "PrintFriendlyProcessor", "ProgramService", "ProgramProcessor", function($scope, DataSetService, PrintFriendlyProcessor, ProgramService, ProgramProcessor) {

  $scope.spinnerShown = false;

  $scope.dsId = 1;
  $scope.form = {};
  $scope.pages = [];
  $scope.exportToTable = function(tableId) {
    var uri = 'data:application/vnd.ms-excel;base64,'
      , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
      'xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8">' +
      '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}' +
      '</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>' +
      '</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
      , base64 = function(s) {
      return window.btoa(unescape(encodeURIComponent(s)))
    }
      , format = function(s, c) {
      return s.replace(/{(\w+)}/g, function(m, p) {
        return c[ p ];
      })
    }

    var table = $("#" + tableId).clone();

    // Remove non-printable section from the table
    table.find(".hidden-print").remove();

    // Replace input fields with their values (for correct excel formatting)
    table.find("input").each(function() {
      var value = $(this).val();
      $(this).replaceWith(value);
    });

    // Add border to section table (for printing in MS Excel)
    table.find(".sectionTable").prop('border', '1');

    // Take the name of the first dataset as filename
    var name = table.find("h2").first().html() + '.xls';

    var ctx = { worksheet: 'MSF-OCBA HMIS' || 'Worksheet', table: table.html() }

    // Create a fake link to download the file
    var link = angular.element('<a class="hidden" id="idlink"></a>');
    link.attr({
      href: uri + base64(format(template, ctx)),
      target: '_blank',
      download: name
    });
    $("body").prepend(link[ 0 ].outerHTML);
    $("#idlink")[ 0 ].click();
    $("#idlink")[ 0 ].remove();

  };

  $scope.goHome = function() {
    window.location.replace(dhisUrl);
  };

  // Initialize the app with one dataSet selector

  $scope.renderDataSets = function() {
    $scope.pages = [];
    if( $scope.form.id ) {
      $scope.spinnerShown = true;
      if( $scope.form.type == "DATASET" ) {
        return DataSetService.getDataSet($scope.form.id)
          .then(function(dataset) {
            $scope.pages = PrintFriendlyProcessor.process(_.cloneDeep(dataset));
            $scope.spinnerShown = false;
            $scope.$apply();
          });

      }
      else if( $scope.form.type == "PROGRAM" && $scope.programMode ) {
        $scope.spinnerShown = true;
        return ProgramService.getProgram($scope.form.id)
          .then(function(program) {
            $scope.pages = ProgramProcessor.process(_.cloneDeep(program), $scope.programMode);
            $scope.spinnerShown = false;
            $scope.$apply();
          });
      }
      $scope.spinnerShown = false;
    }
    else return Promise.resolve(0)
  };
} ]);

//TODO: find a better way to expose d2. not through promise
TallySheets.factory("d2", [ function() {
  var d2Lib = require("../node_modules/d2/lib/d2.js");
  return d2Lib.init({ baseUrl: ApiUrl })
    .then(function(d2) {
      console.log(d2);
      return d2;
    })
    .catch(function(err) {
      return console.log(err, 'yayy')
    })

} ]);

TallySheets.directive('onFinishRender', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      if( scope.$last === true ) {
        $timeout(function() {
          scope.$emit('ngRepeatFinished');
        });
      }
    }
  }
});

TallySheets.config(function($translateProvider) {
  $translateProvider.useSanitizeValueStrategy('escape'); //TODO: create a story to select sanitize strategy
  //#TODO: load translations preemptively in js rather than loading them at run time with a http call
  $translateProvider.useStaticFilesLoader({
    prefix: 'i18n/',
    suffix: '.json'
  });

  $translateProvider.registerAvailableLanguageKeys(
    [ 'es', 'fr', 'en', 'pt' ],
    {
      'en*': 'en',
      'es*': 'es',
      'fr*': 'fr',
      'pt*': 'pt',
      '*': 'en' // must be last!
    }
  );

  $translateProvider.fallbackLanguage([ 'en' ]);

  jQuery.ajax({ //TODO: this is a http call. if we are not using d2's translate then move this to d2
    url: ApiUrl + '/userSettings/keyUiLocale/',
    contentType: 'text/plain',
    method: 'GET',
    dataType: 'text',
    async: false
  }).success(function(uiLocale) {
    if( uiLocale == '' ) {
      $translateProvider.determinePreferredLanguage();
    }
    else {
      $translateProvider.use(uiLocale);
    }
  }).fail(function() {
    $translateProvider.determinePreferredLanguage();
  });

});
