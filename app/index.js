require('dotenv').config();
var http = require('http');
var dispatcher = require('httpdispatcher');
var querystring = require('querystring');

var sl = require('./lib/sl');
var slack = require('./lib/slack');

function handleRequest(request, response){
    try {
        console.log(request.url);
        dispatcher.dispatch(request, response);
    } catch(err) {
        console.log(err);
    }
}

dispatcher.onGet('/realtime', function(req, res) {
    res.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
    var jsonResponse = { text: "GET: Hittade inte några avgångar."};
    res.end(JSON.stringify(jsonResponse));
});

dispatcher.onPost("/realtime", function(req, res) {
    var form = querystring.parse(req.body);
    var jsonResponse = { text: ""};
    res.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
    if(form.token !== process.env.SLACK_COMMAND_TOKEN) {
        jsonResponse.text = "Invalid token";
        res.end(JSON.stringify(jsonResponse));
    }
    var trafficRequest = parseSlackText(form.text);
    
    var responseSent = false;
    var timer = setTimeout(function() {
            if(!responseSent) {
                res.end();   
            }
            timer = null;
    }, 2950);
    
    sl.stationSearch(trafficRequest.station, function(stationResponse) {
        if(!stationResponse.success) {
            jsonResponse.text = stationResponse.message;
            responseSent = true;
            res.end(JSON.stringify(jsonResponse));
            return;
        }
        sl.realtime(stationResponse.stationId, function(realtimeResponse) {
            if(!realtimeResponse.success) {
                jsonResponse.text = realtimeResponse.message;
                responseSent = true;
                res.end(JSON.stringify(jsonResponse));
                return;
            }
                       
            var responseText = "Visar realtidsinformation för " + stationResponse.station;
            var realtime = filterRealtimeForTrafficType(trafficRequest.trafficType, realtimeResponse);
            realtime.forEach(function(element) {
                responseText += "\n" + element.destination + ": " + element.displayTime;
            }, this);
            jsonResponse.text = responseText;
            
            // We didnt make it within 3 seconds, post to url
            slack.send(form.response_url, jsonResponse);
        })
    })
});

function filterRealtimeForTrafficType(trafficType, realtimeResponse) {
    if(trafficType === "pendel" || trafficType === "pendeltåg") {
        return realtimeResponse.trains;
    }
    
    if(trafficType === "tbana" || trafficType === "tunnelbana" || trafficType === "tuben") {
        return realtimeResponse.metros;
    }
    
    if(trafficType === "buss" || trafficType === "bussen") {
        return realTimeResponse.buses;
    }
    
    if(trafficType === "spårvagn" || trafficType === "lokaltrafik") {
        return realtimeResponse.trams;
    }
    
    return [];
}

function parseSlackText(text) {
    var inputs = text.split(" ");
    var station = "",
        trafficType = "";
    if(inputs.length === 1) {
        station = inputs[0];
    }
    
    if(inputs.length === 2) {
        station = inputs[0];
        trafficType = inputs[1];
    }
    
    return { station: station, trafficType: trafficType };
}

var server = http.createServer(handleRequest);
var port = process.env.PORT || 8080;
//Lets start our server
server.listen(port, function(){
    console.log("Server listening on: http://localhost:%s", port);
});