var User = require('./../models/user');
var stockUtils = require('./../utils/stockUtils.js');

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
                newUser.userId=event.userId;
                newUser.userToken=event.userToken;
                newUser.stocksSubscribed=[];

/*                newUser.stocksSubscribed.push({name:"GOOGL",exchange:"NASDAQ"});
                newUser.stocksSubscribed.push({name:"IDEA",exchange:"NSE"});
                newUser.stocksSubscribed.push({name:"AAPL",exchange:"NASDAQ"});*/

                //TODO:initialise subscribed news
                newUser.save(function(err,user){
                    if(err) console.error(err);
                    else if(!user) console.error("unable to save user successfully");
                    else{
                        console.log("Reached here yayyy");
                        addStocks(user,[{name:"GOOGL",exchange:"NASDAQ"},{name:"IDEA",exchange:"NSE"},{name:"AAPL",exchange:"NASDAQ"}]);
                    }
                });
                return {success:true}
            }
            else{
                console.log("earlier user found");
                return {success:true};
            }
        })
    });
};

var addStocks = function(user,stockObjArray){
    //(user,[{name:"GOOGL",exchange:"NASDAQ"},{name:"IDEA",exchange:"NSE"},{name:"AAPL",exchange:"NASDAQ"}]);
    for(var i=0;i<stockObjArray.length;i++){
        stockUtils.getCurrentPrice(stockObjArray[i].name,stockObjArray[i].exchange)
            .then(function (newPrice,percentChange) {
                console.log("get result from util function of price & percent of ",stockObjArray[i].name,newPrice,percentChange);
                user.stocksSubscribed.push({
                    name:stockObjArray[i].name,
                    exchange:stockObjArray[i].exchange,
                    lastPrice:newPrice,
                    percentChange:percentChange,
                    updatedAt:Date.now()
                });
            }, function (error) {
                console.error(error);
            });
    }
    console.log("final user->",JSON.stringify(user));
    user.save(function(err){if(err) console.error(err);});
}