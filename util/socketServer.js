module.exports = function(server){
  const io = require('socket.io')(server)
  var clientCount = 0;
  var socketMap = {}; //存储客户端
  io.on('connection', function (socket) {
    clientCount++;
    socket.clientNum = clientCount;
    socketMap[clientCount] = socket;
    if(clientCount % 2 == 1){
      socket.emit('waiting','waiting for another person');
    }else {
      socket.emit('start');
      socketMap[clientCount - 1].emit('start');
    }
    socket.on('cur',function(data){
      if(socket.clientNum % 2 == 0){
        console.log('serverCur',data);
        socketMap[socket.clientNum - 1].emit('cur',data);
      }else {
        console.log('serverCur',data);
        socketMap[socket.clientNum + 1].emit('cur',data);
      }
    })
    io.on('disconnect',function(){

    })
  });
}
