var MONGODB_URL = "mongodb://localhost/metrics";
var minum = require('../')(MONGODB_URL);

setInterval(function() {

    minum.track('chunks', getRandom(20, 60, true), 's1');
    minum.track('chunks', getRandom(20, 60, true), 's2');

    minum.track('mp3', getRandom(100, 300, true), 's1');
    minum.track('mp3', getRandom(100, 300, true), 's2');

    minum.track('lame', getRandom(100, 300, true), 's1');
    minum.track('lame', getRandom(100, 300, true), 's2');

    minum.track('kkk', getRandom(100, 300, true), 's1');
    minum.track('kkk', getRandom(100, 300, true), 's2');
}, 1000);

function getRandom(min, max, isInt) {

    var randValue = Math.random() * (max - min);
    if(isInt) {
        return min + Math.floor(randValue);
    } else {
        return min + randValue;
    }
}