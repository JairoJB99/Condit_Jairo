
function VideoGameConfig($stateProvider) {
    "ngInject";

    $stateProvider
        .state("app.videoGame", {
            url: "/videoGames/",    // esta es la url del html
            controller: "VideoGamesCtrl",
            controllerAs: "$ctrl",
            templateUrl: "videoGame/videoGame.html",
            title: "Video Game",
            resolve: {
                videoGames: function (VideoGames) {
                    return VideoGames.getVideoGames().then((videoGames) => videoGames);
                }
            }
        })
};
export default VideoGameConfig;