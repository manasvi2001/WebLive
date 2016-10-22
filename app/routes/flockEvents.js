var User = require('./../models/user');
var stockUtils = require('./../utils/stockUtils.js');

module.exports = function (app, request) {
    //flock credentials
    var flock = require('flockos');

    flock.setAppId('d910233d-b87b-4648-b41d-bccdc4240b84');
    flock.setAppSecret('0e2d9834-7336-451a-80f9-7962f6306ee0');

    //To verify event tokens, you can either use the verifyEventToken function (this only works if have set the app secret):
    //flock.verifyEventToken(token);

    //middleware to verify tokens
    //app.use(flock.eventTokenChecker);

    var sendMessage = function(userId, token, company) {
    	var options = {
    		url: "https://api.flock.co/v1/chat.sendMessage",
    		json: {
			    'to': userId,
			    'token': token,
			    'text': 'Stock Price of ' + company.toUpperCase(),
			    'attachments': [{
			    	'title': 'Stock Price of ' + company.toUpperCase(),
			    	'views': {
			    		'flockml': "<flockml>Hello <strong>foobar</strong>, Welcome to <a href=\"https://flock.co/\">Flock!</a></flockml>"
			    	},
			    	"buttons": [{
			        "name": "View details",
			        "action": { "type": "openWidget", "desktopType": "modal", "mobileType": "modal", "url": "http://172.16.67.209:9000/graph" }
				    }]
			    }]
			  }
    	}
			request(options, function(error, response, body) {
				if(error) {
					return console.log('Error: ' + error);
				}
				if(response.statusCode != 200) {
					return console.log('Invalid' + response.statusCode);
				}
				console.log(body);
			});
		}

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

    flock.events.on('client.slashCommand', function(event) {
        console.log('client.slashCommand called with :: ' + JSON.stringify(event));
        if(event.text)
        	var company = event.text.slice(1);
        User.findOne({'userId': event.userId}, function(err, user) {
        	if(err) console.error(err);
        	var token = user.userToken;
	        if(event.chat[0] == 'g'){
	            //get group info
	            request('https://api.flock.co/v1/groups.getMembers?groupId=' + event.chat + '&token=' + token, function (error, response, body) {
							    //Check for error
							    if(error){
							        return console.log('Error:', error);
							    }

							    //Check for right status code
							    if(response.statusCode !== 200){
							        return console.log('Invalid Status Code Returned:', response.statusCode);
							    }

							    body=JSON.parse(body);

							    for(var i=0;i<body.length;i++) {
							    	sendMessage(body[i].id,token,company);
							    }

							    //All is good. Print the body
							    console.log(body); // Show the HTML for the Modulus homepage.

							});
	        }
	        else {
	        	sendMessage(event.chat,token,company);
	        }
        })
        return {success: true};
    });
};

var addStocks = function(user,stockObjArray){
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