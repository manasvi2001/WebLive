var request     = require("request");
var Q = require("q");

exports.getCurrentPrice = function getCurrentPrice(name,exchange){
    var deferred = Q.defer();
    console.log("getting stock prices through utils");
    var currentUnixTime=new Date(Date.now());
    currentUnixTime=currentUnixTime.getTime();

    var stocksUrl="https://www.google.com/finance/getprices?q="+name+"&x="+exchange+"&i=60&p=3d&f=c,o&ts="+currentUnixTime.toString();
    //var stocksUrl="http://www.google.com/finance/getprices?q=RELIANCE&x=NSE&i=60&p=5d&f=c&df=cpct&auto=1&ts=1266701290218";
    //close,open
    request(stocksUrl, function(error, response, body) {
        if(error)deferred.reject(new Error(error));
        var bodySplit = body.split("\n");
        var closeOpenPrice = bodySplit[bodySplit.length-2];
        var closeOpenPriceSplit = closeOpenPrice.split(",");
        var closePrice=-1;
        var openPrice=-1;
        var percentChange=-1;
        if(closeOpenPriceSplit && closeOpenPriceSplit.length==2){
            closePrice=Number(closeOpenPriceSplit[0]);
            openPrice=Number(closeOpenPriceSplit[1]);
            percentChange=(closePrice-openPrice)/openPrice;
        }
        console.log("current price of "+name+" is "+closePrice);

        deferred.resolve(closePrice,percentChange);
    });
    return deferred.promise;
};

