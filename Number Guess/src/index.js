//  This used the trivia template as a guide for creating the states and handlers.
//      I decided in not adding a help state due to the simplistic nature of
//      this activity.


'use strict';
var Alexa = require('alexa-sdk');
const APP_ID = 'amzn1.ask.skill.bd00bf1a-4ee7-4515-aef7-f72d1688c61b';

const STATES = {
	// START: '_STARTMODE',	// Restart the session if user wants
	GUESS: '_GUESSMODE' 	// Ask user to guess the number.
};

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(newSessionHandlers, guessStateHandlers, guessAttemptHandlers);
    alexa.execute();
};

//	Not connected to any states, this is the initial handler
//
//	If restart session is going to happen, need to create a new boolean
//		slot to determine if this is a new session or another session.
//		For a more creative flair, instead of a boolean slot, a number
//		slot can be made that way Alexa can track how many times the
//		user has played during this one session.
//	This restart function will assume that the same user that just played
//		is playing again and there will be no switch of players
const newSessionHandlers = Alexa.CreateStateHandler(STATES.START, {
	'LaunchRequest': function() {
		// if (!this.attributes['session'])		// For a number slot, if (['session'] > 0)
			// this.emit('ReLaunchIntent');
		this.emit('LaunchIntent');
	},
	'LaunchIntent': function() {
		// this.attributes['session'] = false;	//	For a number slot, ['session'] += 1
		this.emit(':ask', "Hello, what is your name?");
	},
	// 'ReLaunchIntent': function() {
	//	var message = 'Welcome back, ' + this.attributes['userName'] + '.' +
		//	' You have now tried guessing ' + this.attributes['session'] + ' times.' +	// ****
	// 		' I have again thought of a number between one and one-hundred.' +
	// 		' Please take a guess once again.';
	// 	this.handler.states = STATES.GUESS;	// Shift state to guess
	// 	this.emit(':ask', message);
	// },
	'nameIntent': function() {
		this.attributes['userName'] = this.event.request.intent.slots.userName.value;
		this.handler.state = STATES.GUESS;	//	Shift state to guess
		this.emit(':ask', 'Hello, ' + this.attributes['userName'] + '. I have thought ' +
			'of an integer number between one to one-hundred. Please take a guess ' +
			'as to what the number is.');
	},
    'AMAZON.HelpIntent': function() {
        var message = 'I will think of an integer number between 1 to 100. ' +
            'All you have to do is guess that integer. To start, I would ' +
			'like to know who is playing.';
        this.emit(':ask', message);
    },
	// 'AMAZON.YesIntent': function() {
	// 	this.emit('LaunchRequest');
	// },
	'AMAZON.NoIntent': function() {
		this.emit(':tell', 'Hopefully you try to guess my number next time.');
	},
	'AMAZON.CancelIntent': function() {
		this.emit(':tell', 'Hopefully you try to guess my number next time.');
	},
	'AMAZON.StopIntent': function() {
		this.emit(':tell', 'Hopefully you try to guess my number next time.');
	}
});
//	The only state within the skill, this is the state that handles the user's guess
const guessStateHandlers = Alexa.CreateStateHandler(STATES.GUESS, {
	'numberIntent': function() {
		this.attributes['myNumber'] = this.event.request.intent.slots.myNumber.value;
		var myNum = this.attributes['myNumber'];		//	Less to type
		this.attributes['correctAnswer'] = Math.floor(Math.random() * 100) + 1;
		var correct = this.attributes['correctAnswer'];	//	Less to type
		if ( (myNum >= 1 && myNum <= 100) )
			this.emit('winOrLose', myNum, correct);
		else
			this.emit('noGood');
	},
	'AMAZON.HelpIntent': function() {
        var message = 'I have thought of an integer number between one and ' +
			'one-hundred. Please guess a number within that range.';
        this.emit(':ask', message);
    },
	'AMAZON.NoIntent': function() {
		this.emit(':tell', 'Hopefully you try to guess my number next time.');
	},
	'AMAZON.CancelIntent': function() {
		this.emit(':tell', 'Hopefully you try to guess my number next time.');
	},
	'AMAZON.StopIntent': function() {
		this.emit(':tell', 'Hopefully you try to guess my number next time.');
	}
});

//	This is a helper handler for the Guess State
//	
//	To implement the restart session function, the emit within correctGuess
//		and wrongGuess would have to be tweaked abit
const guessAttemptHandlers = {
	'noGood': function() {
		var message = 'What you have guessed is not valid. ' +
			'Please guess a number from one to one-hundred.';
		this.emit(':ask', message);
	},
	'winOrLose': function(myNum, correct) {
		var solution = (myNum === correct) ? 'correctGuess' : 'wrongGuess';
		this.emit(solution, myNum, correct);
	},
	'correctGuess': function(num1, num2) {
		var message = 'Thank you, ' + this.attributes['userName'] + ', for ' +
			'playing. You had a great guess of ' + num1 + '. You have ' +
			'guessed correctly! Congratulations!';
		this.emit(':tell', message);
		// var message = 'Thank you, ' + this.attributes['userName'] + ', for ' +
		// 	'playing. You had a great guess of ' + num1 + '. You have ' +
		// 	'guessed correctly! Congratulations! Would you like to play again?';
		// this.handler.state = STATES.START;
		// this.emit(':ask', message);
	},
	'wrongGuess': function(num1, num2) {
		var large = (num1 > num2) ? num1 : num2;
		var small = (num1 > num2) ? num2 : num1;
		
		var message = 'Thank you, ' + this.attributes['userName'] + ', for playing. ' +
			'You had a great guess of ' + num1 + '. It was off by' + (large - small) +
			'from what I was thinking of.';
		this.emit(':tell', message);
		// var message = 'Thank you, ' + this.attributes['userName'] + ', for playing. ' +
		// 	'You had a great guess of ' + num1 + '. It was off by' + (large - small) +
		// 	'from what I was thinking of. Would you like to play again?';
		// this.handler.state = STATES.START;
		// this.emit(':ask', message);
	}
};