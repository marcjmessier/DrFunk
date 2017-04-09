var musicConstants = require('./musicConstants')
var utils = require('./utils')
var vocab = require('./vocab')

function getScaleForMode(mode) {
	// finds the parent scale that contains the given mode
	for (var key in musicConstants.modePatterns) {
		if (mode in musicConstants.modePatterns[key]) {
			return key
		}
	}
	return undefined
}

var HOW_ELSE_CAN_I_HELP = '<break time="0.5s" /> How else can I help? '
var MISUNDERSTOOD_ROOT = 'I didn\'t understand the root note you specified. You can try again if you want.' + HOW_ELSE_CAN_I_HELP
var MISUNDERSTOOD_CHORD = 'I didn\'t understand the chord you specified. You can try again if you want.' + HOW_ELSE_CAN_I_HELP
var MISUNDERSTOOD_MODE = 'I didn\'t understand the mode you specified. You can try again if you want.' + HOW_ELSE_CAN_I_HELP

function getDefaultModeForScale(scale) {
	// for a given scale, return the string with a corresponding value of 0
	var mode = ''
	if (musicConstants.modePatterns[scale] != undefined) {
		for (var key in musicConstants.modePatterns[scale]) {
			if (musicConstants.modePatterns[scale][key] == 0) {
				mode = key
				break
			}
		}
	} 
	return mode
}

function concatStringIndices(stringArr, indices) {
	// given an array of string and an array of indices,
	// return a string of the stringArr indices concated where the indices are 1
	var str = []
	for (var i = 0; i < indices.length; i += 1) {
		if (indices[i] == 1) {
			str.push(stringArr[i])
		}
	}
	return str
}

function convertPatternToString(pattern, rootNote) {
	// take an array of ints (0's and 1's) and convert to proper strings in an array (C, D, E flat, etc.)
	// use rootNote to determine if sharps or flats should be used
	var notes
	if (rootNote.indexOf('sharp') > -1) {
		notes = concatStringIndices(musicConstants.indexToSharpNote, pattern)
	} else if (rootNote.indexOf('flat') > -1) {
		notes = concatStringIndices(musicConstants.indexToFlatNode, pattern)
	} else {
		// only F major and B major are flat default for scales
		notes = concatStringIndices(musicConstants.indexToSharpNote, pattern)
	}
	return notes
}

function calculateStringShiftAmt(pattern, rootIdx) {
	// given a root idx and a pattern, return the number of 1's preceding the idx
	var shiftAmt = 0
	for (var i = 0; i < rootIdx; i += 1) {
		if (pattern[i] == 1) {
			shiftAmt += 1
		}
	}
	return shiftAmt
}

function shiftRootOfPattern(pattern, n) {
	// circular shift the pattern left by n elements
	for (var i = 0; i < n; i += 1) {
		var tmp = pattern.shift()
		pattern.push(tmp)
	}
}

function modallyShiftScalePattern(pattern, n) {
	// circularly left shifts the pattern until the nth 1 is at the front
	var count = 0
	var idx 
	for (idx = 0; idx < pattern.length; idx += 1) {
		if (pattern[idx] == 1) {
			count += 1
		}
		if (count == (n + 1)) {
			break
		}
	}
	shiftRootOfPattern(pattern, idx)
}

