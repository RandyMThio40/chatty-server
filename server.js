const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const cors = require('cors');
const axios = require("axios");
const io = new Server(httpServer,{ 
    cors:{ 
        origin: ["http://localhost:3000","https://glistening-marzipan-f601c4.netlify.app"],
        methods: ["GET","POST"],
        credentials:true,
    }
});

app.use(
    cors({
        origin: ["http://localhost:3000","https://glistening-marzipan-f601c4.netlify.app"],
        methods: ["GET","POST"],
        credentials:true,
    })
)
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("sup bro")
})


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

app.get("/hello",(req,res)=>{
    res.send("hello");
})

// app.listen(3001);

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
        console.log("socket.id: ",socket.id, "roooms: ", socket.adapter.rooms, " current room",current_room);

        socket.to(current_room).emit("receive-message",data)
    })
    socket.on("check-rooms",()=>{
        console.log("socket.id: ",socket.id, "roooms: ", socket.adapter.rooms,"the room: ", socket.rooms);
    })
    socket.on("remove-message",(current_room,obj)=>{
        socket.to(current_room).emit("delete-message",obj);
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

httpServer.listen( process.env.PORT  || 5000);



