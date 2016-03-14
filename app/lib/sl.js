"use strict";

var http = require('http');

var sl = {};

/** @description Searches for a station and returns a list with maximum 10 results
 * @param {string} searchstring The station name
 * @callback callback Callback function
*/
sl.stationSearch = function(searchstring, callback) {
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
            callback(body);
        })
    }).end();
};

/**
 * @description Returns realtime information for a specific station
 * 
 * @param siteId Site id for a station
 * @callback callback Callback function
 */
sl.realtime = function(siteId, callback) {
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
            callback(body);
        })
    }).end();
};

module.exports = sl;