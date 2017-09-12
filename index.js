var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
util = require('util'),
bodyParser = require('body-parser');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var UID = 1;
var roomno = 1;
var maxRoomNo = 1000;
var maxPlayersInRoom = 11;

var gameState = new Object();
gameState.Rooms = [];

for (var i = 0 ; i < maxRoomNo; i++) {
    var Players = [maxPlayersInRoom];
    gameState.Rooms[i] = Players;
    for (var j = 0 ; j < maxPlayersInRoom ; j++) {
        gameState.Rooms[i][j] = [];
    }
}


io.on('connection', function(socket){

	
	console.log('New connection');
	io.sockets.emit("message");
	//io.sockets.in("room-"+player.roomno).emit('gameState', gameState.Players);
	
  //Increase roomno 2 clients are present in a room.
  if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms["room-"+roomno].length == maxPlayersInRoom)
  {
	  roomno++;
	  UID = 1;
  }
	console.log(roomno);
  socket.join("room-"+roomno);

  //Send this event to everyone in the room.
  var playerID = new Object();
  playerID.roomno = roomno;
  playerID.id = UID;
  io.sockets.in("room-"+roomno).emit('connectToRoom', playerID);
  UID++;
  
  socket.on('createUnit', function(player){
      //console.log(player);
      if (gameState.Rooms[player.roomno][player.playerNumber].Units == null) {
          gameState.Rooms[player.roomno][player.playerNumber].Units = [];
      }
      gameState.Rooms[player.roomno][player.playerNumber].Units[player.unit.unitIndex] = player.unit;
    io.sockets.in("room-"+player.roomno).emit('createUnit', player);
  });

  socket.on('unitPosition', function(player){
	console.log(player)//gameState.Rooms[player.roomno][player.playerNumber].Units[0]);
	gameState.Rooms[player.roomno][player.playerNumber].Units[player.unit.unitIndex].position = player.unit.position;
      gameState.Rooms[player.roomno][player.playerNumber].Units[player.unit.unitIndex].rotation = player.unit.rotation;
    io.sockets.in("room-"+player.roomno).emit('unitPosition', player);
  });

    socket.on('unitAnimationState', function(player){
        console.log(player)//gameState.Rooms[player.roomno][player.playerNumber].Units[0]);
        gameState.Rooms[player.roomno][player.playerNumber].Units[player.unit.unitIndex].state = player.unit.state;
        io.sockets.in("room-"+player.roomno).emit('unitAnimationState', player);
    });
  
  socket.on('buildingPlacement', function(player){
    if (gameState.Rooms[player.roomno][player.playerNumber].Buildings == null) {
       gameState.Rooms[player.roomno][player.playerNumber].Buildings = [];
	}
    gameState.Rooms[player.roomno][player.playerNumber].Buildings[player.building.bid] = player.building;
    io.sockets.in("room-"+player.roomno).emit('buildingPlacement', player.building);
  });
  
});

server.listen(port, function(){
  console.log('listening on *:' + port);
});
