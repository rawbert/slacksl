"use strict";

var http = require('http');

var sl = (function() {
    return {
        /** 
         * @description Searches for a station and returns a list with maximum 10 results
         * @param {string} searchstring The station name
         * @callback callback Callback function
        */
        stationSearch: function(searchstring, callback) {
            var stationPath = '/api2/typeahead.json?key='+process.env.STATION_SEARCH_API_KEY+'&searchstring='+searchstring,
            options = {
                host: 'api.sl.se',
                port: 80,
                path: stationPath,
                method: 'GET'
            };
            
            http.request(options, function(res) {
            res.setEncoding('utf8');
            var body = "";
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                var formattedResponse = buildStationSearchResponse(body);
                callback(formattedResponse);
            })
            }).end();
        },
        /**
         * @description Returns realtime information for a specific station
         * 
         * @param siteId Site id for a station
         * @callback callback Callback function
         */
        realtime: function(siteId, callback) {
            var realtimePath = '/api2/realtimedepartures.json?key='+process.env.REALTIME_SEARCH_API_KEY+'&siteid='+siteId+'&timewindow=30',
                options = {
                    host: 'api.sl.se',
                    port: 80,
                    path: realtimePath,
                    method: 'GET'
                };
            
            http.request(options, function(res) {
                res.setEncoding('utf8');
                var body = "";
                res.on('data', function (chunk) {
                    body += chunk;
                });
                res.on('end', function () {
                    var formattedResponse = buildRealtimeResponse(body);
                    callback(formattedResponse);
                })
            }).end();
        }
    }
    function buildStationSearchResponse(data) {
        var formattedResponse = {
            station: "",
            stationId: 0,
            message: "",
            success: false
        };
            
        var stationApiResponse = JSON.parse(data);        
        if(!stationApiResponse) {
            formattedResponse.message = "Fel vid sökning av station";
            return formattedResponse;
        }
        
        if(stationApiResponse.StatusCode !== 0) {
            formattedResponse.message = stationApiResponse.Message;
            return formattedResponse;
        }
        
        if(stationApiResponse.ResponseData.length === 0) {
            formattedResponse.message = "Kunde inte hitta en station som matchar din sökning";
            return formattedResponse;
        }
        
        var first = stationApiResponse.ResponseData[0];
        formattedResponse.station = first.Name;
        formattedResponse.stationId = first.SiteId;
        formattedResponse.success = true;
        return formattedResponse;    
    }
    function buildRealtimeResponse(data) {
        var formattedResponse = {
            trains: [],
            metros: [],
            buses: [],
            trams: [],
            message: "",
            success: false
        };
        
        var realtimeResponse = JSON.parse(data);
        if(!realtimeResponse) {
            formattedResponse.message = 'Kunde inte läsa realtidsinformation';
            return formattedResponse;
        }
        
        if(realtimeResponse.StatusCode !== 0) {
            formattedResponse.message = realtimeResponse.Message;
            return formattedResponse;
        }
        
        formattedResponse.success = true;    
        
        realtimeResponse.ResponseData.Trains.forEach(function(element) {
            formattedResponse.trains.push({
                destination: element.Destination,
                displayTime: element.DisplayTime
            });
        }, this);
        
        
        realtimeResponse.ResponseData.Metros.forEach(function(element) {
            formattedResponse.metros.push({
                destination: element.Destination,
                displayTime: element.DisplayTime,
                direction: element.Direction
            });
        }, this);
        
        
        realtimeResponse.ResponseData.Buses.forEach(function(element) {
            formattedResponse.buses.push({
                destination: element.Destination,
                displayTime: element.DisplayTime,
                direction: element.Direction
            });
        }, this);
        
        
        realtimeResponse.ResponseData.Trams.forEach(function(element) {
            formattedResponse.trams.push({
                destination: element.Destination,
                displayTime: element.DisplayTime,
                direction: element.Direction
            });
        }, this);
        
        return formattedResponse;
    }
})();

module.exports = sl;