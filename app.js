var express = require('express');
var fs = require('fs');
var https = require('https');
var socketIO = require('socket.io');
var os = require('os');
var nodeStatic = require('node-static');
var mysql = require('mysql');
var app = express();
var arrayList = require('arraylist')
var url = require('url');
const session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var ffmpeg = require('fluent-ffmpeg');
var command = ffmpeg();
var roomList= arrayList();

app.set('view engine', 'ejs');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: "fyp"
});

connection.connect(function(error){
    if(!!error){
        console.log('Error');
    } else {
        console.log('Connected Database');
    }
});



var httpsOptions = {
    key: fs.readFileSync('./static/server-key.pem'),
    ca: [fs.readFileSync('./static/cert.pem')],
    cert: fs.readFileSync('./static/server-cert.pem')
}
var fileServer = new(nodeStatic.Server)();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600 * 1000  // 1 hour
    }
}));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static('./'));
app.all('/main', function (req, res) {
    console.log("Ask / "+ req.session.loggedin);
    if(!req.session.loggedin){
        res.sendFile('views/login.html',{root:__dirname});
    }else{
        res.render('selection',{room : req.session.usernumber});
    }
})
app.get('/call', function (req, res) {
    if(req.session.loggedin){
        res.render('CallPage',{room : req.session.usernumber});
    }else{
        res.sendFile('views/login.html',{root:__dirname});
    }

})
app.get('/display', function (req, res) {
    if(req.session.loggedin){
        res.render('display',{room : req.session.usernumber});
    }else{
        res.sendFile('views/login.html',{root: __dirname});
    }

})
app.get('/a', function (req, res) {
     if (req.session.views) {
        req.session.views++
            res.setHeader('Content-Type', 'text/html')
        res.write('<p>views: ' + req.session.views + '</p>')
        res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
        res.end('welcome to the session demo. refresh!')
     }
    else {
        req.session.views = 1
        res.end('welcome to the session demo. refresh!')
      }

})

app.post('/getRecord', function (req, res) {
    if (req.session.loggedin) {
        var sql = `SELECT * FROM video_record WHERE video_owner ='${req.session.usernumber}'`;
        console.log(sql);
        res.setHeader('Content-type', 'application/json');
        connection.query(sql, function (err, result) {
            if (err) throw err;
            
            if (result.length != 0) {
             
                res.end(JSON.stringify(result));
                
            }
                
        });
            
    }
    
            else{
                res.end()
            } 

})


app.post('/check', function (req, res) {
    console.log("123")
    res.setHeader('Content-type', 'application/json');
    let data ;
    if (req.session.loggedin) {
        
         data = {

            result: "yes",
            usernumber: req.session.usernumber
        }

    } else {
        data = {

            result: "no",

        }

    }
    res.end(JSON.stringify(data));
});

app.post('/login', function (req, res) {
    var usernumber = req.body.usernumber;
    var password = req.body.password;
    res.setHeader('Content-Type', 'text/html');


    connection.query(`SELECT * FROM user WHERE user_number = '${usernumber}'  AND user_password = '${password}'`, function (err, result, fields) {
        if (err) throw err;
        if (result.length != 0) {

            req.session.loggedin = true;
            req.session.usernumber = usernumber;
            res.render('selection',{user:usernumber});
        } else {
            res.write('<p>wrong</p>');
            res.write(`<a href="https://localhost:8080/">back</a>`);
            res.end();
        }
    });



})

app.post('/upload', function (req, res) {
    uploadFile(req, res);
}) 
app.post('/logout', function (req, res) {
    if(req.session.loggedin){
        req.session.destroy();
        res.sendFile('/views/login.html',{root:__dirname});
    }
})
app.post('/friendList', function (req, res) {
    
    res.setHeader('Content-type', 'application/json');
    var sql = `SELECT * FROM friend_list WHERE user1 = ${req.session.usernumber}  `

    
        connection.query(sql, function (err, result, fields) {
        if (err) throw err;
        
            for(i = 0 ; i< result.length ; i++ ){
                for(j = 0 ; j <roomList.size() ; j++){
                    var roomees = roomList.get(j);
                    console.log("Check Status :"+roomees.roomName)
                    if(result[i].user2 == roomees.roomName){
                        result[i].status = "online";
                            break;
                    }else{
                        result[i].status = "offline";
                    }          
                }
                if(roomList.size()==0)
                    result[i].status = "offline";
            }
            
            
        console.log("friendList",result);
        res.end(JSON.stringify(result));
            
        });
    
});
app.post('/callRecord', function (req, res) {
    if(req.session.loggedin){
        
    }else{
        res.sendFile('views/login.html',{root: __dirname});
        return;
    }
    res.setHeader('Content-type', 'application/json');
    var sql = `SELECT * FROM video_record WHERE video_owner = ${req.session.usernumber} OR video_peer = ${req.session.usernumber}`;
    
        connection.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log("callRecord",result);
        res.end(JSON.stringify(result));
    });
});
app.post('/viewVideo', function (req, res) {
    if(req.session.loggedin){
        res.render('record',{videoId : req.body.videoId});
    }else{
        res.sendFile('views/login.html',{root: __dirname});
    }
});
var app = https.createServer(httpsOptions, app).listen(8080, function () {
    console.log("opened")
});

