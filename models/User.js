var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseUniqueValidator = require('mongoose-unique-validator');

var schema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    scout: {type: Schema.Types.ObjectId,  ref:'scout'}
});

schema.plugin(mongooseUniqueValidator,{ message: 'Attenzione, il campo {PATH} deve essere unico.' });

module.exports = mongoose.model('User',schema);