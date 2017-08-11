var express = require('express'),

    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users =[];//�����û���ͷ��
var userNames = [];
app.use('/',express.static(__dirname+'/www'));
console.log("start");
server.listen(3000);
var choiceResult = [];
var userpicId = null;
io.on('connection',function(socket){
    //�����ǳ�
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
            io.sockets.emit('system',nickname,users,'login');//���������ӵĿͻ��˷��͵�ǰ�û��ǳ�
            /*��connection�¼��Ļص������У�
            socket��ʾ���ǵ�ǰ���ӵ����������Ǹ��ͻ��ˡ�
            ���Դ���socket.emit('foo')��ֻ���Լ��յõ�����¼���
            ��socket.broadcast.emit('foo')���ʾ����Լ���������˷��͸��¼���
            ���⣬��������У�io��ʾ����������socket���ӣ�
            ���Դ���io.sockets.emit('foo')��ʾ�����˶������յ����¼��� */
        };
    });
    //�û�����
    socket.on('disconnect',function(){
        users.splice(socket.userIndex,1);
        userNames.splice(socket.nickname,1);
        socket.broadcast.emit('system',socket.nickname,users,'logout');
    })
    //��������Ϣ
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

//����ͼƬ�ϴ�
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




