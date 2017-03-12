var io = require('socket.io')()
var roomInfo = {}
io.on('connection',function(socket){
  var roomID = socket.handshake.query.id
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
    // 广播：全房间内部，包括当前客户端
    io.to(roomID).emit('system',user.name + '加入了房间'+roomID + "。房间人数："+roomInfo[roomID].length)
  })
  socket.on("disconnect",function(){
    var index = roomInfo[roomID].indexOf(user)
    if (index !== -1) {roomInfo[roomID].splice(index, 1)}
    socket.leave(roomID)
  })
  socket.on("talk",function(content,name){
    // 广播：全房间内部，不包括当前客户端
    socket.broadcast.to(roomID).emit('talk',content,name)
  })
  //客户端发起断开连接请求！
  socket.on("leave",function(){
    socket.emit('disconnect')
  })
})
io.listen(8080)