function uploadFile(request, response) {
    // parse a file upload
    var mime = require('mime');
    var formidable = require('formidable');
    var util = require('util');
    var form = new formidable.IncomingForm();
    var dir = !!process.platform.match(/^win/) ? '\\uploads\\' : '/uploads/';

    form.uploadDir = __dirname + dir;
    form.keepExtensions = true;
    form.maxFieldsSize = 1000 * 1024 * 1024;
    form.maxFields = 1000;
    form.multiples = false;

    form.parse(request, function (err, fields, files) {
        
        fs.rename(files['video-blob'].path, form.uploadDir + "/" + files['video-blob'].name, (err) => {

            if (err) throw err;
            
            var file = util.inspect(files)        
            
  
    response.end("success");
    
        });

    });

}



var io = socketIO.listen(app);

io.sockets.on('connection', function (socket) {
    console.log('someone connected');



    function log() {
        var array = ['Message from server:'];
        array.push.apply(array, arguments);
        socket.emit('log', array);
    }



    socket.on('message', function (message, roomOj) {
        //    socket.broadcast.emit('message', message,roomOj);
        socket.broadcast.to(roomOj.ownRoom).emit('message', message);
        log('Client : ', message);
        // for a real app, would be room-only (not broadcast)

    });

    socket.on('readyToStrat', function (room) {

        socket.broadcast.to(room.ownRoom).emit('strats', room);

    });

    socket.on('confirm', function (room) {

        socket.broadcast.to(room.peerRoom).emit('resquestConnect', room);
        //  io.sockets.in("123").emit('receiveOffer', room);
    });

    socket.on('accepted', function (room) {

        console.log('try to connect: ', room);
        socket.broadcast.to(room.ownRoom).emit('acceptedConnect', room);
        socket.broadcast.to(room.peerDisplayRoom).emit('receiveOffer', room);
        //  io.sockets.in("123").emit('receiveOffer', room);
    });

    socket.on('unAccepted', function (room) {
        socket.broadcast.to(room.ownRoom).emit('unAcceptedConnect', room);
        //  io.sockets.in("123").emit('receiveOffer', room);
    });
    
    
    socket.on('uploadRecord', function (recordDetail) {
        
        command = ffmpeg( __dirname + '/uploads/' + recordDetail.videoId + ".webm" )
            .audioCodec('libvorbis')
            .videoCodec('h264_videotoolbox')
            .format('mp4')

        command.clone()
            .save(__dirname  + '/uploads/' + recordDetail.videoId + ".webm");
        
        
        var sql = "INSERT INTO `video_record`(`video_record_id`, `video_owner`, `video_peer`, `video_record_timestamp_start`, `video_length`) VALUES " +`('${recordDetail.videoId}.mp4','${recordDetail.owner}','${recordDetail.peer}','${recordDetail.startTime}','${recordDetail.length}')`;
  
        
        connection.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");

        });
        
        socket.broadcast.to(recordDetail.owner).emit("reload");
 
    });





    socket.on('connectSomeOne', function (room) {
        console.log('try to connect: ', room);
        socket.broadcast.to(room.peerDisplayRoom).emit('receiveOffer', room);
        //  io.sockets.in("123").emit('receiveOffer', room);
    });

    socket.on('changeRoom', function (room) {
        console.log("leave Room！！");
        socket.leaveAll();

    });

    socket.on('peerStrat', function (room) {
        if (room.role == null) {
            socket.broadcast.to(room.peerRoom).emit('peerDisplay', room); // for peer collect Display room
        }

    });

    socket.on('create or join', function (room) {
        log('Received request to create or join room ' + room);
        var roomDetail = {
            "socketId" : socket.id,
            "roomName" : room
        }
        var clientsInRoom = io.sockets.adapter.rooms[room];
        roomList.push(roomDetail);
        console.log(roomList)
        var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
        log('Room ' + room + ' now has ' + numClients + ' client(s)');
        console.log('numClients', numClients);

        if (numClients === 0) {
            socket.join(room);
            log('Client ID ' + socket.id + ' created room ' + room);
            socket.emit('created', room, socket.id);
            socket.emit('role', 'offer');

        } else if (numClients === 1) {
            log('Client ID ' + socket.id + ' joined room ' + room);
            io.sockets.in(room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room, socket.id);
            io.sockets.in(room).emit('ready');
            socket.emit('role', 'receiver');
        } else { // max two clients
            socket.emit('full', room);
        }

    });

    socket.on('ipaddr', function () {
        var ifaces = os.networkInterfaces();
        for (var dev in ifaces) {
            ifaces[dev].forEach(function (details) {
                if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
                    socket.emit('ipaddr', details.address);
                }
            });
        }
    });

    socket.on('bye', function () {
        console.log('received bye');
    });

    socket.on('cutline', function (room) {
        socket.broadcast.to(room.peerRoom).emit('cutline');
    });

    socket.on('newUser', function (room) {
        socket.broadcast.emit('newUser', {
            "room": room,
            "displayRoom": room + "Display"
        });
    });


    socket.on('changeStatus', function (room) {
        socket.broadcast.emit('changeStatus', room);

    });

    
    socket.on('client_data', function (data) {
        console.log(data.letter);
        socket.broadcast.emit('message', data.letter);

    });


    socket.on('sendToServer', function (message) {
        console.log('Client said: ' + message);
    });

    socket.on('sendToServer', function (message) {
        console.log('Client said: ' + message);
    });

    socket.on('disconnect', function (room) {
        console.log('discon');
        console.log(socket.id);

        for(i = 0 ; i < roomList.size(); i ++){
            var rooms = roomList.get(i);
            
            if(rooms.socketId == socket.id)
                roomList.remove(i);
                
        }
        console.log(roomList);
  
    });

    socket.on('resquest', function (room) {
        socket.broadcast.emit('receivce', room);
    });

});
