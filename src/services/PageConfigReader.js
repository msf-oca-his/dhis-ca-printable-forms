TallySheets.service('PageConfigReader', ['$q', function ($q) {

    this.getPageConfig = function () {
            var defer = $q.defer();
            var xobj = new XMLHttpRequest();
            xobj.overrideMimeType("application/json");
            xobj.open('GET', 'A4.portrait.json', true);
            xobj.onreadystatechange = function () {
                if (xobj.readyState == 4 && xobj.status == "200") {
                    // .open will NOT return a value but simply returns undefined in async mode so use a callback
                    return defer.resolve(JSON.parse(xobj.responseText));
                }
            };
            xobj.send(null);
            return defer.promise;
        }

}]);
