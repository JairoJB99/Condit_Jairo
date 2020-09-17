var router = require('express').Router();
var mongoose = require('mongoose');
var House = mongoose.model('House');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');
var auth = require('../auth');

// Preload house objects on routes with ':house'
router.param('house', function(req, res, next, slug) {
  House.findOne({ slug: slug})
    .populate('author')
    .then(function (house) {
      if (!house) { return res.sendStatus(404); }

      req.house = house;

      return next();
    }).catch(next);
});

router.param('comment', function(req, res, next, id) {
  Comment.findById(id).then(function(comment){
    if(!comment) { return res.sendStatus(404); }

    req.comment = comment;

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
      House.find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .sort({createdAt: 'desc'})
        .populate('author')
        .exec(),
      House.count(query).exec(),
      req.payload ? User.findById(req.payload.id) : null,
    ]).then(function(results){
      var houses = results[0];
      var housesCount = results[1];
      var user = results[2];

      return res.json({
        houses: houses.map(function(house){
          return house.toJSONFor(user);
        }),
        housesCount: housesCount
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
      House.find({ author: {$in: user.following}})
        .limit(Number(limit))
        .skip(Number(offset))
        .populate('author')
        .exec(),
      House.count({ author: {$in: user.following}})
    ]).then(function(results){
      var houses = results[0];
      var housesCount = results[1];

      return res.json({
        houses: houses.map(function(house){
          return house.toJSONFor(user);
        }),
        housesCount: housesCount
      });
    }).catch(next);
  });
});

router.post('/', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    var house = new House(req.body.house);

    house.author = user;

    return house.save().then(function(){
      console.log(house.author);
      return res.json({house: house.toJSONFor(user)});
    });
  }).catch(next);
});

// return a house
router.get('/:house', auth.optional, function(req, res, next) {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.house.populate('author').execPopulate()
  ]).then(function(results){
    var user = results[0];

    return res.json({house: req.house.toJSONFor(user)});
  }).catch(next);
});

// update house
router.put('/:house', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if(req.house.author._id.toString() === req.payload.id.toString()){
      if(typeof req.body.house.title !== 'undefined'){
        req.house.title = req.body.house.title;
      }

      if(typeof req.body.house.description !== 'undefined'){
        req.house.description = req.body.house.description;
      }

      if(typeof req.body.house.body !== 'undefined'){
        req.house.body = req.body.house.body;
      }

      if(typeof req.body.house.tagList !== 'undefined'){
        req.house.tagList = req.body.house.tagList
      }

      req.house.save().then(function(house){
        return res.json({house: house.toJSONFor(user)});
      }).catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});

// delete house
router.delete('/:house', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    if(req.house.author._id.toString() === req.payload.id.toString()){
      return req.house.remove().then(function(){
        return res.sendStatus(204);
      });
    } else {
      return res.sendStatus(403);
    }
  }).catch(next);
});

// Favorite an house
router.post('/:house/favorite', auth.required, function(req, res, next) {
  var houseId = req.house._id;

  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    return user.favorite(houseId).then(function(){
      return req.house.updateFavoriteCount().then(function(house){
        return res.json({house: house.toJSONFor(user)});
      });
    });
  }).catch(next);
});

// Unfavorite an house
router.delete('/:house/favorite', auth.required, function(req, res, next) {
  var houseId = req.house._id;

  User.findById(req.payload.id).then(function (user){
    if (!user) { return res.sendStatus(401); }

    return user.unfavorite(houseId).then(function(){
      return req.house.updateFavoriteCount().then(function(house){
        return res.json({house: house.toJSONFor(user)});
      });
    });
  }).catch(next);
});

// return an house's comments
router.get('/:house/comments', auth.optional, function(req, res, next){
  Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function(user){
    return req.house.populate({
      path: 'comments',
      populate: {
        path: 'author'
      },
      options: {
        sort: {
          createdAt: 'desc'
        }
      }
    }).execPopulate().then(function(house) {
      return res.json({comments: req.house.comments.map(function(comment){
        return comment.toJSONFor(user);
      })});
    });
  }).catch(next);
});

// create a new comment
router.post('/:house/comments', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    var comment = new Comment(req.body.comment);
    comment.house = req.house;
    comment.author = user;

    return comment.save().then(function(){
      req.house.comments.push(comment);

      return req.house.save().then(function(house) {
        res.json({comment: comment.toJSONFor(user)});
      });
    });
  }).catch(next);
});

router.delete('/:house/comments/:comment', auth.required, function(req, res, next) {
  if(req.comment.author.toString() === req.payload.id.toString()){
    req.house.comments.remove(req.comment._id);
    req.house.save()
      .then(Comment.find({_id: req.comment._id}).remove().exec())
      .then(function(){
        res.sendStatus(204);
      });
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;
