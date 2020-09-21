import angular from 'angular';

let videoGamesModule = angular.module('app.videoGame',[]);

import VideoGameConfig from './videoGame.config';
videoGamesModule.config(VideoGameConfig);

import VideoGamesCtrl from './videoGame.controller';
videoGamesModule.controller('VideoGamesCtrl', VideoGamesCtrl);


export default videoGamesModule;