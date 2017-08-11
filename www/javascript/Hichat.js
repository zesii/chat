/**
 * Created by zes on 2017/3/29.
 */
window.onload = function(){
    var hichat = new HiChat();
    hichat.init();
};



var HiChat = function(){
    this.socket = null;
};

HiChat.prototype = {
    init:function(){

        var that = this;
        var userpicId = null;
        var nickName = null;
        var users = null;
        this.socket = io.connect();
        this.socket.on('connect',function(){
            document.getElementById('info').textContent = 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
            document.getElementById('loginBtn').addEventListener('click',function(){
                nickName = document.getElementById('nicknameInput').value;
                if(!nickName){
                    alert('get yourself a nickName');
                    return false;
                }
                if(!userpicId){
                    alert("choose a picture :)");
                    return false;
                }

                if(nickName.trim().length !=0){
                    that.socket.emit('login',nickName,userpicId);

                }else{
                    document.getElementById('nicknameInput').focus();
                };
            },false);
        });
        //绑定用户图片点击事件
        $('#userpic').delegate("span","click",function(event){

            $(this).addClass("highlight").siblings().removeClass("highlight");
            userpicId = $(this)[0].id;
            event.stopPropagation();

        })
        //用户名已经存在了
        this.socket.on('nickExisted',function(){
            document.getElementById('info').textContent = '!nickname is taken, chooes another pls';
        });
        //成功登陆
        this.socket.on('loginSuccess',function(nickname){
            //document.title = 'hichat | '+document.getElementById('nicknameInput').value;
            document.title = 'CHATchat | '+ nickname;
            document.getElementById('loginWrapper').style.display='none';
            document.getElementById('messageInput').focus();
        });
        //显示当前用户
        this.socket.on('system',function(nickname,usersOnLine,type){
            //alert(nickname+usersOnLine+type);
            var msg = nickname +(type == 'login'?' joined':' left');
            users = usersOnLine;
            var userCount = usersOnLine.length;
            that._displayNewMsg('system',msg,'red');
            $('#status').text(userCount+(userCount>1?' users':' user')+' online');
            var $userOnline = $('#userOnLine')
            $userOnline.html("");
            for(var i=0;i<usersOnLine.length;i++){
                var userInfo = usersOnLine[i].split('&');
                var userName = userInfo[0];
                var userPic = userInfo[1];
                //console.log(userName);
                var child = $('<div><img src="content/userpic/'+userPic+'.jpg" title="'+userName+'" /><p>'+userName+'</p></div>');
                $userOnline.append(child);
            }
            $userOnline.append('<span id="others">.....</span>')


        });
        //绑定鼠标移入移除事件
        $('#status').click(function(){
            $("#userOnLine").toggle();

        })

        document.getElementById('sendBtn').addEventListener('click',function(){
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            messageInput.value = "";
            messageInput.focus();
            if(msg.trim().length !=0){
                //console.log(userpicId);
                that.socket.emit('postMsg/',msg,color,userpicId);
                that._displayNewMsg('me',msg,color,userpicId);
            };
        },false);
        this.socket.on('newMsg',function(user,msg,color,userpicId){

            that._displayNewMsg(user,msg,color,userpicId);
        })
        document.getElementById('sendImage').addEventListener('change',function(){

            if(this.files.length != 0){
                var file = this.files[0],
                    reader = new FileReader();
                if(!reader){
                    that._displayNewMsg('system','your browser does not support fileReader','red');
                    this.value = '';
                    return;
                };
                reader.onload = function(e){
                    this.value = '';
                    that.socket.emit('img', e.target.result,userpicId);
                    that._displayImage('me', e.target.result,userpicId);//将图片显示在自己的屏幕
                };
                reader.readAsDataURL(file);
            }

        },false);
        this.socket.on('newImg',function(user,img,userpicId){
            //console.log(userpicId);
            that._displayImage(user,img,userpicId);
        });
        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click',function(e){
            var emojiwrapper = document.getElementById('emojiWrapper');
            var emojiState = document.defaultView.getComputedStyle(emojiwrapper).display;
            console.log(emojiState);
            if(emojiState=='none'){
                emojiwrapper.style.display = 'block';
            }else if(emojiState=='block'){
                emojiwrapper.style.display = 'none';
            }
            e.stopPropagation();
        },false);


        document.body.addEventListener('click',function(e){
            var emojiwrapper = document.getElementById('emojiWrapper');
            var pollInput = document.getElementById('pollInput');
            var poll = document.getElementById('poll');
            if(e.target != emojiwrapper){
                emojiwrapper.style.display = 'none';
            }
            var flag;

            //if((e.target != pollInput)&&(e.target !=poll)&&flag){
            //    $(pollInput).hide();
            //}

        })
        //处理被点击的表情->事件代理
        document.getElementById('emojiWrapper').addEventListener('click',function(e){

            var target = e.target;
            if(target.nodeName.toLowerCase() == 'img'){
                var messageInput = document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value+'[emoji:'+target.title+']';
            };
        },false);
        //支持按键操作
        document.getElementById('nicknameInput').addEventListener('keyup',function(e){
            if(e.keyCode == 13){
                var nickName = document.getElementById('nicknameInput').value;
                if(nickName.trim().length !=0 && userpicId){
                    that.socket.emit('login',nickName,userpicId);
                };
            };
        },false);
        //发送消息的按键操作
        document.getElementById('messageInput').addEventListener('keyup',function(e){
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            if(e.keyCode==13 && msg.trim().length !=0){
                messageInput.value ='';
                that.socket.emit('postMsg',msg,color,userpicId);
                that._displayNewMsg('me',msg,color,userpicId);
            };
        },false);
        //支持用户上传图片的操作
        document.getElementById('loadpic').addEventListener('click',function(){
            document.getElementById('nickWrapper').style.display = "none";
            document.getElementById("userpic").style.display = "none";
            document.getElementById('loadUserPic').style.display = "block";
            document.getElementById('loginBtn').style.display = 'none';
        })

        document.getElementById('submitUserPic').addEventListener('click',function(event){
            event.preventDefault();
            var name = document.getElementById('uniNickname').value;
                name = name.trim();
            if(name==""){
                alert("please enter the nickName");
                return false;
            }else{
                //$("#userpicForm").submit();
                var file = document.getElementById('imgToLoad');
                var formData = new FormData();
                formData.append('file',file.files[0]);
                formData.append('username',name);
                $.ajax({
                    url:'/',
                    type:'POST',
                    data:formData,
                    cache:false,
                    contentType:false,
                    processData:false,
                    success:function(data){
                        var info = data.split(" ");
                        var status = info[0];
                        var pic = info[1];
                        //console.log(status,pic);
                        if(status=='ok'){
                            alert("上传成功");
                            $('#selfPicLogin')[0].style.display = 'block';
                            $('#selfPicLogin')[0].picId = pic;
                            userpicId = pic;

                        }
                        if(data == 'nameTaken'){
                            alert("the name is taken, please take another one :)");
                        }
                    },
                    error:function(){
                        alert("上传失败");
                    }
                })

            }

        })

        $('#selfPicLogin').click(function(){
            var nickName = document.getElementById('uniNickname').value;
            var userpicId = this.picId;

            //console.log(userpicId);
            that.socket.emit('login',nickName,userpicId);
        })

        //实时显示上传头像部分
        $("#imgToLoad").change(function(){
            var objUrl = getObjectURL(this.files[0]) ;
            //console.log("objUrl = "+objUrl) ;
            if (objUrl) {
                $("#img0").attr("src", objUrl) ;

            }
        });

        function getObjectURL(file) {
            var url = null ;
            if (window.createObjectURL!=undefined) { // basic
                url = window.createObjectURL(file) ;
            } else if (window.URL!=undefined) { // mozilla(firefox)
                url = window.URL.createObjectURL(file) ;
            } else if (window.webkitURL!=undefined) { // webkit or chrome
                url = window.webkitURL.createObjectURL(file) ;
            }
            return url ;
        }
        //登录返回原界面
        document.getElementById('returnSystem').addEventListener('click',function(){
            var system = document.getElementById('nickWrapper');
            var self = document.getElementById('loadUserPic');
            var systemPic = document.getElementById('userpic');
            var btn = document.getElementById('loginBtn');
            self.style.display = 'none';
            system.style.display = 'block';
            systemPic.style.display = 'block';
            btn.style.display = 'block';

        })


        //clear清理屏幕操作
        $('#clearBtn').click(function(){
            if(confirm('do you want to clear the message?')){
                $('#historyMsg').empty();
            }

        })

        //支持投票操作
        var pollEx = false;//判断是否发起了投票
        $('#poll').click(function(){

            if(pollEx){
                $('#pollInput').hide();
                $('#pollShow').toggle();
            }else{
                $('#pollShow').hide();
                $('#pollInput').toggle();
            }
        })

        //投票操作的添加选项功能
        var choices = [];

        document.getElementById('addPollChoices').addEventListener('click',function(){
            var choiceList = document.createElement('ul');
            var showChoice = document.getElementById('showChoice');
            showChoice.appendChild(choiceList);
            var choiceInput = document.getElementById('pollChoices');
            var choice = choiceInput.value.trim();
            if(!choice){
                return false;
            }
            if(choices.indexOf(choice)!=-1){
                alert('You have already add this choice :)')
            }else{
                //alert('add successfully :)');
                choices.push(choice);
                var choiceElement = document.createElement('li');
                choiceElement.innerHTML  = '<span>'+choice+'</span>'+'<a class="removeChoice" href="#">delete</a>';

                choiceList.appendChild(choiceElement)
            }
            choiceInput.value="";
        })
        //删除选项
        document.getElementById('showChoice').addEventListener('click',function(e){
            var target = e.target;
            if(target.className == 'removeChoice'){
                var parentNode = target.parentNode;
                var deleteChoice = parentNode.getElementsByTagName('span')[0].innerText;
                var index = choices.indexOf(deleteChoice);
                if(index != -1){
                    choices.splice(index,1);
                }
                target.parentNode.parentNode.removeChild(target.parentNode);

            };
        })


        document.getElementById('submitPoll').addEventListener('click',function(){

            var theme = document.getElementById('pollTheme').value;
            if(theme==""){
                alert('please enter the theme');
            }else{
                var pollChoices = choices;
                choices = [];
                that.socket.emit('pollChoices',pollChoices,theme,nickName);//发起一个投票
                pollEx = true;
                document.getElementById('pollInput').style.display = 'none';
            }




        })
        this.socket.on('newPoll',function(choices,theme,userName){
            //alert(choices);
            //alert(theme);
            //alert(nickName == userName);
            pollEx = true;
            that._displayNewMsg('system','A new poll from '+userName,'orange');
            document.getElementById('pollShow').style.display = 'block';
            if(nickName==userName){//发起者自己
                that._showPoll(choices,theme,true);
            }else{
                that._showPoll(choices,theme);
            }



        });
        //处理点击投票选项
        //document.getElementById('pollResult').addEventListener('click',function handle(e){
        //    var theme = document.getElementById('theme').innerText;
        //
        //    var target = e.target;
        //    if(target.nodeName.toLowerCase() == 'a'){
        //        alert("thank your for polling :)")
        //        var choiceId = target.parentNode.id;
        //        that.socket.emit('pollSomeChoice',choiceId,theme);
        //        //that._showResult(choiceId,theme);
        //        //禁止再次投票
        //        document.getElementById('pollResult').removeEventListener('click',handle);
        //    }
        //})
        document.getElementById('pollResult').addEventListener('click',function handle(e){
            var theme = document.getElementById('theme').innerText;

            var target = e.target;
            if(target.nodeName.toLowerCase() == 'a'){
                alert("thank your for polling :)")
                var choiceId = target.parentNode.id;
                that.socket.emit('pollSomeChoice',choiceId,theme);
                //that._showResult(choiceId,theme);
                //禁止再次投票
                document.getElementById('pollResult').removeEventListener('click',handle);
            }
        })






        this.socket.on('newResult',function(theme,arr){

            that._showNewResult(theme,arr);

        })


        //处理关闭投票的情况
        document.getElementById('deletePoll').addEventListener('click',function(){
            var cm =  confirm('are you sure?');
            if(cm){
                that.socket.emit('deletePoll',nickName);
            }



        })
        this.socket.on('deletePoll',function(userName){
            that._displayNewMsg('system','The poll was closed by '+userName,'orange')
            choices = [];
            pollEx = false;
            document.getElementById('deletePoll').style.display = 'none';
            //删除投票显示部分
            var parentNode = document.getElementById('pollResult');
            parentNode.innerHTML=""
            //删除投票发起部分
            document.getElementById('pollTheme').value="";
            document.getElementById('showChoice').innerHTML="";
            document.getElementById('pollResult').addEventListener('click',function handle(e){
                var theme = document.getElementById('theme').innerText;

                var target = e.target;
                if(target.nodeName.toLowerCase() == 'a'){
                    alert("thank your for polling :)")
                    var choiceId = target.parentNode.id;
                    that.socket.emit('pollSomeChoice',choiceId,theme);
                    //that._showResult(choiceId,theme);
                    //禁止再次投票
                    document.getElementById('pollResult').removeEventListener('click',handle);
                }
            })
            document.getElementById('pollShow').style.display = 'none';


        })



    },










    //实时显示投票结果
    _showNewResult:function(theme,arr){

        //document.getElementById('pollShow').style.display = 'block'
        var colors = ['red','orange','yellow','green','blue','purple'];
        var themeNode= document.getElementById('theme');
        if((themeNode.innerText)!=theme){
            return false;
        }
        var tableNode = document.getElementById('pollResult');
        var children = tableNode.childNodes;
        var totalPoll=0;
        for(var i=0;i<arr.length;i++){
            totalPoll +=arr[i];
        }
        for(var i=0;i<children.length;i++){
            var chlidrenNode=children[i].childNodes;
            if(arr[i] == undefined){
                arr[i] = 0;
            }
            var num = arr[i];
            var percent =((arr[i]/totalPoll)*100).toFixed(2);
            var content = arr[i]+'('+((arr[i]/totalPoll)*100).toFixed(2)+'%)';
            //chlidrenNode[2].style.backgroundColor = 'yellow';
            chlidrenNode[2].style.fontSize = '14px';
            chlidrenNode[2].innerText = content;

            chlidrenNode[1].style.fontSize = '14px';
            chlidrenNode[1].innerHTML='<div id="div'+i+'">　'+'</div>';

            var div = document.getElementById('div'+i);
            div.style.width = parseInt(percent)*3.5+'px';
            if(arr[i]>0){
                var j=i;
                while(j>=colors.length){
                    j = j%colors.length;
                }
                div.style.backgroundColor = colors[j];
                div.style.borderRadius="3px";
            }else{
                div.style.backgroundColor = 'transparent';
            }

        }





    },
    //显示投票内容
    _showPoll:function(choices,theme,boolVal){
        var parentNode = document.getElementById('pollShow');
        var pollTheme = document.getElementById('theme');
        pollTheme.innerText = theme;
        var table = document.getElementById('pollResult');
        for(var i=0;i<choices.length;i++){
            var choice = document.createElement('tr');
            var choiceTd = document.createElement('td');
            choiceTd.id = i;
            choiceTd.innerHTML = '<a href="#">'+choices[i]+'</a>';
            var choicePercentShow = document.createElement('td');
            var choicePercnetTd = document.createElement('td');
            choicePercnetTd.id = '%'+choices[i];
            choice.appendChild(choiceTd);
            choice.append(choicePercentShow);
            choice.appendChild(choicePercnetTd);
            table.appendChild(choice);
        }

        //发起者的显示内容
        if(boolVal){
            var btn = document.getElementById('deletePoll');
            btn.style.display='block';

        }

    },

    _displayNewMsg:function(user,msg,color,userpicId){
        //console.log(userpicId);
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('div'),
            dialog = document.createElement('div'),
            //dialogContent = document.createElement('div'),//内容部分
            timeUser = document.createElement('span'),
            date = new Date().toTimeString().substr(0,8),
            msg = this._showEmoji(msg);
        timeUser.innerHTML=user+"("+date+")";
        timeUser.id = "timespan";
        if(userpicId){
            //alert(userpicId);s
            var userPic = document.createElement('img');
            userPic.className+='userpicChat';
            userPic.src = 'content/userpic/'+userpicId+'.jpg';
        }
        msgToDisplay.style.color = color || '#000';
        //自己发送的消息显示
        if(user =='me'){
            msgToDisplay.className = 'meDialog';
            dialog.innerHTML = msg;
            msgToDisplay.appendChild(userPic);
            msgToDisplay.appendChild(timeUser);
            msgToDisplay.appendChild(dialog);
        }else{
            if(user =='system'){
                //console.log("system in")
                msgToDisplay.className='systemDialog';
                dialog.innerHTML = msg;
                msgToDisplay.append(dialog)
            }else{
                msgToDisplay.className ='otherDialog';
                dialog.innerHTML = msg;
                msgToDisplay.appendChild(userPic);
                msgToDisplay.appendChild(timeUser);
                msgToDisplay.appendChild(dialog);
            }


        }
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _displayImage:function(user,imgData,userpicId){
        //var container = document.getElementById('historyMsg'),
        //    msgToDisplay = document.createElement('p'),
        //    date = new Date().toTimeString().substr(0,8);
        //msgToDisplay.style.color = color || '#000';
        //if(user=='me'){
        //    msgToDisplay.className+='mepic';
        //}
        //msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        //container.appendChild(msgToDisplay);
        //container.scrollTop = container.scrollHeight;
        //console.log(userpicId);
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('div'),
            dialog = document.createElement('div'),
        //dialogContent = document.createElement('div'),//内容部分
            timeUser = document.createElement('span'),
            date = new Date().toTimeString().substr(0,8),
            msg = '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        timeUser.innerHTML=user+"("+date+")";
        timeUser.id = "timespan";
        if(userpicId){
            //alert(userpicId);s
            var userPic = document.createElement('img');
            userPic.className+='userpicChat';
            userPic.src = 'content/userpic/'+userpicId+'.jpg';
        }
        //msgToDisplay.style.color = color || '#000';
        //自己发送的消息显示
        if(user =='me'){
            msgToDisplay.className = 'meDialog';
            dialog.innerHTML = msg;
            msgToDisplay.appendChild(userPic);
            msgToDisplay.appendChild(timeUser);
            msgToDisplay.appendChild(dialog);
        }else{
            if(user =='system'){
                //console.log("system in")
                msgToDisplay.className='systemDialog';
                dialog.innerHTML = msg;
                msgToDisplay.append(dialog)
            }else{
                msgToDisplay.className ='otherDialog';
                dialog.innerHTML = msg;
                msgToDisplay.appendChild(userPic);
                msgToDisplay.appendChild(timeUser);
                msgToDisplay.appendChild(dialog);
            }


        }
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _initialEmoji:function(){
        var emojiContainer = document.getElementById('emojiWrapper'),
            docFragment = document.createDocumentFragment();
        for(var i =69;i>0;i--){
            var emojiItem = document.createElement('img');
            emojiItem.src='../content/emoji/'+i+'.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        };
        emojiContainer.appendChild(docFragment);

    },
    _showEmoji:function(msg){
        var match,result=msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while(match=reg.exec(msg)){
            emojiIndex = match[0].slice(7,-1);
            if(emojiIndex>totalEmojiNum){
                result= result.replace(match[0],'[X]');
            }else{
                result = result.replace(match[0],'<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');

            };
        };
        return result;
    }




}