class OrdenadoresListCtrl {

    constructor($scope, $state) {
        "ngInject";

        this._$scope = $scope;
        this._$scope.openDetails = function () {
            $state.go("app.detailsOrdenador", { slug: this.ordenador["slug"] });
          };
    }
}

let OrdenadoresList = {
    bindings: {
        ordenadores: '='
    },
    controller: OrdenadoresListCtrl,
    templateUrl: "components/ordenadores-helpers/ordenadores-list.html"
};

export default OrdenadoresList;
