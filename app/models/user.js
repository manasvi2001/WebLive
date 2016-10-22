var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({
    userId:String,
    userToken:String,
    stocksSubscribed:[{
        name:String,
        exchange:String,
        stockId:String
    }]
});

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);

