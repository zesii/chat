var express = require('express'),

    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users =[];//在线用户及头像
var userNames = [];
app.use('/',express.static(__dirname+'/www'));
console.log("start");
server.listen(3000);
var choiceResult = [];
var userpicId = null;
io.on('connection',function(socket){
    //设置昵称
    socket.on('login',function(nickname,userpicId){
        //console.log(nickname,userNames);
        if(userNames.indexOf(nickname)>-1){

            socket.emit('nickExisted');
        }else{
            socket.userIndex = users.length;
            socket.nickname = nickname;
            socket.userpicId = userpicId;
            userpicId = userpicId;
            users.push(nickname+'&'+userpicId);
            userNames.push(nickname);
            socket.emit('loginSuccess',nickname);
            io.sockets.emit('system',nickname,users,'login');//向所有连接的客户端发送当前用户昵称
            /*在connection事件的回调函数中，
            socket表示的是当前连接到服务器的那个客户端。
            所以代码socket.emit('foo')则只有自己收得到这个事件，
            而socket.broadcast.emit('foo')则表示向除自己外的所有人发送该事件，
            另外，上面代码中，io表示服务器整个socket连接，
            所以代码io.sockets.emit('foo')表示所有人都可以收到该事件。 */
        };
    });
    //用户离线
    socket.on('disconnect',function(){
        users.splice(socket.userIndex,1);
        userNames.splice(socket.nickname,1);
        socket.broadcast.emit('system',socket.nickname,users,'logout');
    })
    //接受新消息
    socket.on('postMsg',function(msg,color,userpicId){
        //console.log(userpicId);
        socket.broadcast.emit('newMsg',socket.nickname,msg,color,userpicId);
    })
    socket.on('img',function(imgDate,userpicId){
        console.log(userpicId);
        socket.broadcast.emit('newImg',socket.nickname,imgDate,userpicId);
    })
    socket.on('userPicDone',function(){
        show();
    })

    var initiator;
    socket.on('pollChoices',function(choices,theme,userName){
        //console.log(choiceResult);
        initiator = userName;
        var pollObj = {};
        pollObj.theme = theme;
        pollObj.result = [];
        choiceResult.push(pollObj);
       // console.log(choiceResult);
        io.sockets.emit('newPoll',choices,theme,userName);
    })

    socket.on('pollSomeChoice',function(choiceId,theme){
        var pollObj;
        for(var i=0;i<choiceResult.length;i++){
            if(choiceResult[i].theme==theme){
                pollObj=choiceResult[i];
            }
        }
        var arr = pollObj.result;
        if(!arr[choiceId]){
            arr[choiceId]=1;
        }else{
            arr[choiceId]++;
        }
        //console.log(arr);
        io.sockets.emit('newResult',theme,arr);

    })
    socket.on('deletePoll',function(nickName){
        choiceResult = [];
        io.sockets.emit('deletePoll',nickName);

    })






});

//处理图片上传
var formidable = require('formidable');
var fs = require('fs');
app.post('/',function(request,response){
    var form = new formidable.IncomingForm();
    form.uploadDir = '/LearningFile/CodeFile/myDemo/chatOnLinePlus/www/content/userpic';
    form.maxFieldSize = 512*512;
    form.parse(request,function(err,fields,files){
        var nickName = fields.username;
        if(userNames.indexOf(nickName)>-1){
            //console.log("name taken!")
            response.send('nameTaken');
        }else{

            if(err){
                throw err;
            }
            try{
                var date = new Date();
                var Name = nickName+date.getTime();
                fs.renameSync(files.file.path, "/LearningFile/CodeFile/myDemo/chatOnLinePlus/www/content/userpic/"+Name+".jpg");
            }catch(e){
                console.log(e);
            }
            //response.sendfile("views/uploadOk.html");
            response.send('ok '+Name);
        }


    })


})




