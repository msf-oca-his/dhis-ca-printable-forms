TallySheets.factory('TemplateTitle', [function() {
    return function TemplateTitle(title, height) {
        this.name = 'template-title';
        if(!title) return;
        this.title = title;
        this.height = height;
    }
}]);