export default class VideoGame {
    constructor(AppConstants, $http, $q) {
        "ngInject";

        this._AppConstants = AppConstants;
        this._$http = $http;
        this._$q = $q;
    }

    getVideoGames() {
        return this._$http({
            url: this._AppConstants.api + "/videoGames/",
            method: "GET"
        }).then(res => {
            return res.data.videoGames;
        });
    }

    getVideoGame(slug) {
        let deferred = this._$q.defer();

        if (!slug.replace(" ", "")) {
            deferred.reject("VideoGame slug is empty");
            return deferred.promise;
        }

        this._$http({
            url: this._AppConstants.api + '/videoGames/' + slug,
            method: 'GET'
        }).then(
            (res) => deferred.resolve(res.data.videoGames),
            (err) => deferred.reject(err)
        );

        return deferred.promise;
    }

    deleteVideoGame(slug) {
        return this._$http({
            url: this._AppConstants.api + '/videoGames/' + slug,
            method: 'DELETE'
        })
    }


    /*getVideoGame(slug) {
      return this._$http({
        url: this._AppConstants.api + "/videoGames/" + slug,
        method: "GET"
      })
        .then(res => res.data.videoGame);
    }*/
}