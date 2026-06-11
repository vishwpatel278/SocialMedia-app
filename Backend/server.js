const express = require('express');
const app = express();
const db = require('./db');
const {jwtAuthMiddleWareforAdmin,jwtAuthMiddleWare,generateToken} = require('./jwt');
const path = require("path");

const http = require("http");
const { Server } = require("socket.io");


const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:"http://localhost:5173",
        credentials:true
    }
});

app.set("io",io);

io.on("connection",(socket)=>{

    console.log(
        "User Connected:",
        socket.id
    );

    socket.on(
        "join-post",
        (postId)=>{
            socket.join(postId);
        }
    );

    socket.on(
        "disconnect",
        ()=>{
            console.log(
                "Disconnected:",
                socket.id
            );
        }
    );

    socket.on(
        "leave-post",
        (postId) => {
            socket.leave(postId);
        }
    );
    socket.on("error", (err) => {
        console.log("Socket Error:", err);
    });

    
});

require('dotenv').config();

const cookieParser = require("cookie-parser");

const bodyparser = require('body-parser');

app.use(bodyparser.json());

const cors = require("cors");

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// app.use(passport.initialize());

const userRoutes = require('./routes/UserRoutes.js');
const profileRoutes = require('./routes/ProfileRoutes.js')
const postRoutes = require('./routes/PostRoutes.js')
const homeRoutes = require('./routes/HomeRoute.js')
const { router: searchRoutes } = require('./routes/SearchRoutes');

app.use('/user',userRoutes);
app.use('/profile',jwtAuthMiddleWare,profileRoutes);
app.use('/post',jwtAuthMiddleWare,postRoutes);
app.use('/home',jwtAuthMiddleWare,homeRoutes);
app.use('/search',jwtAuthMiddleWare,searchRoutes);

const port = process.env.PORT;

// app.listen(port);
server.listen(port);