var User       = require('./../models/user');
var stockUtils = require('./../utils/stockUtils.js');

module.exports = function (app) {
    app.get("/stock",function(req,res){
        var userId = req.body.userId || req.query.userId;
        console.log(userId);
        if(!userId)
            return res.status(403).send({success: false, message: 'no userId provided'});

        User.findOne({'userId': userId},function(err,user){
            if(err)console.error(err);
            else if(!user){
                return res.status(403).send({success:false,message:"no user found"})
            }
            else{
                return res.json({success:true,stocks:user.stocksSubscribed});
            }
        })
    });

    app.post("/addstock",function(req,res){
        var userId = req.body.userId || req.query.userId;
        var stockName = req.body.stockName || req.query.stockName;
        var stockExchange = req.body.stockExchange || req.query.stockExchange;

        if(!userId || !stockName || !stockExchange)
            return res.status(403).send({success:false,message:"no userId or stockName or stockExchange provided"});

        User.findOne({'userId': userId},function(err,user){
            if(err)console.error(err);
            else if(!user){
                return res.status(403).send({success:false,message:"no user found"})
            }
            else{
                var alreadyAddedFlag=false;
                for(var i=0;i<user.stocksSubscribed.length;i++){
                    if(user.stocksSubscribed[i].name==stockName && user.stocksSubscribed[i].name==stockExchange) {
                        alreadyAddedFlag = true;
                        break;
                    }
                }
                if(!alreadyAddedFlag){
                    stockUtils.getCurrentPrice(stockName,stockExchange,function(err,currPrice){
                        if(err) {console.error(err);res.json({success:false,error:err})}
                        else{
                            if(currPrice=0)
                                currPrice="NaN";
                            user.stocksSubscribed.push({
                                name:stockName,
                                exchange:stockExchange,
                                lastPrice:currPrice,
                                percentChange:0,
                                updatedAt:Date.now()
                            });
                            user.save(function(err){if(err) console.error(err);});
                            res.json({success:true,message:"stock added successfully",lastPrice:currPrice});
                        }
                    });
                }
            }
        })
    });

    app.post("/removestock",function(req,res) {
        var userId = req.body.userId || req.query.userId;
        var stockName = req.body.stockName || req.query.stockName;
        var stockExchange = req.body.stockExchange || req.query.stockExchange;

        if (!userId || !stockName || !stockExchange)
            return res.status(403).send({success: false, message: "no userId or stockName or stockExchange provided"});

        User.findOne({'userId': userId}, function (err, user) {
            if (err)console.error(err);
            else if (!user) {
                return res.status(403).send({success: false, message: "no user found"})
            }
            else {
                var indexNo = -1;
                for (var i = 0; i < user.stocksSubscribed.length; i++) {
                    if (user.stocksSubscribed[i].name == stockName && user.stocksSubscribed[i].name == stockExchange) {
                        indexNo=i;
                        break;
                    }
                }
                if(indexNo>0)
                    user.stocksSubscribed.splice(indexNo,1);
                user.save(function(err){if(err) console.error(err);});
                res.json({success:true,message:"stock removed successfully"});
            }
        })

    });
    var updateSelectedStock = function(user,stockIndex){
        stockUtils.getCurrentPrice(user.stocksSubscribed[stockIndex].name,user.stocksSubscribed[stockIndex].exchange,function(err,currPrice){
            if(err) {console.error(err)}
            else{
                var prevPrice=user.stocksSubscribed[stockIndex].lastPrice;
                if(currPrice=0) {
                    currPrice = "NaN";
                    var percentChange = 0;
                }
                else{
                    if(prevPrice==0){
                        var percentChange = 0;
                    }
                    else{
                        var percentChange=(currPrice-prevPrice)/prevPrice;
                    }
                }
                user.stocksSubscribed[stockIndex] = {
                    name:user.stocksSubscribed[stockIndex].name,
                    exchange:user.stocksSubscribed[stockIndex].exchange,
                    lastPrice:currPrice,
                    percentChange:percentChange,
                    updatedAt:Date.now()
                };
                user.save(function(err){if(err) console.error(err);});
            }
        });
    };

    var updateAllStocks = function() {
        User.find(function(err,users){
            if(err)
                console.error(err);
            else if(!users) console.log("no users found")
            else {
                console.log("number of users->",users.length);
                for(var i=0;i<users.length;i++){
                    for(var j=0;j<users[i].stocksSubscribed.length;j++){
                        updateSelectedStock(users[i],j);
                    }
                }
            }
        });
    };

    setInterval(function() {
        updateAllStocks();
    },1000*60);
};