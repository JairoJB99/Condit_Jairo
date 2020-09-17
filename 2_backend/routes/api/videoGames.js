var router = require('express').Router();
var mongoose = require('mongoose');
var VideoGame = mongoose.model('VideoGame');
var User = mongoose.model('User');
var auth = require('../auth');

// Preload videoGame objects on routes with ':videoGame'
router.param('videoGame', function(req, res, next, slug) {
  VideoGame.findOne({ slug: slug})
    .populate('author')
    .then(function (videoGame) {
      if (!videoGame) { return res.sendStatus(404); }

      req.videoGame = videoGame;

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
      VideoGame.find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .sort({createdAt: 'desc'})
        .populate('author')
        .exec(),
      VideoGame.count(query).exec(),
      req.payload ? User.findById(req.payload.id) : null,
    ]).then(function(results){
      var videoGames= results[0];
      var videoGamesCount = results[1];
      var user = results[2];

      return res.json({
        videoGames: videoGames.map(function(videoGame){
          return videoGame.toJSONFor(user);
        }),
        videoGamesCount: videoGamesCount
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
      VideoGame.find({ author: {$in: user.following}})
        .limit(Number(limit))
        .skip(Number(offset))
        .populate('author')
        .exec(),
        VideoGame.count({ author: {$in: user.following}})
    ]).then(function(results){
      var videoGames = results[0];
      var videoGamesCount = results[1];

      return res.json({
        videoGames: videoGames.map(function(videoGame){
          return videoGame.toJSONFor(user);
        }),
        videoGamesCount: videoGamesCount
      });
    }).catch(next);
  });
});

router.post('/', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    var videoGame = new VideoGame(req.body.videoGame);

    videoGame.author = user;

    return videoGame.save().then(function(){
      console.log(videoGame.author);
      return res.json({videoGame: videoGame.toJSONFor(user)});
    });
  }).catch(next);
});

// return a videoGame
router.get('/:videoGame', auth.optional, function(req, res, next) {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.videoGame.populate('author').execPopulate()
  ]).then(function(results){
    var user = results[0];

    return res.json({videoGame: req.videoGame.toJSONFor(user)});
  }).catch(next);
});

// update videoGame
router.put('/:videoGame', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if(req.videoGame.author._id.toString() === req.payload.id.toString()){
      if(typeof req.body.videoGame.title !== 'undefined'){
        req.videoGame.title = req.body.videoGame.title;
      }

      if(typeof req.body.videoGame.description !== 'undefined'){
        req.videoGame.description = req.body.videoGame.description;
      }

      if(typeof req.body.videoGame.year !== 'undefined'){
        req.videoGame.year = req.body.videoGame.year;
      }

      if(typeof req.body.videoGame.tagList !== 'undefined'){
        req.videoGame.tagList = req.body.videoGame.tagList
      }

      req.videoGame.save().then(function(videoGame){
        return res.json({videoGame: videoGame.toJSONFor(user)});
      }).catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});

// delete videoGame
router.delete('/:videoGame', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    if(req.videoGame.author._id.toString() === req.payload.id.toString()){
      return req.videoGame.remove().then(function(){
        return res.sendStatus(204);
      });
    } else {
      return res.sendStatus(403);
    }
  }).catch(next);
});

module.exports = router;
