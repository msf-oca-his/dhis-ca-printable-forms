TallySheets.service('ExportToExcel', [function() {

	this.process = function(tableId, datasetName, programName) {
		var uri      = 'data:application/vnd.ms-excel;base64,'
			, template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
			'xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8">' +
			'<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}' +
			'</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>' +
			'</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
			, base64   = function(s) {
			return window.btoa(unescape(encodeURIComponent(s)))
		}
			, format   = function(s, c) {
			return s.replace(/{(\w+)}/g, function(m, p) {
				return c[p];
			})
		};

		var table = $("#" + tableId).clone();

		// Remove non-printable section from the table
		table.find('.hidden-print').remove();
		table.find('.noprint').remove();
		table.find('link').remove();

		// Take the name of the first dataset as filename
		var xlsName = (datasetName) ? datasetName : programName;
		var name = xlsName + '.xls';

		var ctx = {worksheet: 'MSF-OCA HIS' || 'Worksheet', table: table.html()};

		// Create a fake link to download the file
		var link = angular.element('<a class="hidden" id="idlink"></a>');
		link.attr({
			href: uri + base64(format(template, ctx)),
			target: '_blank',
			download: name
		});
		$("body").prepend(link[0].outerHTML);
		$("#idlink")[0].click();
		$("#idlink")[0].remove();
	};

}]);
