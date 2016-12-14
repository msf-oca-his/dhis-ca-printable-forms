TallySheets.factory('ServiceErrorConfig', [function() {

	//Message CODE 2500 and above number are errors
	//Message CODE 2000 to 2499 are warnings
	//Message CODE 1000 to 1999 are info
	return {
		"no_association_with_optionset": 2511,
		"optionset_without_options": 2512,
		"optionset_with_incorrect_options": 2513,
		"no_association_with_entity": 2514,
		"no_attribute_exists": 2515,

		//info
		"no_template_available": 1000
	};
}]);

window.MessageCode ={
	ERROR:2500,
	WARNING:2000,
	INFO:1000
};