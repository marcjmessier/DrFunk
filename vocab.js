var utils = require('./utils')

var greetings = [
	'what it is, what it is.',
	'how\'s it hangin?',
	'let\'s boogie on down.',
	'nanoo nanoo.',
	'que pasa?',
	'say-bro.',
	'say, jack?',
	'wassup.',
	'waz up.',
	'what is hip!',
	'what it iz?',
	'what\'s poppin?',
	'what\'s the skinny?',
	'what\'s goin on Blood?'
];

var coolWords = {
	'nouns':[
		'gravy',
		'dy-no-mite',
		'funk',
		'joints',
		'slam dunks',
		'jams',
		'licks',
		'hits',
		'vibes',
		'tones',
		'dope',
		'juice',
		'shit',
		'thangs'
	],
	'verbs':[
		'boogie down',
		'disco',
		'funk out',
		'jam out',
		'get down',
		'freak out',
		'feel tha funk'
	],
	'adjectives':[
		'far out',
		'ace',
		'awesome',
		'bad',
		'blazin',
		'bitch\'n',
		'boss',
		'cool',
		'cool-o-roonie',
		'copasetic',
		'decent',
		'far-out',
		'funky',
		'gnarly',
		'groovy',
		'hard core',
		'hip',
		'jiggy',
		'killer',
		'mondo cool',
		'neato',
		'nifty',
		'off the hook',
		'outta sight',
		'powerful',
		'psychedelic',
		'rad',
		'radical',
		'real',
		'righteous',
		'ringin',
		'rockin',
		'shrimp farmin',
		'solid',
		'stellar',
		'tight',
		'totally awesome',
		'twitchin',
		'wango',
		'way cool',
		'wicked',
		'supa fly'
	]
};

var reprompts = [
	'can you dig it?',
	'catch my drift?',
	'dig it?',
	'do you copy?',
	'so that\'s the lowdown. cool beans?',
	'ya dig?',
	'is it righteous?',
	'do you feel it?',
	'we good?',
	'you feel me?',
	'you feel that funk?',
	'does that gel?',
	'is it tight?',
	'is it copasetic?',
	'you drinkin tha juice?'
];

var goodbyes = [
	'Peace out home free',
	'later days turkey',
	'groovy!',
	'catch you on the flip side',
	'boogie woogie',
	'far out brotha',
	'feel tha funk',
	'keep on truckin',
	'4 sho',
	'deuces cats',
	'backatcha!',
	'catch you on the rebound',
	'check you later',
	'cuttin out already? okay, peace!',
	'what a drag. later days you jive turkey!',
	'i dig it',
	'i hear that',
	'jump back! okay deuces',
	'alright, let\'s blow this taco stand',
	'rock on',
	'you\'re talkin jive',
	'what it was, what it is, what it will be. catch you on the flip side',
	'check you later',
	'later',
	'lets book'
];

function getRandomWord(wordList) {
	var idx = utils.randomInRange(0, wordList.length)
	return wordList[idx]
}

function makeGreeting() {
	// randomly generates a greeting
	var speech = getRandomWord(greetings)
	// this is the (random adj) + (random noun), Dr Funk coming through
	// + random reprompt
	speech += ' this is the ' + getRandomWord(coolWords['adjectives']) + ' '
	speech += getRandomWord(coolWords['nouns']) + ', Doctor Funk coming through. '
	speech += getRandomWord(reprompts) + ". How can I help?"
	return speech
}

function makeHelpStatement() {
	// randomly generates a help statement
	// Dr Funk knows all about musical chords, scales, and modes
	// you can ask the doctor about any of that (random adj + random noun)
	// If you want to (random verb), the doctor can play anything.
	// tell the doctor the key, speed, or feel of what you're feelin
	var speech = 'Dr Funk knows all about musical chords and modes. '
	speech += 'You can ask the doctor about any of that ' + getRandomWord(coolWords['adjectives']) + ' '
	speech += getRandomWord(coolWords['nouns']) + '. '
	speech += 'If you want to ' + getRandomWord(coolWords['verbs']) + ', the doctor can play anything. '
	speech += 'Just tell the doctor what kind of jams you\'re feelin.'
	return speech
}

function makeGoodbye() {
	// randomly generates a goodbye
	return getRandomWord(goodbyes)
}

function getRandomCoolAdjective() {
	return getRandomWord(coolWords['adjectives'])
}

function getRandomCoolNoun() {
	return getRandomWord(coolWords['nouns'])
}

function getRandomCoolVerb() {
	return getRandomWord(coolWords['verbs'])
}

module.exports = {
	greetings,
	goodbyes,
	coolWords,
	reprompts,
	makeGreeting,
	makeHelpStatement,
	makeGoodbye,
	getRandomCoolAdjective,
	getRandomCoolNoun,
	getRandomCoolVerb
}
