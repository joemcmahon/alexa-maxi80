'use strict';

var Alexa = require('alexa-sdk');
var audioData = require('./audioAssets');
var constants = require('./constants');

var stateHandlers = {
    'LaunchRequest': function () {
        this.emit('PlayAudio');
    },
    'PlayAudio': function () {
        // play the radio
        controller.play.call(this, `Welcome to ${audioData.title}`);
    },
    'AMAZON.HelpIntent': function () {
        var message = `Welcome to ${audioData.title}, home of captivating electronica. You can play, stop, and resume listening.  How can I help you ?`;
        this.response.listen(message);
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        // No session ended logic
    },
    'ExceptionEncountered': function () {
        console.log("******************* EXCEPTION **********************");
        console.log(JSON.stringify(this.event.request, null, 2));
        this.callback(null, null)
    },
    'Unhandled': function () {
        var message = 'Sorry, I didn\'t understand...';
        this.response.speak(message);
        this.emit(':responseReady');
    },
    'AMAZON.NextIntent': function () {
        this.response.speak('I'm sorry, but you\'ll have to wait for the station to play the next track.');
        this.emit(':responseReady');
    },
    'AMAZON.PreviousIntent': function () {
        this.response.speak('Though we beat back ceaselessly into the past, radio does not.');
        this.emit(':responseReady');
    },

    'AMAZON.PauseIntent': function () { this.emit('AMAZON.StopIntent'); },
    'AMAZON.CancelIntent': function () { this.emit('AMAZON.StopIntent'); },
    'AMAZON.StopIntent': function () { controller.stop.call(this) },

    'AMAZON.ResumeIntent': function () { controller.play.call(this, `resuming ${audioData.title}`) },

    'AMAZON.LoopOnIntent': function () { this.emit('AMAZON.StartOverIntent'); },
    'AMAZON.LoopOffIntent': function () { this.emit('AMAZON.StartOverIntent');},

    'AMAZON.ShuffleOnIntent': function () { this.emit('AMAZON.StartOverIntent');},
    'AMAZON.ShuffleOffIntent': function () { this.emit('AMAZON.StartOverIntent');},

    'AMAZON.StartOverIntent': function () {
        this.response.speak('The station broadcasts continuously, so we can\'t. You can say stop or pause to stop listening.');
        this.emit(':responseReady');

    },
    /*
     *  All Requests are received using a Remote Control. Calling corresponding handlers for each of them.
     */
    'PlayCommandIssued': function () { controller.play.call(this) },
    'PauseCommandIssued': function () { controller.stop.call(this) }
}

module.exports = stateHandlers;

var controller = function () {
    return {
        play: function (text) {
            /*
             *  Using the function to begin playing audio when:
             *      Play Audio intent invoked.
             *      Resuming audio when stopped/paused.
             *      Next/Previous commands issued.
             */

            if (canThrowCard.call(this)) {
                //TODO : add Maxi80 logo image
                var cardTitle = audioData.subtitle;
                var cardContent = audioData.cardContent;
                var cardImage = audioData.image;
                this.response.cardRenderer(cardTitle, cardContent, cardImage);
            }

            this.response.speak(text).audioPlayerPlay('REPLACE_ALL', audioData.url, audioData.url, null, 0);
            this.emit(':responseReady');
        },
        stop: function () {
            /*
             *  Issuing AudioPlayer.Stop directive to stop the audio.
             *  Attributes already stored when AudioPlayer.Stopped request received.
             */
            this.response.speak("Have a pleasant tomorrow.").audioPlayerStop();
            this.emit(':responseReady');
        }
    }
}();

function canThrowCard() {
    /*
     * To determine when can a card should be inserted in the response.
     * In response to a PlaybackController Request (remote control events) we cannot issue a card,
     * Thus adding restriction of request type being "IntentRequest".
     */
    if (this.event.request.type === 'IntentRequest' || this.event.request.type === 'LaunchRequest') {
        return true;
    } else {
        return false;
    }
}

