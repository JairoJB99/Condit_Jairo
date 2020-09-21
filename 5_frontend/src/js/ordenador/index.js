import angular from 'angular';

let ordenadoresModule = angular.module('app.ordenador',[]);
let detailsOrdenadorModule = angular.module('app.detailsOrdenador', []);

import OrdenadorConfig from './ordenador.config';
ordenadoresModule.config(OrdenadorConfig);

import OrdenadorCtrl from './ordenador.controller';
ordenadoresModule.controller('OrdenadorCtrl', OrdenadorCtrl);

import DetailsOrdenadorCtrl from './ordenadorDetails.controller';
detailsOrdenadorModule.controller('DetailsOrdenadorCtrl', DetailsOrdenadorCtrl);

export default ordenadoresModule;