var socket = io.connect("http://"+window.location.hostname+ ":8080");
var currentRoom = null;
var currentPlayerId = null;
var me = document.querySelector('.me'),
    opponent = document.querySelector('.opponent');

socket.on('opponent-disconnected', function (playerId) {
    console.log('opponent disconected: ', playerId);
    socket.emit('leave');
});

socket.on('joined-to-the-room', function (room, playerId) {
    currentRoom = room;
    currentPlayerId = playerId;
    console.log('joined to the room: ', room,' ',playerId);
    document.querySelector('.log').innerHTML = 'Connected. Waiting for opponent...';
});

socket.on('game-started', function() {
    document.querySelector('.log').innerHTML = 'Game started.';
});
socket.on('opponent-hit', function (players) {
    var me = document.querySelector('.me');
    var opponent = document.querySelector('.opponent');
    players.forEach(function(player){
        if(player.id === currentPlayerId){
            me.style.width = player.width + '%';
        } else {
            opponent.style.width = player.width + '%';
        }
    });
    console.log('opponent hit me',players[0].width,' ',players[1].width);
});

socket.on('game-terminate', function(looserId){
    if(looserId===currentPlayerId){
        alert('you lose');
    }else {
        alert('you win');
    }
    socket.emit('leave');
    document.querySelector('.log').innerHTML = 'Game Finished. Refresh to reconnect...';
});

document.addEventListener('keyup', function (event) {
    if (event.keyCode == 32) {
        if (currentRoom) {
            socket.emit('opponent-hit');
        }
    }
});