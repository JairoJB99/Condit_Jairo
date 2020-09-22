export default class Ordenador {
    constructor(AppConstants, $http, $q) {
        "ngInject";

        this._AppConstants = AppConstants;
        this._$http = $http;
        this._$q = $q;
    }

    getOrdenadores() {
        return this._$http({
            url: this._AppConstants.api + "/ordenadores/",
            method: "GET"
        }).then(res => {
            return res.data.ordenadores;
        });
    }

    getOrdenador(slug) {
        let deferred = this._$q.defer();

        if (!slug.replace(" ", "")) {
            deferred.reject("Ordenador slug is empty");
            return deferred.promise;
        }

        this._$http({
            url: this._AppConstants.api + '/ordenadores/' + slug,
            method: 'GET'
        }).then(
            (res) => deferred.resolve(res.data.ordenador),
            (err) => deferred.reject(err)
        );

        console.log(deferred.promise);

        return deferred.promise;
    }

    deleteOrdenador(slug) {
        return this._$http({
            url: this._AppConstants.api + '/ordenadores/' + slug,
            method: 'DELETE'
        })
    }

    /*getOrdenador(slug) {
      return this._$http({
        url: this._AppConstants.api + "/ordenadores/" + slug,
        method: "GET"
      })
        .then(res => res.data.ordenador);
    }*/
}