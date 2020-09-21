var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug');
var User = mongoose.model('User');

var OrdenadorSchema = new mongoose.Schema({
  slug: {type: String, lowercase: true, unique: true},
  title: String,
  processor: String,
  graphicCard: String,
  memoryRAM: String,
  powerSupply: String,
  description: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {timestamps: true});

OrdenadorSchema.plugin(uniqueValidator, {message: 'is already taken'});

OrdenadorSchema.pre('validate', function(next){
  if(!this.slug)  {
    this.slugify();
  }

  next();
});

OrdenadorSchema.methods.slugify = function() {
  this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};

OrdenadorSchema.methods.updateFavoriteCount = function() {
  var Ordenador = this;

  return User.count({favorites: {$in: [ordenador._id]}}).then(function(count){
    ordenador.favoritesCount = count;

    return ordenador.save();
  });
};

OrdenadorSchema.methods.toJSONFor = function(user){
  return {
    slug: this.slug,
    title: this.title,
    processor: this.processor,
    graphicCard: this.graphicCard,
    memoryRAM: this.memoryRAM,
    powerSupply: this.powerSupply,
    description: this.description,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    author: this.author.toProfileJSONFor(user)
  };
};

mongoose.model('Ordenador', OrdenadorSchema);
