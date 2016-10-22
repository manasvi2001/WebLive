var request     = require("request");

exports.getCurrentPrice = function getCurrentPrice(name,exchange,callback){
    var currentUnixTime=new Date(Date.now());
    currentUnixTime=currentUnixTime.getTime();

    var stocksUrl="https://www.google.com/finance/getprices?q="+name+"&x="+exchange+"&i=60&p=3d&f=c&ts="+currentUnixTime.toString();
    //var stocksUrl="http://www.google.com/finance/getprices?q=RELIANCE&x=NSE&i=60&p=5d&f=c&df=cpct&auto=1&ts=1266701290218";

    request(stocksUrl, function(error, response, body) {
        if(error)callback(error)
        var bodySplit = body.split("\n");
        var newPrice = bodySplit[bodySplit.length-2];
        console.log("current price of "+name+" is "+newPrice);
        if(!isNaN(newPrice))
            newPrice = Number(newPrice);
        else newPrice=0;

        return callback(null,newPrice);
    });
};

