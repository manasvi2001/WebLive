module.exports = function (app) {
    app.get('/logintest',function (req, res) {
        res.json({success:true});
    })

    app.get('/events',function(req,res){

    })
    app.get("/test",function(req,res){

        var request = require("request");

        var stockName="GOOGL";
        var stockExchange="NASDAQ";
        var currentUnixTime=new Date(Date.now());
        currentUnixTime=currentUnixTime.getTime();

        var stocksUrl="https://www.google.com/finance/getprices?q="+stockName+"&x="+stockExchange+"&i=60&p=5d&f=c&ts="+currentUnixTime.toString();
        //var stocksUrl="http://www.google.com/finance/getprices?q=RELIANCE&x=NSE&i=60&p=5d&f=c&df=cpct&auto=1&ts=1266701290218";

        request(stocksUrl, function(error, response, body) {
            var bodySplit = body.split("\n");
            console.log(bodySplit[bodySplit.length-2]);
            res.json({success:true,requiredValue:bodySplit[bodySplit.length-2]});
        });
    })
}