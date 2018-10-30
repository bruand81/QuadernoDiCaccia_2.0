var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseUniqueValidator = require('mongoose-unique-validator');
var addressSchema = new Schema({
    city: {type: String, required: true},
    country: {type: String, required: true},
    zipcode: {type: String, required: true},
    street: {type: String, required: true},
    housenumber: {type: String, required: true}
});
var parentsSchema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    mobile: {type: String, required: true},
    phone: {type: String},
    email: {type: String}
});

var schema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    birthplace: {type: String, required:true}, //Luogo di nascita
    birthcountry: {type: String, required:true}, //Provincia di nascita
    birthday: {type: Date, required:true},
    nationality: {type: String},
    address: {type: addressSchema, required:true},
    parents: [parentsSchema],
    email: {type: String},
    religion: {type: String},
    parish: {type: String},
    school: {type: String},
    photo: { data: Buffer, contentType: String }, //How to store image in mongoose https://gist.github.com/aheckmann/2408370
    active: {type: Boolean, required: true, default: true},
    registrationNumber: {type: String, required:true, default: new Date().getTime()}
});

schema.plugin(mongooseUniqueValidator,{ message: 'Attenzione, il campo {PATH} deve essere unico.' });

module.exports = mongoose.model('Scout',schema);