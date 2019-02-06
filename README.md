# liri-node-app
LIRI is a CLI application that provides concert event info using the Bands-in-Town api, song information using the Spotify API, and movie information using the OMDB API.

To get started, download or clone the repository.
Navigate to the folder location and install the package.json: "npm install"
Run the liri.js file using node from your command line (terminal, bash, etc): "node liri.js"

## Menu Options
A list of menu options will be displayed. Enter the number of your choice and press Enter.
![Menu Options]
(images/node-liri.gif)
## Option 1 - Get concert details
1. Enter an artist, group or band name when prompted.
2. Choose a display option of list or table when prompted.

## Option 2 - Get song details
1. Enter a song title when prompted. Note: If no entry is made a default song will be chosen.
2. Choose a display option of list or table when prompted.

## Option 3 - Get movie details
1. Enter a movie title when prompted. Note: If no entry is made a default move will be chosen.
2. Choose a display option of list or table when prompted.

## Option 4 - Get selection from random.txt file
The random.txt file has an entry in the following format that will be read and executed:
1. concert-this, <artist, group or band name>
2. spotify-this-song, <song title>
3. movie-this, <movie title>


