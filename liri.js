require('dotenv').config();
var keys = require('./keys.js');
var axios = require('axios');
var moment = require('moment');
var Spotify = require('node-spotify-api');
var chalk = require('chalk');
var inquirer = require('inquirer');
var Table = require('cli-table');
var fs = require('fs');

var searchTerm = process.argv.splice(3).join(' ');
var display = 'list';

var pickOption = function() {
    console.log(chalk.blue('The following commands are available: \n') +
        chalk.green('(1)') + ' Get concert details\n' +
        chalk.green('(2)') + ' Get song details\n' +
        chalk.green('(3)') + ' Get movie details\n' +
        chalk.green('(4)') + ' Get selection from random.txt file');

    inquirer.prompt([{
        type: 'input',
        message: 'Please enter an option from the list above:',
        name: 'option'
    }]).then(function(response) {
        switch (response.option) {
            case '1':
                getConcert();
                break;
            case '2':
                getSpotify();
                break;
            case '3':
                getMovie();
                break;
            case '4':
                doWhatItSays();
                break;
            default:
                console.log(chalk.yellow('LIRI does not know that command!'));
                pickOption();
        };
    });
};

var getConcert = function() {
    var artist;
    inquirer.prompt([{
        type: 'input',
        message: 'Please enter an artist, group or band:',
        name: "artist"
    }]).then(function(response) {
        artist = response.artist;
        inquirer.prompt([{
            type: 'list',
            message: 'Would you like the results displayed in a list or table?',
            choices: ['list', 'table'],
            name: 'display'
        }]).then(function(response) {
            display = response.display;
            displayConcert(artist);
        });
    });
};

var displayConcert = function(artist) {
    if (!artist) {
        console.log(chalk.yellow('No artist/band entered. Please try again.'));
        restart();
    } else {
        axios.get('https://rest.bandsintown.com/artists/' + artist + '/events?app_id=codingbootcamp')
            .then(function(response) {

                var concerts = response.data;
                if (concerts.length === 0) {
                    console.log(chalk.red('No concert information found.'));
                } else {

                    if (display === 'list') {

                        for (var i = 0; i < concerts.length; i++) {
                            console.log(chalk.green('Venue: ') + concerts[i].venue.name);
                            console.log(chalk.green('Location: ') + concerts[i].venue.city + ', ' + concerts[i].venue.region + ' ' + concerts[i].venue.country);
                            console.log(chalk.green('Date: ') + moment(concerts[i].datetime.substring(0, 10), 'YYYY-MM-DD').format('MM/DD/YYYY'));
                            console.log(chalk.yellow('----------------------------------------'));
                        };

                    } else { //table

                        var table = new Table({
                            head: [chalk.yellow('Venue'), chalk.yellow('Location'), chalk.yellow('Date')],
                            colWidths: [30, 30, 15]
                        });

                        for (var i = 0; i < concerts.length; i++) {
                            table.push(
                                [concerts[i].venue.name, concerts[i].venue.city + ', ' + concerts[i].venue.region + ' ' + concerts[i].venue.country, moment(concerts[i].datetime.substring(0, 10), 'YYYY-MM-DD').format('MM/DD/YYYY')]
                            );
                        };

                        console.log(table.toString());
                    };
                };
                restart();
            });
    };
};

var getArtistNames = function(artist) {
    return artist.name;
}

var getSpotify = function() {
    var songName;
    inquirer.prompt([{
        type: 'input',
        message: 'Please enter a song title:',
        name: "song"
    }]).then(function(response) {
        songName = response.song;
        inquirer.prompt([{
            type: 'list',
            message: 'Would you like the results displayed in a list or table?',
            choices: ['list', 'table'],
            name: 'display'
        }]).then(function(response) {
            display = response.display;
            displaySpotify(songName);
        });
    });
};

