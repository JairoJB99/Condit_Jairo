var router = require('express').Router();
var mongoose = require('mongoose');
var House = mongoose.model('House');

// return a list of tags
router.get('/', function(req, res, next) {
  House.find().distinct('tagList').then(function(tags){
    return res.json({tags: tags});
  }).catch(next);
});

module.exports = router;
