var request     = require("request");
var Q = require("q");
var Stock = require('./../models/stock');

exports.getCurrentPrice = function getCurrentPrice(name,exchange,stock,callback){
    console.log("getting stock prices through utils");
    var currentUnixTime=new Date(Date.now());
    currentUnixTime=currentUnixTime.getTime();

    var stocksUrl="https://www.google.com/finance/getprices?q="+name+"&x="+exchange+"&i=60&p=3d&f=c,o&ts="+currentUnixTime.toString();
    //var stocksUrl="http://www.google.com/finance/getprices?q=RELIANCE&x=NSE&i=60&p=5d&f=c&df=cpct&auto=1&ts=1266701290218";
    //close,open
    request(stocksUrl, function(error, response, body) {
        if(error)return callback(new Error(error));
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

        //TODO:save the stock
        stock.name=name;
        stock.exchange=exchange;
        stock.lastPrice=closePrice;
        stock.percentChange= percentChange.toFixed(4);
        stock.updatedAt = Date.now();
        stock.save(function(err){if(err) console.error(err);});
        return callback(null,closePrice,percentChange);
    });
};
exports.getStockList = function getStockList(){
    return {
        "NASDAQ":['AAL', 'AAPL', 'ADBE', 'ADI', 'ADP', 'ADSK', 'AKAM', 'ALXN', 'AMAT', 'AMGN', 'AMZN', 'ATVI', 'AVGO', 'BBBY', 'BIDU', 'BIIB', 'BMRN', 'CA', 'CELG', 'CERN', 'CHKP', 'CHTR', 'CMCSA', 'COST', 'CSCO', 'CSX', 'CTRP', 'CTSH', 'CTXS', 'DISCA', 'DISCK', 'DISH', 'DLTR', 'EA', 'EBAY', 'ESRX',
        'EXPE',
        'FAST',
        'FB',
        'FISV',
        'FOX',
        'FOXA',
        'GILD',
        'GOOG',
        'GOOGL',
        'HSIC',
        'ILMN',
        'INCY',
        'INTC',
        'INTU',
        'ISRG',
        'JD',
        'KHC',
        'LBTYA',
        'LBTYK',
        'LRCX',
        'LVNTA',
        'MAR',
        'MAT',
        'MCHP',
        'MDLZ',
        'MNST',
        'MSFT',
        'MU',
        'MXIM',
        'MYL',
        'NCLH',
        'NFLX',
        'NTAP',
        'NTES',
        'NVDA',
        'NXPI',
        'ORLY',
        'PAYX',
        'PCAR',
        'PCLN',
        'PYPL',
        'QCOM',
        'QVCA',
        'REGN',
        'ROST',
        'SBAC',
        'SBUX',
        'SHPG',
        'SIRI',
        'SRCL',
        'STX',
        'SWKS',
        'SYMC',
        'TMUS',
        'TRIP',
        'TSCO',
        'TSLA',
        'TXN',
        'ULTA',
        'VIAB',
        'VOD',
        'VRSK',
        'VRTX',
        'WBA',
        'WDC',
        'WFM',
        'XLNX',
        'XRAY',
        'YHOO']
    }
}

