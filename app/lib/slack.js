"use strict";

var Slack = require('slack-node');

var slackApi = {};
var slack = new Slack();

slackApi.send = function(responseUrl, message) {
    console.log(responseUrl);
    console.log(message);
    slack.setWebhook(responseUrl);
    slack.webhook(message, function(err, response) {
        console.log(response);
    });
    // var post_data = qs.stringify(message);
    // console.log(post_data);
    // console.log(responseUrl);    
    // var responseUrl = responseUrl.replace('http://s', '');
    // var host = responseUrl.substring(0, responseUrl.indexOf('/'));
    // var path = responseUrl.substring(responseUrl.indexOf('/'), responseUrl.length);
    // var options = {
    //         host: host,
    //         port: 443,
    //         path: path,
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/x-www-form-urlencoded',
    //             'Content-Length': Buffer.byteLength(post_data)
    //   }
    //     };
        
    // http.request(options, function(res) {
    //     res.setEncoding('utf8');
    //     var body = "";
    //     res.on('data', function (chunk) {
    //         body += chunk;
    //     });
    //     res.on('end', function () {
            
    //     })
    // }).end();
};

module.exports = slackApi;