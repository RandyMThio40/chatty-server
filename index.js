const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const cors = require('cors');
const axios = require("axios")
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

const ping = async () => {
    console.log("ping")
    try{
        const res = await axios.get("https://glistening-marzipan-f601c4.netlify.app");
        console.log("data: ",res);
        
    } catch(err){
        console.error(err);
    }

}

app.get("/",(req,res)=>{

    ping()
    res.send({words:"hello world"});
})


app.get("/home",(req,res)=>{
    console.log("home");
    res.status(200).send({data:"it works"})
})

const doesImgExist = async (url) => {

    try{
        const res = await axios.get(url,{responseType:'arraybuffer'});
        if(res.status == 200){
            return res.data;
        }

    }catch(err){
        console.log("error: ", err);
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

io.on("connection", (socket) => {
    socket.emit("is-connected",true);
    socket.on("join-room",(room)=>{
        socket.join(room);
    })
    socket.on("leave-room",(room)=>{
        socket.leave(room);
    })
    socket.on("sent",(current_room, data)=>{
        socket.to(current_room).emit("receive-message",data)
    })
    socket.on("remove-message",(current_room,obj)=>{
        socket.to(current_room).emit("delete-message",obj);
    })
    socket.on("disconnecting", () => {
        console.log("disconnecting"); // the Set contains at least the socket ID
    });
    socket.on("disconnect", () => {
        console.log("disconnected")
    });
});

httpServer.listen( process.env.PORT  || 5000);


module.exports = app;


