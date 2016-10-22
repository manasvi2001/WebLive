var User = require('./../models/user');

module.exports = function (app) {
    //flock credentials
    var flock = require('flockos');

    flock.setAppId('d910233d-b87b-4648-b41d-bccdc4240b84');
    flock.setAppSecret('0e2d9834-7336-451a-80f9-7962f6306ee0');

    //To verify event tokens, you can either use the verifyEventToken function (this only works if have set the app secret):
    //flock.verifyEventToken(token);

    //middleware to verify tokens
    //app.use(flock.eventTokenChecker);

    app.post('/events', flock.router);

    flock.events.on('app.install', function (event) {
        console.log("app.install called with->",JSON.stringify(event));
        User.findOne({'userId': event.userId},function(err,user){
            if(err)console.error(err);
            else if(!user){
                console.log("no earlier user found,creating new user");
                var newUser=new User();
                newUser.name=event.name;
                newUser.userId=event.userId;
                newUser.userToken=event.userToken;
                newUser.stocksSubscribed=[];
                //TODO:initialise subscribed news
                newUser.save(function(err){if(err) console.error(err);});
                return {success:true}
            }
            else{
                console.log("earlier user found");
                return {success:true};
            }
        })
    });
}