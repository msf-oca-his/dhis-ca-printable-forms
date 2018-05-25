TallySheets.factory('Footer', [function() {
    return function Footer(height, pageNumber, totalPages) {
        this.name = "footer-field";
        this.height = height;
        this.pageNumber = pageNumber;
        this.totalPages = totalPages;
    }
}]);