var displaySpotify = function(songName) {
    if (!songName) {
        songName = 'I Will Always Love You';
        console.log(chalk.yellow('No song title entered. Showing results for "I Will Always Love You" by Dolly Parton.'));
    };

    var spotify = new Spotify(keys.spotify);

    spotify.search({ type: 'track', query: songName })
        .then(function(response) {
            var songs = response.tracks.items;

            if (songs.length === 0) {
                console.log(chalk.red('No song information found.'));
            } else {
                if (display === 'list') {

                    for (var i = 0; i < songs.length; i++) {
                        console.log(chalk.green('artist(s): ') + songs[i].artists.map(getArtistNames).join(', '));
                        console.log(chalk.green('song name: ') + songs[i].name);
                        console.log(chalk.green('preview song: ') + songs[i].preview_url);
                        console.log(chalk.green('album: ') + songs[i].album.name);
                        console.log(chalk.yellow('----------------------------------------'));
                    };

                } else { //table

                    var table = new Table({
                        head: [chalk.yellow('Artist(s)'), chalk.yellow('Song'), chalk.yellow('Album'), chalk.yellow('Preview')],
                        colWidths: [30, 30, 30, 80]
                    });

                    for (var i = 0; i < songs.length; i++) {
                        var preview = songs[i].preview_url;
                        if (!preview) { preview = 'n/a' };
                        table.push(
                            [songs[i].artists.map(getArtistNames).join(', '), songs[i].name, songs[i].album.name, preview]
                        );
                    };

                    console.log(table.toString());

                };
            };
            restart();
        });
};

var getMovie = function() {
    var movieName;
    inquirer.prompt([{
        type: 'input',
        message: 'Please enter a movie title:',
        name: "movie"
    }]).then(function(response) {
        movieName = response.movie;
        inquirer.prompt([{
            type: 'list',
            message: 'Would you like the results displayed in a list or table?',
            choices: ['list', 'table'],
            name: 'display'
        }]).then(function(response) {
            display = response.display;
            displayMovie(movieName);
        });
    });
};

var displayMovie = function(movieName) {
    if (!movieName) {
        movieName = 'mr nobody';
        console.log(chalk.yellow('No movie title entered. Showing results for "Mr. Nobody".'));
    };

    axios.get('http://www.omdbapi.com/?apikey=trilogy&t=' + movieName)
        .then(function(response) {
            var movie = response.data;

            if (movie.length === 0) {
                console.log(chalk.red('No movie information found.'));
            } else {
                if (display === 'list') {

                    console.log(chalk.green('Title: ') + movie.Title);
                    console.log(chalk.green('Year: ') + movie.Year);
                    console.log(chalk.green('Rated: ') + movie.Rated);
                    console.log(chalk.green('Country: ') + movie.Country);
                    console.log(chalk.green('Language: ') + movie.Language);
                    console.log(chalk.green('Actors: ') + movie.Actors);
                    console.log(chalk.green('Plot: ') + movie.Plot);

                } else { //table

                    var table = new Table({
                        head: [chalk.yellow('Title'), chalk.yellow('Year'), chalk.yellow('Rated'), chalk.yellow('Cntry'), chalk.yellow('Lang'), chalk.yellow('Actors'), chalk.yellow('Plot')],
                        colWidths: [30, 8, 8, 8, 10, 30, 80]
                    });

                    table.push(
                        [movie.Title, movie.Year, movie.Rated, movie.Country, movie.Language, movie.Actors, movie.Plot]
                    );

                    console.log(table.toString());

                };
            };
            restart();
        });
};

var doWhatItSays = function() {
    fs.readFile('random.txt', 'utf8', function(err, data) {
        if (err) throw err;

        var dataArr = data.split(', ');
        if (dataArr[0] === '') {
            console.log(chalk.yellow('The file does not contain a command.'));
            restart();
        } else {
            console.log(chalk.blue('The file contains: ' + chalk.yellow(data)));
            switch (dataArr[0]) {
                case 'concert-this':
                    displayConcert(dataArr[1]);
                    break;
                case 'spotify-this-song':
                    displaySpotify(dataArr[1]);
                    break;
                case 'movie-this':
                    displayMovie(dataArr[1]);
                    break;
                case 'do-what-it-says':
                    console.log(chalk.red('do-what-it-says cannot be used in the random.txt file! It will break me!'));
                    break;
                default:
                    console.log(chalk.yellow('LIRI does not know that command!'));
                    pickOption();
            };
        };

    });
};

var restart = function() {
    inquirer.prompt([{
        type: "confirm",
        message: "Would you like to choose another option?",
        name: "confirm",
        default: true

    }]).then(function(response) {

        if (response.confirm) {
            pickOption();
        };

    });
};

pickOption();