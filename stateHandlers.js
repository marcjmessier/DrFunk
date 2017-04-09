'use strict';

var Alexa = require('alexa-sdk');
var audioData = require('./audioAssets');
var constants = require('./constants');
var musicTheory = require('./musicTheory')
var vocab = require('./vocab')

var genericReprompt = 'What else can I do for you?'

var SONG_NOT_FOUND = 'I can\'t find any songs that match that description. <break time="0.5s" /> How else can I help?'

function buildParamsFromRequest(request) {
    // take an Alexa request and build the params object from it
    var params = {
        'artist' : undefined,
        'title' : undefined,
        'root' : undefined,
        'mode' : undefined,
        'tag' : undefined
    }
    if (request.intent == undefined) {
        return params
    }
    if (request.intent.slots == undefined) {
        return params
    }
    if (request.intent.slots.SpecificArtist != undefined) {
        params.artist = request.intent.slots.SpecificArtist.value
    }
    if (request.intent.slots.SpecificTitle != undefined) {
        params.title = request.intent.slots.SpecificTitle.value
    }
    if (request.intent.slots.RootNote != undefined) {
        params.root = request.intent.slots.RootNote.value
    }
    if (request.intent.slots.ModeType != undefined) {
        params.mode = request.intent.slots.ModeType.value
    }
    if (request.intent.slots.Tag != undefined) {
        params.tag = request.intent.slots.Tag.value
    }
    return params
}

function songMeetsCriteria(song, params) {
    if (
        ((params['title'] == undefined) || (song['title'] == params['title'])) &&
        ((params['artist'] == undefined) || (song['artist'] == params['artist'])) &&
        ((params['root'] == undefined) || (song['root'] == params['root'])) &&
        ((params['mode'] == undefined) || (song['mode'] == params['mode'])) &&
        ((params['tag'] == undefined) || (song['tags'].indexOf(params['tag']) > -1))
        )
    {
        return true;
    }
    return false;
}

function getPlayOrderForParams(params, playOrder) {
    for (var i = 0; i < audioData.length; i+=1) {
        if (songMeetsCriteria(audioData[i], params)) {
            playOrder.push(i)
        }
    }
}

