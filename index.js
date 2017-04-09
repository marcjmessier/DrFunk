var Alexa = require('alexa-sdk');
var audioEventHandlers = require('./audioEventHandlers')
var stateHandlers = require('./stateHandlers')
var constants = require('./constants')

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    console.log("Event:-----------------------")
    console.log(JSON.stringify(event))
    alexa.appId = constants.appId;
    alexa.dynamoDBTableName = constants.dynamoDBTableName;
    alexa.registerHandlers(
    	audioEventHandlers,
    	stateHandlers.startModeIntentHandlers,
        stateHandlers.playModeIntentHandlers,
        stateHandlers.remoteControllerHandlers,
        stateHandlers.resumeDecisionModeIntentHandlers
    );
    alexa.execute();
};
