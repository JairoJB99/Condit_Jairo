var router = require('express').Router();
var mongoose = require('mongoose');
var Ordenador = mongoose.model('Ordenador');
var User = mongoose.model('User');
var auth = require('../auth');

// Preload ordenador objects on routes with ':ordenador'
router.param('ordenador', function(req, res, next, slug) {
  Ordenador.findOne({ slug: slug})
    .populate('author')
    .then(function (ordenador) {
      if (!ordenador) { return res.sendStatus(404); }

      req.ordenador = ordenador;

      return next();
    }).catch(next);
});

router.get('/', auth.optional, function(req, res, next) {
  var query = {};
  var limit = 20;
  var offset = 0;

  if(typeof req.query.limit !== 'undefined'){
    limit = req.query.limit;
  }

  if(typeof req.query.offset !== 'undefined'){
    offset = req.query.offset;
  }

  if( typeof req.query.tag !== 'undefined' ){
    query.tagList = {"$in" : [req.query.tag]};
  }

  Promise.all([
    req.query.author ? User.findOne({username: req.query.author}) : null,
    req.query.favorited ? User.findOne({username: req.query.favorited}) : null
  ]).then(function(results){
    var author = results[0];
    var favoriter = results[1];

    if(author){
      query.author = author._id;
    }

    if(favoriter){
      query._id = {$in: favoriter.favorites};
    } else if(req.query.favorited){
      query._id = {$in: []};
    }

    return Promise.all([
      Ordenador.find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .sort({createdAt: 'desc'})
        .populate('author')
        .exec(),
      Ordenador.count(query).exec(),
      req.payload ? User.findById(req.payload.id) : null,
    ]).then(function(results){
      var ordenadores= results[0];
      var ordenadoresCount = results[1];
      var user = results[2];

      return res.json({
        ordenadores: ordenadores.map(function(ordenador){
          return ordenador.toJSONFor(user);
        }),
        ordenadoresCount: ordenadoresCount
      });
    });
  }).catch(next);
});

router.get('/feed', auth.required, function(req, res, next) {
  var limit = 20;
  var offset = 0;

  if(typeof req.query.limit !== 'undefined'){
    limit = req.query.limit;
  }

  if(typeof req.query.offset !== 'undefined'){
    offset = req.query.offset;
  }

  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    Promise.all([
      Ordenador.find({ author: {$in: user.following}})
        .limit(Number(limit))
        .skip(Number(offset))
        .populate('author')
        .exec(),
        Ordenador.count({ author: {$in: user.following}})
    ]).then(function(results){
      var ordenadores = results[0];
      var ordenadoresCount = results[1];

      return res.json({
        ordenadores: ordenadores.map(function(ordenador){
          return ordenador.toJSONFor(user);
        }),
        ordenadoresCount: ordenadoresCount
      });
    }).catch(next);
  });
});

router.post('/', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    var ordenador = new Ordenador(req.body.ordenador);

    ordenador.author = user;

    return ordenador.save().then(function(){
      console.log(ordenador.author);
      return res.json({ordenador: ordenador.toJSONFor(user)});
    });
  }).catch(next);
});

// return a ordenador
router.get('/:ordenador', auth.optional, function(req, res, next) {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.ordenador.populate('author').execPopulate()
  ]).then(function(results){
    var user = results[0];

    return res.json({ordenador: req.ordenador.toJSONFor(user)});
  }).catch(next);
});

// update ordenador
router.put('/:ordenador', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if(req.ordenador.author._id.toString() === req.payload.id.toString()){
      if(typeof req.body.ordenador.title !== 'undefined'){
        req.ordenador.title = req.body.ordenador.title;
      }

      if(typeof req.body.ordenador.processor !== 'undefined'){
        req.ordenador.processor = req.body.ordenador.processor;
      }

      if(typeof req.body.ordenador.graphicCard !== 'undefined'){
        req.ordenador.graphicCard = req.body.ordenador.graphicCard;
      }

      if(typeof req.body.ordenador.memoryRAM !== 'undefined'){
        req.ordenador.memoryRAM = req.body.ordenador.memoryRAM
      }

      if(typeof req.body.ordenador.powerSupply !== 'undefined'){
        req.ordenador.powerSupply = req.body.ordenador.powerSupply
      }

      if(typeof req.body.ordenador.description !== 'undefined'){
        req.ordenador.description = req.body.ordenador.description
      }

      req.ordenador.save().then(function(ordenador){
        return res.json({ordenador: ordenador.toJSONFor(user)});
      }).catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});

// delete ordenador
router.delete('/:ordenador', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    if(req.ordenador.author._id.toString() === req.payload.id.toString()){
      return req.ordenador.remove().then(function(){
        return res.sendStatus(204);
      });
    } else {
      return res.sendStatus(403);
    }
  }).catch(next);
});

module.exports = router;
