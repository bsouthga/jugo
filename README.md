# jugo

### [fuego](https://github.com/niemanlab/openfuego) for JavaScript

## Installation

To run jugo, the following must be installed

- [NodeJS](http://nodejs.org/)
- [MongoDB](http://www.mongodb.org/)

Once both are installed, run the following to install jugo locally

```shell
npm install jugo
```

## Usage

```javascript
var jugo = require('jugo');

var J = jugo({
  "twitter" : {
    "consumer_key": "<INSERT KEY>",
    "consumer_secret": "<INSERT KEY>",
    "access_token": "<INSERT KEY>",
    "access_token_secret": "<INSERT KEY>"
  },
  "accounts" : [
    ... // list of accounts you want to track
  ],
  "database" : "mongodb://localhost/test" // database location
})

```
