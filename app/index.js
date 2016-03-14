require('dotenv').config();
var http = require('http');
var dispatcher = require('httpdispatcher');
var url = require('url');
var queryString = require('querystring');

var sl = require('./lib/sl');

function handleRequest(request, response){
    try {
        //log the request on console
        console.log(request.url);
        //Disptach
        dispatcher.dispatch(request, response);
    } catch(err) {
        console.log(err);
    }
}

//A sample GET request    
dispatcher.onGet("/realtime", function(req, res) {
    var requestUrl = url.parse(req.url);
    var queryObj = queryString.parse(requestUrl.query);
    var jsonResponse = { text: "Hittade inte några avångar."};
    res.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
    if(!queryObj || !queryObj.station || queryObj.station === '') {
        res.end(JSON.stringify(jsonResponse));
        return;
    }
    
    sl.stationSearch(queryObj.station, function parseStationSearch(data) {
        var stationResponse = JSON.parse(data);        
        if(!stationResponse) {
            res.end(JSON.stringify(jsonResponse));
            return;
        }
        
        if(stationResponse.StatusCode !== 0) {
            jsonResponse.text = stationResponse.Message;
            res.end(JSON.stringify(jsonResponse));
            return;
        }
        
        if(stationResponse.ResponseData !== null && stationResponse.ResponseData.length > 0) {
            var first = stationResponse.ResponseData[0];
            jsonResponse.text = first.Name + " - " + first.SiteId;
            
            sl.realtime(first.SiteId, function parseRealtime(data) {
                var realtimeResponse = JSON.parse(data);
                if(!realtimeResponse) {
                    jsonResponse.text = 'Kunde inte läsa realtidsinformation';
                    res.end(JSON.stringify(jsonResponse));
                }
                
                if(realtimeResponse.StatusCode !== 0) {
                    jsonResponse.text = realtimeResponse.Message;
                    res.end(JSON.stringify(jsonResponse));
                }
                
                var trainText = "";                
                
                realtimeResponse.ResponseData.Trains.forEach(function(element) {
                    trainText+= "\n"+element.Destination + ": " + element.DisplayTime;
                }, this);
                
                jsonResponse.text = trainText;
                res.end(JSON.stringify(jsonResponse));
            })

        } else {
            jsonResponse.text = 'Kunde inte hitta några stationer som innehåller namnet ' + queryObj.station;
            res.end(JSON.stringify(jsonResponse));
        }
    })
}); 

const HTTPS_PORT=443;
var httpserver = http.createServer(handleRequest);
var httpsserver = http.createServer(handleRequest);

//Lets start our server
httpserver.listen(process.env.HTTP_PORT, function(){
    console.log("Server listening on: http://localhost:%s", process.env.HTTP_PORT);
});

// httpsserver.listen(HTTPS_PORT, function(){
//     console.log("Server listening on: https://localhost:%s", HTTPS_PORT);
// });

function stationSearch(searchstring) {
    sl.stationSearch('searchstring', function showStationResponse (data) {
        var stationResponse = JSON.parse(data);
        if(stationResponse.StatusCode !== 0) {
            //console.log(stationResponse.Message);
            return stationResonse.Message;
        }
        
        if(stationResponse.ResponseData !== null && stationResponse.ResponseData.length > 0) {
            var first = stationResponse.ResponseData[0];
            //console.log("Displaying realtime for station: " + first.Name + " - " + first.SiteId);
            sl.realtime(first.SiteId, function showRealtime(data) {
                var realtimeResponse = JSON.parse(data);
                if(realtimeResponse.StatusCode !== 0) {
                    //console.log(realtimeResponse.Message);
                    return realtimeResponse.Message;
                }
            
                var trainData = realtimeResponse.ResponseData.Trains;
                return trainData;
                // trainData.forEach(function(element) {
                //     console.log(element.Destination + ": " + element.DisplayTime);
                // }, this);    
            });
        }
    });
}