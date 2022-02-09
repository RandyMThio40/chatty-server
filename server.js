const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const cors = require('cors');
const { default: axios } = require("axios");
const io = new Server(httpServer, { 
    cors:{ 
        origin: "http://localhost:3000",
        methods: ["GET","POST"],
        credentials:true,

}});

app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET","POST"],
        credentials:true,
    })
)
app.use(express.json()); 

const doesImgExist = async (url) => {
    try{
        const res = await axios.get(url,{responseType:'arraybuffer'});
        if(res.status == 200){
            return res.data;
        }

    }catch(err){
        console.log("err1: ", err);
    }


}

app.post("/findImg",async(req,res)=>{
    console.log("req: ", req.body);
    let img_url = req.body?.url
    let data = await doesImgExist(img_url);
    if(data){
        res.json({
            buffer:data,
            status:1,
        })
    }
    else{
        res.json({
            status:0
        })
    }

})

app.listen(3001);

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