var stateHandlers = {
    startModeIntentHandlers : Alexa.CreateStateHandler(constants.states.START_MODE, {
        /*
         *  All Intent Handlers for state : START_MODE
         */
        'StartIntent': function () { this.emit(':ask', vocab.makeGreeting())},
        'LaunchRequest' : function () {
            // Initialize Attributes
            // begin by setting all fields to undefined
            var params = buildParamsFromRequest(this.event.request)
            var playOrder = []
            getPlayOrderForParams(params, playOrder)
            if (playOrder.length > 0) {
                this.attributes['params'] = params
                this.attributes['playOrder'] = playOrder//Array.apply(null, {length: audioData.length}).map(Number.call, Number);
                this.attributes['index'] = 0;
                this.attributes['offsetInMilliseconds'] = 0;
                this.attributes['loop'] = true;
                this.attributes['shuffle'] = false;
                this.attributes['playbackIndexChanged'] = true;
                //  Change state to START_MODE
                this.handler.state = constants.states.START_MODE;
                var message = vocab.makeGreeting();
                var reprompt = 'You can ask me to play something if you want.';
            } else {
                var message = vocab.makeGreeting()
                var reprompt = 'Try asking me to play something else.'
            }
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'PlayAudio' : function () {
            var params = buildParamsFromRequest(this.event.request)
            if (!this.attributes['playOrder']) {
                // Initialize Attributes if undefined.
                var params = buildParamsFromRequest(this.event.request)
                var playOrder = []
                getPlayOrderForParams(params, playOrder)
                if (playOrder.length > 0) {
                    this.attributes['params'] = params
                    this.attributes['playOrder'] = playOrder//Array.apply(null, {length: audioData.length}).map(Number.call, Number);
                    this.attributes['index'] = 0;
                    this.attributes['offsetInMilliseconds'] = 0;
                    this.attributes['loop'] = true;
                    this.attributes['shuffle'] = false;
                    this.attributes['playbackIndexChanged'] = true;
                    //  Change state to START_MODE
                    this.handler.state = constants.states.START_MODE;
                    controller.play.call(this);
                } else {
                    var message = SONG_NOT_FOUND
                    var reprompt = 'Try asking me to play something else.'
                    this.response.speak(message).listen(reprompt);
                    this.emit(':responseReady');
                }
            } else {
                controller.play.call(this);
            }
        },
        'PlaySpecificAudio' : function () {
            // play audio with specific filtering based on user preference
            // Initialize Attributes if undefined.
            // get artist, title, root, mode, tag from this.event.request
            var params = buildParamsFromRequest(this.event.request)
            var playOrder = []
            getPlayOrderForParams(params, playOrder)
            if (playOrder.length > 0) {
                this.attributes['params'] = params
                this.attributes['playOrder'] = playOrder//Array.apply(null, {length: audioData.length}).map(Number.call, Number);
                this.attributes['index'] = 0;
                this.attributes['offsetInMilliseconds'] = 0;
                this.attributes['loop'] = true;
                this.attributes['shuffle'] = false;
                this.attributes['playbackIndexChanged'] = true;
                //  Change state to START_MODE
                this.handler.state = constants.states.START_MODE;
                controller.play.call(this);
            } else {
                var message = SONG_NOT_FOUND
                var reprompt = 'Try asking me to play something else.'
                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');
            }
        },
        'NotesInScaleIntent' : function () {
            var message = musicTheory.handleNotesInScaleIntent(this.event.request)
            this.response.speak(message).listen(genericReprompt);
            this.emit(':responseReady');
        },
        'NotesInChordIntent' : function () {
            var message = musicTheory.handleNotesInChordIntent(this.event.request)
            this.response.speak(message).listen(genericReprompt);
            this.emit(':responseReady');
        },
        'RandomChordIntent' : function () {
            var message = musicTheory.handleRandomChordIntent()
            this.response.speak(message).listen(genericReprompt);
            this.emit(':responseReady');
        },
        'RandomScaleIntent' : function () {
            var message = musicTheory.handleRandomScaleIntent()
            this.response.speak(message).listen(genericReprompt);
            this.emit(':responseReady');
        },
        'AMAZON.HelpIntent' : function () {
            var message = vocab.makeHelpStatement();
            this.response.speak(message).listen(genericReprompt);
            this.emit(':responseReady');
        },
        'AMAZON.StopIntent' : function () {
            var message = vocab.makeGoodbye()
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'AMAZON.CancelIntent' : function () {
            var message = vocab.makeGoodbye()
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'SessionEndedRequest' : function () {
            // No session ended logic
        },
        'Unhandled' : function () {
            var message = vocab.makeHelpStatement();
            this.response.speak(message).listen(genericReprompt);
            this.emit(':responseReady');
        }
    }),
    playModeIntentHandlers : Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
        /*
         *  All Intent Handlers for state : PLAY_MODE
         */
        'StartIntent': function () { this.emit(':ask', vocab.makeGreeting())},
        'LaunchRequest' : function () {
            /*
             *  Session resumed in PLAY_MODE STATE.
             *  If playback had finished during last session :
             *      Give welcome message.
             *      Change state to START_STATE to restrict user inputs.
             *  Else :
             *      Ask user if he/she wants to resume from last position.
             *      Change state to RESUME_DECISION_MODE
             */
            var message;
            var reprompt;
            if (this.attributes['playbackFinished']) {
                this.handler.state = constants.states.START_MODE;
                message = vocab.makeGreeting();
                reprompt = 'Try asking me to play something bluesy';
            } else {
                this.handler.state = constants.states.RESUME_DECISION_MODE;
                message = 'You were listening to ' + audioData[this.attributes['playOrder'][this.attributes['index']]].title +
                    '<break time="0.5s" /> Would you like to resume?';
                reprompt = 'You can say yes to resume or no to play from the top.';
            }

            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'PlayAudio' : function () { controller.play.call(this) },
        'PlaySpecificAudio' : function () {
            // play audio with specific filtering based on user preference
            // Initialize Attributes if undefined.
            // get artist, title, root, mode, tag from this.event.request
            var params = buildParamsFromRequest(this.event.request)
            var playOrder = []
            getPlayOrderForParams(params, playOrder)
            if (playOrder.length > 0) {
                this.attributes['params'] = params
                this.attributes['playOrder'] = playOrder//Array.apply(null, {length: audioData.length}).map(Number.call, Number);
                this.attributes['index'] = 0;
                this.attributes['offsetInMilliseconds'] = 0;
                this.attributes['loop'] = true;
                this.attributes['shuffle'] = false;
                this.attributes['playbackIndexChanged'] = true;
                //  Change state to START_MODE
                this.handler.state = constants.states.START_MODE;
                controller.play.call(this);
            } else {
                var message = SONG_NOT_FOUND
                var reprompt = 'Try asking me to play something else.'
                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');
            }
        },
        'AMAZON.NextIntent' : function () { controller.playNext.call(this) },
        'AMAZON.PreviousIntent' : function () { controller.playPrevious.call(this) },
        'AMAZON.PauseIntent' : function () { controller.stop.call(this) },
        'AMAZON.StopIntent' : function () { controller.stop.call(this) },
        'AMAZON.CancelIntent' : function () { controller.stop.call(this) },
        'AMAZON.ResumeIntent' : function () { controller.play.call(this) },
        'AMAZON.LoopOnIntent' : function () { controller.loopOn.call(this) },
        'AMAZON.LoopOffIntent' : function () { controller.loopOff.call(this) },
        'AMAZON.ShuffleOnIntent' : function () { controller.shuffleOn.call(this) },
        'AMAZON.ShuffleOffIntent' : function () { controller.shuffleOff.call(this) },
        'AMAZON.StartOverIntent' : function () { controller.startOver.call(this) },
        'AMAZON.HelpIntent' : function () {
            // This will called while audio is playing and a user says "ask <invocation_name> for help"
            var message = vocab.makeHelpStatement();
            this.response.speak(message).listen(genericReprompt);
            this.emit(':responseReady');
        },
        'NotesInScaleIntent' : function () {
            var message = musicTheory.handleNotesInScaleIntent(this.event.request)
            this.response.speak(message).listen(genericReprompt);
            this.emit(':responseReady');
        },
        'NotesInChordIntent' : function () {
            var message = musicTheory.handleNotesInChordIntent(this.event.request)
            this.response.speak(message).listen(genericReprompt);
            this.emit(':responseReady');
        },
        'RandomChordIntent' : function () {
            var message = musicTheory.handleRandomChordIntent()
            this.response.speak(message).listen(genericReprompt);
            this.emit(':responseReady');
        },
        'RandomScaleIntent' : function () {
            var message = musicTheory.handleRandomScaleIntent()
            this.response.speak(message).listen(genericReprompt);
            this.emit(':responseReady');
        },
        'SessionEndedRequest' : function () {
            // No session ended logic
        },
        'Unhandled' : function () {
            var message = 'Sorry, I could not understand. You can say, Next or Previous to navigate through the playlist.';
            this.response.speak(message).listen(genericReprompt);
            this.emit(':responseReady');
        }
    }),
    remoteControllerHandlers : Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
        /*
         *  All Requests are received using a Remote Control. Calling corresponding handlers for each of them.
         */
        'PlayCommandIssued' : function () { controller.play.call(this) },
        'PauseCommandIssued' : function () { controller.stop.call(this) },
        'NextCommandIssued' : function () { controller.playNext.call(this) },
        'PreviousCommandIssued' : function () { controller.playPrevious.call(this) }
    }),
    resumeDecisionModeIntentHandlers : Alexa.CreateStateHandler(constants.states.RESUME_DECISION_MODE, {
        /*
         *  All Intent Handlers for state : RESUME_DECISION_MODE
         */
        'StartIntent': function () { this.emit(':ask', vocab.makeGreeting())},
        'LaunchRequest' : function () {
            var message = 'You were listening to ' + audioData[this.attributes['playOrder'][this.attributes['index']]].title +
                '<break time="0.5s" /> Would you like to resume?';
            var reprompt = 'You can say yes to resume or no to play from the top.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'AMAZON.YesIntent' : function () { controller.play.call(this) },
        'AMAZON.NoIntent' : function () { controller.reset.call(this) },
        'AMAZON.HelpIntent' : function () {
            var message = vocab.makeHelpStatement()
            var reprompt = 'You were listening to ' + audioData[this.attributes['index']].title +
                '<break time="0.5s" /> Would you like to resume?';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'NotesInScaleIntent' : function () {
            var message = musicTheory.handleNotesInScaleIntent(this.event.request)
            this.response.speak(message).listen(genericReprompt);
            this.emit(':responseReady');
        },
        'NotesInChordIntent' : function () {
            var message = musicTheory.handleNotesInChordIntent(this.event.request)
            this.response.speak(message).listen(genericReprompt);
            this.emit(':responseReady');
        },
        'RandomChordIntent' : function () {
            var message = musicTheory.handleRandomChordIntent()
            this.response.speak(message).listen(genericReprompt);
            this.emit(':responseReady');
        },
        'RandomScaleIntent' : function () {
            var message = musicTheory.handleRandomScaleIntent()
            this.response.speak(message).listen(genericReprompt);
            this.emit(':responseReady');
        },
        'AMAZON.StopIntent' : function () {
            var message = vocab.makeGoodbye();
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'AMAZON.CancelIntent' : function () {
            var message = vocab.makeGoodbye();
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'SessionEndedRequest' : function () {
            // No session ended logic
        },
        'Unhandled' : function () {
            var message = vocab.makeHelpStatement() //'Sorry, this is not a valid command. Please say help to hear what you can say.';
            this.response.speak(message).listen(genericReprompt);
            this.emit(':responseReady');
        }
    })
};

module.exports = stateHandlers;

var controller = function () {
    return {
        play: function () {
            /*
             *  Using the function to begin playing audio when:
             *      Play Audio intent invoked.
             *      Resuming audio when stopped/paused.
             *      Next/Previous commands issued.
             */
            this.handler.state = constants.states.PLAY_MODE;

            if (this.attributes['playbackFinished']) {
                // Reset to top of the playlist when reached end.
                this.attributes['index'] = 0;
                this.attributes['offsetInMilliseconds'] = 0;
                this.attributes['playbackIndexChanged'] = true;
                this.attributes['playbackFinished'] = false;
            }

            var token = String(this.attributes['playOrder'][this.attributes['index']]);
            var playBehavior = 'REPLACE_ALL';
            var podcast = audioData[this.attributes['playOrder'][this.attributes['index']]];
            var offsetInMilliseconds = this.attributes['offsetInMilliseconds'];
            // Since play behavior is REPLACE_ALL, enqueuedToken attribute need to be set to null.
            this.attributes['enqueuedToken'] = null;

            if (canThrowCard.call(this)) {
                var cardTitle = 'Playing ' + podcast.title;
                var cardContent = 'Playing ' + podcast.title;
                this.response.cardRenderer(cardTitle, cardContent, null);
            }

            this.response.audioPlayerPlay(playBehavior, podcast.url, token, null, offsetInMilliseconds);
            this.emit(':responseReady');
        },
        stop: function () {
            /*
             *  Issuing AudioPlayer.Stop directive to stop the audio.
             *  Attributes already stored when AudioPlayer.Stopped request received.
             */
            this.response.audioPlayerStop();
            this.emit(':responseReady');
        },
        playNext: function () {
            /*
             *  Called when AMAZON.NextIntent or PlaybackController.NextCommandIssued is invoked.
             *  Index is computed using token stored when AudioPlayer.PlaybackStopped command is received.
             *  If reached at the end of the playlist, choose behavior based on "loop" flag.
             */
            var index = this.attributes['index'];
            index += 1;
            // Check for last audio file.
            if (index === this.attributes['playOrder'].length) {//audioData.length) {
                if (this.attributes['loop']) {
                    index = 0;
                } else {
                    // Reached at the end. Thus reset state to start mode and stop playing.
                    this.handler.state = constants.states.START_MODE;

                    var message = 'You have reached at the end of the playlist.';
                    this.response.speak(message).audioPlayerStop();
                    return this.emit(':responseReady');
                }
            }
            // Set values to attributes.
            this.attributes['index'] = index;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['playbackIndexChanged'] = true;

            controller.play.call(this);
        },
        playPrevious: function () {
            /*
             *  Called when AMAZON.PreviousIntent or PlaybackController.PreviousCommandIssued is invoked.
             *  Index is computed using token stored when AudioPlayer.PlaybackStopped command is received.
             *  If reached at the end of the playlist, choose behavior based on "loop" flag.
             */
            var index = this.attributes['index'];
            index -= 1;
            // Check for last audio file.
            if (index === -1) {
                if (this.attributes['loop']) {
                    index = this.attributes['playOrder'].length - 1;//audioData.length - 1;
                } else {
                    // Reached at the end. Thus reset state to start mode and stop playing.
                    this.handler.state = constants.states.START_MODE;

                    var message = 'You have reached at the start of the playlist.';
                    this.response.speak(message).audioPlayerStop();
                    return this.emit(':responseReady');
                }
            }
            // Set values to attributes.
            this.attributes['index'] = index;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['playbackIndexChanged'] = true;

            controller.play.call(this);
        },
        loopOn: function () {
            // Turn on loop play.
            this.attributes['loop'] = true;
            var message = 'Loop turned on.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        loopOff: function () {
            // Turn off looping
            this.attributes['loop'] = false;
            var message = 'Loop turned off.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        shuffleOn: function () {
            // Turn on shuffle play.
            this.attributes['shuffle'] = true;
            this.attributes['playOrder'] = newShuffle(this.attributes['playOrder']);
            this.attributes['index'] = 0;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['playbackIndexChanged'] = true;
            controller.play.call(this);
            
            /*shuffleOrder((newOrder) => {
                // Play order have been shuffled. Re-initializing indices and playing first song in shuffled order.
                this.attributes['playOrder'] = newOrder;
                this.attributes['index'] = 0;
                this.attributes['offsetInMilliseconds'] = 0;
                this.attributes['playbackIndexChanged'] = true;
                controller.play.call(this);
            });*/
        },
        shuffleOff: function () {
            // Turn off shuffle play. 
            if (this.attributes['shuffle']) {
                this.attributes['shuffle'] = false;
                // Although changing index, no change in audio file being played as the change is to account for reordering playOrder
                this.attributes['index'] = this.attributes['playOrder'][this.attributes['index']];
                this.attributes['playOrder'] = getPlayOrderForParams(this.attributes['params']) //Array.apply(null, {length: audioData.length}).map(Number.call, Number);
            }
            controller.play.call(this);
        },
        startOver: function () {
            // Start over the current audio file.
            this.attributes['offsetInMilliseconds'] = 0;
            controller.play.call(this);
        },
        reset: function () {
            // Reset to top of the playlist.
            this.attributes['index'] = 0;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['playbackIndexChanged'] = true;
            controller.play.call(this);
        }
    }
}();

function canThrowCard() {
    /*
     * To determine when can a card should be inserted in the response.
     * In response to a PlaybackController Request (remote control events) we cannot issue a card,
     * Thus adding restriction of request type being "IntentRequest".
     */
    if (this.event.request.type === 'IntentRequest' && this.attributes['playbackIndexChanged']) {
        this.attributes['playbackIndexChanged'] = false;
        return true;
    } else {
        return false;
    }
}

function newShuffle(currOrder) {
    var array = JSON.parse(JSON.stringify(currOrder)) //Array.apply(null, {length: currOrder.length}).map(Number.call, Number);
    var currentIndex = array.length;
    var temp, randomIndex;

    while (currentIndex >= 1) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
    }
    return array
}

function shuffleOrder(callback) {
    // Algorithm : Fisher-Yates shuffle
    var array = Array.apply(null, {length: audioData.length}).map(Number.call, Number);
    var currentIndex = array.length;
    var temp, randomIndex;

    while (currentIndex >= 1) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
    }
    callback(array);
}