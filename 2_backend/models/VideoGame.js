var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug');
var User = mongoose.model('User');

var VideoGameSchema = new mongoose.Schema({
  slug: {type: String, lowercase: true, unique: true},
  title: String,
  description: String,
  year: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {timestamps: true});

VideoGameSchema.plugin(uniqueValidator, {message: 'is already taken'});

VideoGameSchema.pre('validate', function(next){
  if(!this.slug)  {
    this.slugify();
  }

  next();
});

VideoGameSchema.methods.slugify = function() {
  this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};

VideoGameSchema.methods.updateFavoriteCount = function() {
  var videoGame = this;

  return User.count({favorites: {$in: [videoGame._id]}}).then(function(count){
    videoGame.favoritesCount = count;

    return videoGame.save();
  });
};

VideoGameSchema.methods.toJSONFor = function(user){
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    year: this.year,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    author: this.author.toProfileJSONFor(user)
  };
};

mongoose.model('VideoGame', VideoGameSchema);
