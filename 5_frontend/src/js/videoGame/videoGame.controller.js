// El controller es el que conecta en la vista
class VideoGamesCtrl {
  constructor(videoGames, $scope) {
    "ngInject";
    this._$scope = $scope;
    let videoGamesFiltred = []
    console.log("controller file videoGame")
    
    videoGames.map(videoGame => {
      if (videoGame.year == "2017") {
        videoGamesFiltred.push(videoGame);
      }
    });

    this._$scope.videoGames = videoGamesFiltred; // Cuando tenemos todos los videojuegos filtrados se los pasamos a la vista por el scope
  }
}
export default VideoGamesCtrl;