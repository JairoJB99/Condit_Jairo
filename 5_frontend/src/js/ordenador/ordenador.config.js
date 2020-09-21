function OrdenadorConfig($stateProvider) {
    "ngInject";

    $stateProvider
    
        .state("app.ordenador", {
            url: "/ordenadores/",    // la misma que la de la api
            controller: "OrdenadorCtrl",
            controllerAs: "$ctrl",
            templateUrl: "ordenador/ordenador.html",
            title: "Ordenador",
            resolve: {
                ordenadores: function (Ordenador) {
                    return Ordenador.getOrdenadores().then(ordenadores => ordenadores);
                }
            }
        })

        .state("app.detailsOrdenador", {
            url: "/ordenadores/:slug",
            controller: "DetailsOrdenadorCtrl",
            controllerAs: "$ctrl",
            templateUrl: "ordenador/ordenadorDetails.html",
            title: "Details Ordenador",
            resolve: {        //Ordenador fa referencia ha el servicio que tiene nombre Ordenador
              ordenador: function(Ordenador, $stateParams) {
                return Ordenador.getOrdenador($stateParams.slug).then(ordenador => ordenador); 
              }
            }
          }) 
};
export default OrdenadorConfig;