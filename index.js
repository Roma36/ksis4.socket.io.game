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
        return this.players[this.players.length-1];
    }

    this.start = function () {
        console.log('game started ', this.players);
    }

    this.finish = function (io, playerId) {
        io.to(this.room).emit('opponent-disconnected', playerId);
    }

    this.getRoom = function () {
        return this.room;
    }
}

var games = [new Game()];




app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    var gamesCount = games.length,
        currentGame,
        currentPlayerId;
    console.log(gamesCount);
    if (games[gamesCount - 1].hasSpace()) {
        currentGame = games[gamesCount - 1];
        currentPlayerId = currentGame.addNewPlayer();
        if (currentGame.isReady()) {
            currentGame.start();
        }
    } else {
        games[gamesCount] = new Game();
        currentGame = games[gamesCount];
        currentPlayerId = currentGame.addNewPlayer();
    }

    socket.join(currentGame.getRoom());

    socket.on('disconnect', function () {
        currentGame.finish(io, currentPlayerId);
        socket.leave(currentGame.getRoom());
    });

    socket.on('leave-room', function () {
        socket.leave(currentGame.getRoom());
        console.log('leaved room: ', currentPlayerId);
    })

    socket.on('user_hit', function () {

    });

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});
