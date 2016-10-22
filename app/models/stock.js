var mongoose = require('mongoose');

// define the schema for our user model
var stockSchema = mongoose.Schema({
    name:String,
    exchange:String,
    lastPrice:Number,
    percentChange:Number,
    updatedAt:Date
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Stock', stockSchema);

