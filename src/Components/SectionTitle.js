TallySheets.factory('SectionTitle', [function() {
    return function SectionTitle(title, height) {
        this.name = 'section-title';
        if(!title) return;
        this.title = title;
        this.height = height;
    }
}]);