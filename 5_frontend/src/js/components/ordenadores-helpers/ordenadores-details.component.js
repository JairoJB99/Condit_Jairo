class OrdenadoresDetailsCtrl {

    constructor($scope, $state) {
        "ngInject";

        this._$scope = $scope;
        console.log(this._$scope.ordenador);
        /*this._$scope.onBack = () => {
            $state.go('app.ordenador');
        }*/
    }
}

let OrdenadoresDetails= {
    bindings: {
        ordenador: '='
    },
    controller: OrdenadoresDetailsCtrl,
    templateUrl: "components/ordenadores-helpers/ordenadores-details.html"
};

export default OrdenadoresDetails;