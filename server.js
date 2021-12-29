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

io.on("connection", (socket) => {
    socket.emit("is-connected",true);
    socket.on("has-connected",(data)=>{
        console.log("data: ", data.user.uid);
        socket.emit("response","connected bitch");
    })

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

