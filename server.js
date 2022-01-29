const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { 
    cors:{ 
        origin: "http://localhost:3000",
        methods: ["GET","POST"]
}});



let count = 0;
io.on("connection", (socket) => {
    socket.emit("is-connected",true);
    socket.on("join-room",(room)=>{
        socket.join(room);
        console.log("socket.id: ",socket.id);
    })
    socket.on("leave-room",(room)=>{
        console.log("left room id: ",room);
        socket.leave(room);
    })
    socket.on("sent",(current_room, data)=>{
        console.log("count: ", count++);
        console.log("socket.id: ",socket.id, "roooms: ", socket.adapter.rooms, " current room",current_room);

        socket.to(current_room).emit("receive-message",data)
    })
    socket.on("check-rooms",()=>{
        console.log("socket.id: ",socket.id, "roooms: ", socket.adapter.rooms,"the room: ", socket.rooms);
    })
    socket.on("disconnecting", () => {
        console.log("disconnecting",socket.rooms); // the Set contains at least the socket ID
      });
      socket.on("disconnect", () => {
        // socket.rooms.size === 0
        console.log("disconnected")
      });
    console.log("connected: ",socket.id);
});

httpServer.listen(5000);




// const io = require("socket.io")(5000,{
//     cors:{ 
//         origin: "http://localhost:3000",
//         methods: ["GET","POST"]
//     }
// })

// io.on("connection", socket=>{
   
// })

