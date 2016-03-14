require('dotenv').config();
var http = require('http');
var dispatcher = require('httpdispatcher');
var querystring = require('querystring');

var sl = require('./lib/sl');

function handleRequest(request, response){
    try {
        //log the request on console
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
    res.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
    
    var jsonResponse = { text: "POST: Hittade inte några avgångar."};
    res.end(JSON.stringify(jsonResponse));  
    // if(!queryObj || !queryObj.station || queryObj.station === '') {
    //     res.end(JSON.stringify(jsonResponse));
    //     return;
    // }
    
    // sl.stationSearch(queryObj.station, function parseStationSearch(data) {
    //     var stationResponse = JSON.parse(data);        
    //     if(!stationResponse) {
    //         res.end(JSON.stringify(jsonResponse));
    //         return;
    //     }
        
    //     if(stationResponse.StatusCode !== 0) {
    //         jsonResponse.text = stationResponse.Message;
    //         res.end(JSON.stringify(jsonResponse));
    //         return;
    //     }
        
    //     if(stationResponse.ResponseData !== null && stationResponse.ResponseData.length > 0) {
    //         var first = stationResponse.ResponseData[0];
    //         jsonResponse.text = first.Name + " - " + first.SiteId;
            
    //         sl.realtime(first.SiteId, function parseRealtime(data) {
    //             var realtimeResponse = JSON.parse(data);
    //             if(!realtimeResponse) {
    //                 jsonResponse.text = 'Kunde inte läsa realtidsinformation';
    //                 res.end(JSON.stringify(jsonResponse));
    //             }
                
    //             if(realtimeResponse.StatusCode !== 0) {
    //                 jsonResponse.text = realtimeResponse.Message;
    //                 res.end(JSON.stringify(jsonResponse));
    //             }
                
    //             var trainText = "";                
                
    //             realtimeResponse.ResponseData.Trains.forEach(function(element) {
    //                 trainText+= "\n"+element.Destination + ": " + element.DisplayTime;
    //             }, this);
                
    //             jsonResponse.text = trainText;
    //             res.end(JSON.stringify(jsonResponse));
    //         })

    //     } else {
    //         jsonResponse.text = 'Kunde inte hitta några stationer som innehåller namnet ' + queryObj.station;
    //         res.end(JSON.stringify(jsonResponse));
    //     }
    // })
}); 

var server = http.createServer(handleRequest);
var port = process.env.PORT || 8080;
//Lets start our server
server.listen(port, function(){
    console.log("Server listening on: http://localhost:%s", port);
});