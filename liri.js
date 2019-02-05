require('dotenv').config();
var keys = require('./keys.js');
var axios = require('axios');
var moment = require('moment');
var Spotify = require('node-spotify-api');
var fs = require('fs');

var searchTerm = process.argv.splice(3).join(' ');

var pickCase = function(caseData, functionData) {
    switch (caseData) {
        case 'concert-this':
            getBand(functionData);
            break;
        case 'spotify-this-song':
            getSpotify(functionData);
            break;
        case 'movie-this':
            getMovie(functionData);
            break;
        case 'do-what-it-says':
            doWhatItSays();
            break;
        default:
            console.log('LIRI does not know that command!');
    };
};

var log = function() {
    // Create a string of the entered commands
    var text = moment().format('MM/DD/YYYY HH:mm') + ', Command: ' + process.argv[2] + ', Search: ' + searchTerm

    // Log the commands if string not empty
    if (text != '') {
        fs.appendFile('log.txt', text + '\r', function(err) {
            if (err) {
                console.log(err);
            };
        });
    };
};

var getBand = function(artist) {
    axios.get('https://rest.bandsintown.com/artists/' + artist + '/events?app_id=codingbootcamp')
        .then(function(response) {
            var concerts = response.data;
            for (var i = 0; i < concerts.length; i++) {
                console.log('Venue: ' + concerts[i].venue.name);
                console.log('Location: ' + concerts[i].venue.city + ', ' + concerts[i].venue.region + ' ' + concerts[i].venue.country);
                console.log('Date: ' + moment(concerts[i].datetime.substring(0, 10), 'YYYY-MM-DD').format('MM/DD/YYYY'));
                console.log('----------------------------------------');
            };
        });
};

var getArtistNames = function(artist) {
    return artist.name;
}

var getSpotify = function(songName) {
    var spotify = new Spotify(keys.spotify);

    if (!songName) { var songName = 'the sign' };
    spotify.search({ type: 'track', query: songName })
        .then(function(response) {
            var songs = response.tracks.items;
            for (var i = 0; i < songs.length; i++) {
                console.log('artist(s): ' + songs[i].artists.map(getArtistNames));
                console.log('song name: ' + songs[i].name);
                console.log('preview song: ' + songs[i].preview_url);
                console.log('album: ' + songs[i].album.name);
                console.log('----------------------------------------');
            };
        });
};

var getMovie = function(movieName) {
    if (!movieName) { var movieName = 'mr nobody' };
    axios.get('http://www.omdbapi.com/?apikey=trilogy&t=' + movieName)
        .then(function(response) {
            var movie = response.data;

            console.log('Title: ' + movie.Title);
            console.log('Year: ' + movie.Year);
            console.log('Rated: ' + movie.Rated);
            console.log('Country: ' + movie.Country);
            console.log('Language: ' + movie.Language);
            console.log('Plot: ' + movie.Plot);
            console.log('Actors: ' + movie.Actors);
        });
};

var doWhatItSays = function() {
    fs.readFile('random.txt', 'utf8', function(err, data) {
        if (err) throw err;

        var dataArr = data.split(', ');
        if (dataArr[0] === '') {
            console.log('The file does not contain a command.');
        } else {
            pickCase(dataArr[0], dataArr[1]);
        };

    });
};

log();
pickCase(process.argv[2], searchTerm);