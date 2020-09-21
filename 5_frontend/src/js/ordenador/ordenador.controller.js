// El controller es el que conecta en la vista
class OrdenadorCtrl {
  constructor(ordenadores, $state, $scope, $stateParams) {
    "ngInject";
    this._$scope = $scope;
    let ordenadoresFiltred = []

    ordenadores.map(ordenador => {
      if (ordenador.memoryRAM == "32") {
        ordenadoresFiltred.push(ordenador);
      }
    });
    this._$scope.ordenadores = ordenadoresFiltred; // Cuando tenemos todos los ORDENADORES filtrados se los pasamos a la vista por el scope
  
  }
}

export default OrdenadorCtrl;