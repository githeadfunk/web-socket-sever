const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path')

var publicKey;

var filePath = path.join(__dirname, 'public_key.pem');

fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
  if (!err) {
      publicKey = data;
  } else {
      console.log(err);
  }
});

io
.use(function(socket, next){
  if (socket.handshake.query && socket.handshake.query.token){
    jwt.verify(socket.handshake.query.token, publicKey, {algorithms: ['RS256']}, function(err, decoded) {
      console.log('decoded: ', decoded);
      var valid = false;
      if(decoded){
        decoded.aud.forEach(element => {
          if(element == 'localhost:3000') valid = true;
          socket.decoded = decoded;
        });
      }
      if(!valid) return next(new Error('Authentication error'));
      else next();
    });
  } else {
      next(new Error('Authentication error'));
  }    
})
.on("connection", socket => {
  

  console.log("On connection");

  socket.on("doSomething", (data) => {
    console.log("data", data);
  });

  io.emit("documents", {action:'wyh'});
});

http.listen(3000);