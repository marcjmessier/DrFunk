'use strict';

// Audio Source - AWS Podcast : https://aws.amazon.com/podcasts/aws-podcast/
var audioData = [
    {
        'title' : 'Planet Gorm',
        'artist' : 'Marc Messier',
        'url' : 'https://s3.amazonaws.com/drfunkbucket/content/PlanetGorm.mp3',
        'root' : 'e',
        'mode' : 'aeolian',
        'tags' : [
            'dark',
            'slow',
            'dramatic',
            'rock'
        ]
    },
    {
    	'title' : 'The Very Sad Blues',
    	'artist' : 'Marc Messier',
    	'url' : 'https://s3.amazonaws.com/drfunkbucket/content/TheVerySadBlues.mp3',
    	'root' : 'a',
    	'mode' : 'aeolian',
    	'tags' : [
    		'bluesy',
    		'sad',
    		'slow'
    	]
    },
    {
        'title' : 'John Deer is a Prick',
        'artist' : 'Marc Messier',
        'url' : 'https://s3.amazonaws.com/drfunkbucket/content/JohnDeerIsAPrick.mp3',
        'root' : 'g',
        'mode' : 'mixolydian',
        'tags' : [
            'rock',
            'upbeat',
            'fast'
        ]
    }
];

module.exports = audioData;
