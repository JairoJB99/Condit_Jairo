class DetailsOrdenadorCtrl {
    constructor(ordenador, $scope) {
      "ngInject";
      
      this._$scope = $scope;
      this._$scope.ordenador = ordenador;

    }
  }
  export default DetailsOrdenadorCtrl;