function concatStrArr(strArr) {
	// concatenate all elements in the strArr comma separated
	var str = ''
	for (var i = 0; i < strArr.length; i+=1) {
		str += strArr[i] + ', '
	}
	return str
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function getURLForChord(root, chordType) {
	// convention is https://s3.amazonaws.com/drfunkbucket/chords/root_chordType (replace ' ' with '_')_chord.mp3
	// replace '#' with '%23'
	// no flats, only sharps and naturals
	// convert root note to correct format
	console.log('root: ' + root)
	console.log('chord: ' + chordType)
	root = root.replace('ay','a')
	var sharpNote = musicConstants.indexToSharpNote[musicConstants.noteToIndex[root]]
	sharpNote = sharpNote.replace('ay','a')
	sharpNote = sharpNote.replace(' ','')
	sharpNote = sharpNote.replace('sharp','%23')
	sharpNote = sharpNote.toUpperCase()
	chordType = chordType.replaceAll(' ','_')
	var url = 'https://s3.amazonaws.com/drfunkbucket/chords/' + sharpNote + '_' + chordType + '_chord.mp3'
	return url
}

function getURLForMode(root, modeType) {
	// convention is https://s3.amazonaws.com/drfunkbucket/scales/root_modeType (replace ' ' with '_').mp3
	// replace '#' with '%23'
	// no flats, only sharps and naturals
	console.log('root: ' + root)
	console.log('modeType: ' + modeType)
	if (modeType == 'major') {
		modeType = 'ionian'
	}
	if (modeType == 'minor') {
		modeType = 'aeolian'
	}
	if (modeType == 'dominant') {
		modeType = 'mixolydian'
	}
	root = root.replace('ay','a')
	var sharpNote = musicConstants.indexToSharpNote[musicConstants.noteToIndex[root]]
	sharpNote = sharpNote.replace('ay','a')
	sharpNote = sharpNote.replace(' ','')
	sharpNote = sharpNote.replace('sharp','%23')
	sharpNote = sharpNote.toUpperCase()
	modeType = modeType.replaceAll(' ','_')
	var url = 'https://s3.amazonaws.com/drfunkbucket/scales/' + sharpNote + '_' + modeType + '.mp3'
	return url
}

function getChordNotes(chordType, rootNote) {
	// given a chordType string and rootNote string, return the response txt
	// first make sure we're passed actual values
	if (chordType == undefined) {
		return MISUNDERSTOOD_CHORD
	}
	chordType = chordType.toLowerCase()
	if (rootNote == undefined) {
		return MISUNDERSTOOD_ROOT
	}
	//rootNote = rootNote.replace(/[^0-9a-z]/gi, '') // remove strange characters
	rootNote = rootNote.replace('.','')
	rootNote = rootNote.toLowerCase()

	var rootNotePhonetic = musicConstants.phoneticToKey[rootNote]
	if (rootNotePhonetic == undefined) {
		return MISUNDERSTOOD_ROOT
	}
	var rootNoteIdx = musicConstants.noteToIndex[rootNotePhonetic.toLowerCase()]
	// hacky deep copy of the chordPatterns object so we don't modify it
	var chordSubObj = musicConstants.chordPatterns[chordType.toLowerCase()]
	if (chordSubObj == undefined) {
		return MISUNDERSTOOD_CHORD
	}
	var chordPattern = JSON.parse(JSON.stringify(chordSubObj))

	if (rootNoteIdx != undefined) {
		if (chordPattern != undefined) {
			// left circular shift it by the 12 - rootNoteIdx (right shift by rootNoteIdx elements)
			shiftRootOfPattern(chordPattern, (12 - rootNoteIdx))
			var notesStrArr = convertPatternToString(chordPattern, rootNote)
			var shiftAmt = calculateStringShiftAmt(chordPattern, rootNoteIdx)
			shiftRootOfPattern(notesStrArr, shiftAmt)
			var notesStr = concatStrArr(notesStrArr)
			var chordURL = getURLForChord(rootNotePhonetic, chordType)
			var returnSpeech = 'The notes in the ' + rootNotePhonetic + ' ' + chordType + ' chord are ' + notesStr + '<audio src=\"' + chordURL + '\" />'
			return returnSpeech + HOW_ELSE_CAN_I_HELP
		} else {
			// didn't find a match for the chord name
			return MISUNDERSTOOD_CHORD
		}
	} else {
		// didn't find a match for the root note
		return MISUNDERSTOOD_ROOT
	}
}

function getScaleNotes(scaleType, rootNote, modeType) {
	// given a scaleType, a rootNote string, and a mode type, return the response txt
	// first make sure we've been passed values
	if (scaleType == undefined) {
		return MISUNDERSTOOD_MODE
	}
	scaleType = scaleType.toLowerCase()
	if (rootNote == undefined) {
		return MISUNDERSTOOD_ROOT
	}
	rootNote = rootNote.replace('.','')
	//rootNote = rootNote.replace(/[^0-9a-z]/gi, '') // remove strange characters
	rootNote = rootNote.toLowerCase()
	if (modeType == undefined) {
		return MISUNDERSTOOD_MODE
	}
	modeType = modeType.toLowerCase()

	var rootNotePhonetic = musicConstants.phoneticToKey[rootNote]
	if (rootNotePhonetic == undefined) {
		return MISUNDERSTOOD_ROOT
	}
	var rootNoteIdx = musicConstants.noteToIndex[rootNotePhonetic.toLowerCase()]
	// hacky deep copy of the chordPatterns object so we don't modify it
	var scaleSubObj = musicConstants.scalePatterns[scaleType]
	if (scaleSubObj == undefined) {
		return MISUNDERSTOOD_MODE
	}
	var scalePattern = JSON.parse(JSON.stringify(scaleSubObj))
	var modalShiftScale = musicConstants.modePatterns[scaleType]
	var modalShiftAmt

	if (modalShiftScale != undefined) {
		modalShiftAmt = modalShiftScale[modeType]
	} else {
		return MISUNDERSTOOD_MODE
	}

	if (modalShiftAmt == undefined) {
		return 'I don\'t think the ' +  modeType + ' is a part of the ' + scaleType + ' scale' + HOW_ELSE_CAN_I_HELP
	}

	if (rootNoteIdx != undefined) {
		if (scalePattern != undefined) {
			// first modally shift it
			modallyShiftScalePattern(scalePattern, modalShiftAmt)
			// left circular shift it by the 12 - rootNoteIdx (right shift by rootNoteIdx elements)
			shiftRootOfPattern(scalePattern, (12 - rootNoteIdx))
			var notesStrArr = convertPatternToString(scalePattern, rootNote)
			// shift so that first note comes first
			var shiftAmt = calculateStringShiftAmt(scalePattern, rootNoteIdx)
			shiftRootOfPattern(notesStrArr, shiftAmt)
			var notesStr = concatStrArr(notesStrArr)
			var scaleURL = getURLForMode(rootNotePhonetic, modeType)
			var returnSpeech = 'The notes in the ' + rootNotePhonetic + ' ' + modeType + ' scale are ' + notesStr + ' <audio src=\"' + scaleURL + '\" />'
			return returnSpeech + HOW_ELSE_CAN_I_HELP
		} else {
			// didn't find a match for the chord name
			return MISUNDERSTOOD_CHORD
		}
	} else {
		// didn't find a match for the root note
		return MISUNDERSTOOD_ROOT
	}
}

function handleNotesInChordIntent(request) {
	// handle the end to end request for notes in a chord intent
	// return the speech
	var rootNote = request.intent.slots.RootNote
	var chordType= request.intent.slots.ChordType
	var chord
	if (rootNote != undefined) {
		if (chordType != undefined) {
			if (chordType.value == undefined) {
				chordType.value = 'major'
			}
			chord = chordType.value
		} else {
			chord = 'major'
		}
		return getChordNotes(chord, rootNote.value)
	} else {
		return MISUNDERSTOOD_ROOT
	}
}

function handleNotesInScaleIntent(request) {
	// handle the end to end request for notes in a scale intent
	// return the speech
	var rootNote = request.intent.slots.RootNote
	var modeType = request.intent.slots.ModeType

	var scale, mode

	// if the root note is not defined
	if (rootNote != undefined) {
		
		if (modeType == undefined) {
			// assume default mode to be ionian (major scale)
			mode = 'major'
			//mode = getDefaultModeForScale(scale)
		} else {
			if (modeType.value == undefined) {
				modeType.value = 'major'
			}
			mode = modeType.value.toLowerCase()
		}
		scale = getScaleForMode(mode)
		if (scale == undefined) {
			return MISUNDERSTOOD_MODE
		}
		return getScaleNotes(scale, rootNote.value, mode)
	} else {
		return MISUNDERSTOOD_ROOT
	}
}

function handleRandomChordIntent() {
	// get a random root and a random chord type
	var rootNoteIdx = utils.randomInRange(0, musicConstants.indexToSharpNote.length)
	var rootNote = musicConstants.indexToSharpNote[rootNoteIdx]
	var allChordTypes = []
	for (var key in musicConstants.chordPatterns) {
		allChordTypes.push(key)
	}
	// get a random chord pattern and take a deep copy of it
	var chordName = allChordTypes[utils.randomInRange(0, allChordTypes.length)]
	var chordPattern = JSON.parse(JSON.stringify(musicConstants.chordPatterns[chordName]))
	// shift the pattern by the right amount
	shiftRootOfPattern(chordPattern, (12 - rootNoteIdx))
	var notesStrArr = convertPatternToString(chordPattern, rootNote)
	// shift so that first note comes first
	var shiftAmt = calculateStringShiftAmt(chordPattern, rootNoteIdx)
	shiftRootOfPattern(notesStrArr, shiftAmt)
	var notesStr = concatStrArr(notesStrArr)
	var returnSpeech = '' + rootNote + ' ' + chordName + ' is ' + vocab.getRandomCoolAdjective() + ' ' + vocab.getRandomCoolNoun() + '. The notes are ' + notesStr
	+ '<audio src=\"' + getURLForChord(rootNote, chordName) + '\" />' + HOW_ELSE_CAN_I_HELP
	return returnSpeech
}

function handleRandomScaleIntent() {
	// get a random root and a random chord type
	var rootNoteIdx = utils.randomInRange(0, musicConstants.indexToSharpNote.length)
	var rootNote = musicConstants.indexToSharpNote[rootNoteIdx]
	var allModeTypes = []
	var allScaleTypes = []
	for (var key in musicConstants.scalePatterns) {
		allScaleTypes.push(key)
	}
	var scale = allScaleTypes[utils.randomInRange(0, allScaleTypes.length)]
	for (var key in musicConstants.modePatterns[scale]) {
		allModeTypes.push(key)
	}
	// get a random chord pattern and take a deep copy of it
	var modeName = allModeTypes[utils.randomInRange(0, allModeTypes.length)]
	console.log("Mode Name: " + modeName)
	console.log("Scale: " + scale)
	var scalePattern = JSON.parse(JSON.stringify(musicConstants.scalePatterns[scale]))
	var modalShiftAmt = musicConstants.modePatterns[scale][modeName]
	modallyShiftScalePattern(scalePattern, modalShiftAmt)
	// shift the pattern by the right amount
	shiftRootOfPattern(scalePattern, (12 - rootNoteIdx))
	var notesStrArr = convertPatternToString(scalePattern, rootNote)
	// shift so that first note comes first
	var shiftAmt = calculateStringShiftAmt(scalePattern, rootNoteIdx)
	shiftRootOfPattern(notesStrArr, shiftAmt)
	var notesStr = concatStrArr(notesStrArr)
	var returnSpeech = '' + rootNote + ' ' + modeName + ' is ' + vocab.getRandomCoolAdjective() + ' ' + vocab.getRandomCoolNoun() + '. The notes are ' + notesStr 
		+ '<audio src=\"' + getURLForMode(rootNote, modeName) + '\" />' + HOW_ELSE_CAN_I_HELP
	return returnSpeech
}

module.exports = {
	handleNotesInScaleIntent,
	handleNotesInChordIntent,
	handleRandomChordIntent,
	handleRandomScaleIntent
}