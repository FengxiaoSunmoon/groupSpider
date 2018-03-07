var socket = io('ws://localhost:8080');
socket.on('waiting',function(data){
  document.getElementById('waiting').innerHTML = data;
})
socket.on('start', function (data) {
  var local = new Local(socket);
  var remote = new Remote(socket);
});
