var User       = require('./../models/user');
var stockUtils = require('./../utils/stockUtils.js');
var Stock = require('./../models/stock');
var request = require('request');

module.exports = function (app) {
    app.get("/stocklist",function(req,res){
        var obj=stockUtils.getStockList();
        res.json({success:true,result:obj});
    })

    app.get("/getprevdata",function(req,res){
        var name = req.body.name || req.query.name;
        var exchange = req.body.exchange || req.query.exchange;
        if(!name || !exchange) return res.status(403).send({success:false,message:"no details provided"});

        var currentUnixTime=new Date(Date.now());
        currentUnixTime=currentUnixTime.getTime();

        var stocksUrl="https://www.google.com/finance/getprices?q="+name+"&x="+exchange+"&i=60&p=7d&f=c&ts="+currentUnixTime.toString();
        //var stocksUrl="http://www.google.com/finance/getprices?q=RELIANCE&x=NSE&i=60&p=5d&f=c&df=cpct&auto=1&ts=1266701290218";
        //close,open
        request(stocksUrl, function(error, response, body) {
            if (error)return res.status(403).send({success:false,message:"error in google url",error:error});
            var bodySplit = body.split("\n");
            console.log("bodysplit[7]",bodySplit[7]);

            var data=[];
            for(var i=7;i<bodySplit.length-1;i++){
                if(!isNaN(bodySplit[i]))
                    data.push(Number(bodySplit[i]));
            }


            res.json({success:true,data:data});
        })
    });


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
                var stockIdArray=[];
                for(var i=0;i<user.stocksSubscribed.length;i++){
                    stockIdArray.push(user.stocksSubscribed[i].stockId)
                }
                console.log("user",JSON.stringify(user),"stockIdArray",JSON.stringify(stockIdArray))
                Stock.find(stockIdArray,function(err,stocks){
                    if(err)console.error(err);
                    //console.log("all stocks",stocks);
                    return res.json({success:true,stocks:stocks});
                })

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
                    var newStock=new Stock();
                    stockUtils.getCurrentPrice(stockName,stockExchange,newStock,function(err,newPrice,percentChange) {
                        if (err)console.error(err);
                        console.log("got result from util function of price & percent of ", newPrice, percentChange);
                        res.json({success:true,message:"stock added successfully",lastPrice:newPrice,percentChange:percentChange});
                    });
                    user.stocksSubscribed.push({
                        name:stockName,
                        exchange:stockExchange,
                        stockId:newStock._id.toString()
                    });
                    user.save(function(err){if(err) console.error(err);});

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

    var updateAllStocks = function() {
        User.find(function(err,users){
            if(err)
                console.error(err);
            else if(!users) console.log("no users found")
            else {
                console.log("number of users->",users.length);
                for(var i=0;i<users.length;i++){
                    var currUser=users[i];
                    var stockIdArray=[];
                    for(var j=0;j<currUser.stocksSubscribed.length;j++){
                        stockIdArray.push(currUser.stocksSubscribed[j].stockId)
                    }
                    Stock.find(stockIdArray,function(err,stocks){
                        if(err)console.error(err);
                        //console.log("all stocks",stocks);
                        for(var j=0;j<stocks.length;j++)
                            stockUtils.getCurrentPrice(stocks[j].name,stocks[j].exchange,stocks[j],function(err,newPrice,percentChange){
                                if(err)console.error(err);
                            })
                    })
                }
            }
        });
    };
    setInterval(function() {
       updateAllStocks();
    },1000*60);
};