var app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    emitter = require('events').EventEmitter;

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

var Game = function () {
    this.players = [];
    this.room = null;

    this.hasSpace = function () {
        return this.players.length < 2;
    }

    this.isReady = function () {
        return this.players.length === 2;
    }

    this.addNewPlayer = function () {
        this.players[this.players.length] = guid();
        this.room = this.room || guid();
    }

    this.start = function () {
        console.log('game started ', this.players);
    }

    this.finish = function(io) {
        io.to(this.room).emit('opponentdisconnected');
    }

    this.getRoom = function() {
        return this.room;
    }
}

var games = [new Game()];




app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    var gamesCount = games.length,
        currentGame;
    console.log(gamesCount);
    if (games[gamesCount - 1].hasSpace()) {
        currentGame = games[gamesCount - 1];
        currentGame.addNewPlayer(socket);
        if (currentGame.isReady()) {
            currentGame.start();
        }
    } else {
        games[gamesCount] = new Game();
        currentGame = games[gamesCount];
        currentGame.addNewPlayer(socket);
    }

    socket.join(currentGame.getRoom());

    socket.on('disconnect', function () {
        currentGame.finish(io);
    });

    socket.on('opponent-disconected', function(){
        console.log('opponents-disconnected');
    })

    socket.on('user_hit', function () {

    });

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});
