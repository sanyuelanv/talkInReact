var io = require('socket.io')()
var redis = require('redis');

var roomInfo = {}
var roomID = ''
io.on('connection',function(socket){
  roomID = socket.handshake.query.id
  var pub = redis.createClient()
  var sub = redis.createClient()
  var user = ''
  socket.on('join',function(userName){
    user = {
      name:userName,
      id:socket.id,
    }
    // 如果房间为空，就创建一个以房间ID为命名的数组。把usernamepush进去。
    if (!roomInfo[roomID]) {roomInfo[roomID] = []}
    roomInfo[roomID].push(user)
    // 加入房间
    socket.join(roomID)
    // 订阅
    sub.subscribe(roomID)
    let msg = {
      type:"system",
      content:user.name + '加入了房间'+roomID + "。房间人数："+roomInfo[roomID].length,
      name:user.name,
    }
    pub.publish(roomID,JSON.stringify(msg))
    // 广播：全房间内部，包括当前客户端
    // io.to(roomID).emit('system',user.name + '加入了房间'+roomID + "。房间人数："+roomInfo[roomID].length)
  })
  socket.on("disconnect",function(){
    var index = roomInfo[roomID].indexOf(user)
    if (index !== -1) {roomInfo[roomID].splice(index, 1)}
    socket.leave(roomID)
  })
  socket.on("talk",function(content,name){
    let msg = {
      type:"talk",
      content:content,
      name:name,
    }
    pub.publish(roomID,JSON.stringify(msg))
    // 广播：全房间内部，不包括当前客户端
    // socket.broadcast.to(roomID).emit('talk',content,name)
  })
  //客户端发起断开连接请求！
  socket.on("leave",function(){
    socket.emit('disconnect')
  })

  sub.on("subscribe", function (channel, count) {
    console.log(' subscribe: ' + channel);
  });

  sub.on("message",function(channel,message){
    let msg = JSON.parse(message)
    let {type,content,name} = msg

    switch(type){
      case "system":
        io.to(channel).emit(type,content)
        console.log("system");
        break;
      case "talk":
        console.log("talk");
        socket.broadcast.to(channel).emit(type,content,name)
        break;
    }
  })
})

io.listen(8080)
