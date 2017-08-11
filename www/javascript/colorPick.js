/**
 * Created by zes on 2017/6/24.
 */
/**
 * Created by zes on 2017/6/9.
 */

//��������������ʾ��

var c = document.getElementById('show');
var ctx1 = c.getContext('2d');
var gradient1 = drawColorsGradient(ctx1,0,0,400,400);
var my_gradient1 = gradient1('white','orange','black');
ctx1.fillStyle = my_gradient1;
ctx1.rect(0,0,400,400);
ctx1.fill();


var c2 = document.getElementById('pick');
var ctx2 = c2.getContext('2d');
var gradient2 = drawColorsGradient(ctx2,0,0,25,400);
var my_gradient2 = gradient2('red',"orange","yellow","green","cyan","blue","purple","red")
ctx2.fillStyle = my_gradient2;
ctx2.rect(0,0,25,400);
ctx2.fill();


//���Ӽ����¼�
c.addEventListener('click',function(e){

    var canvasLeftOffset = this.offsetLeft;
    var canvasTopOffset = this.offsetTop;
    var x = e.pageX-canvasLeftOffset;
    var y = e.pageY-canvasTopOffset;
    var colorArea = document.getElementById('showArea');
    colorArea.style.display = 'block';
    colorArea.style.top = e.pageY+"px"
    colorArea.style.left = e.pageX+"px";


    var colorData = ctx1.getImageData(x,y,1,1);
    //����rgb
    var red = colorData.data[0];
    var green = colorData.data[1];
    var blue = colorData.data[2];
    var redInput = document.getElementById('r');
    var greenInput = document.getElementById('g');
    var blueInput = document.getElementById('b');
    redInput.value = red;
    greenInput.value = green;
    blueInput.value = blue;
    //����hsl
    var hslArray = rgbToHsl(red,green,blue);
    var hInput = document.getElementById('h');
    var sInput = document.getElementById('s');
    var lInput = document.getElementById('l');
    hInput.value = hslArray[0];//.toFixed(3);
    sInput.value = hslArray[1];//.toFixed(3);
    lInput.value = hslArray[2];//.toFixed(3);

})

c2.addEventListener('click',function(e){
    clearPreviousValue();
    var canvasLeftOffset = this.offsetLeft;
    var canvasTopOffset = this.offsetTop;
    var x = e.pageX-canvasLeftOffset;
    var y = e.pageY-canvasTopOffset;

    var rgbArray = getColor(ctx2,x,y);
    var colorString = "rgb("+rgbArray[0]+","+rgbArray[1]+","+rgbArray[2]+")"
    drawGradient(ctx1,colorString);
})



//��������
//�����䱳��
function drawColorsGradient(ctx,x,y,width,height){
    return function(){
        var colors = Array.prototype.slice.call(arguments,arguments);
        var colorsLength = colors.length;
        var percent = 1/colorsLength;
        var gradient = ctx.createLinearGradient(x,y,width,height);
        for(var i=0;i<colorsLength-1;i++){
            gradient.addColorStop(percent*i,colors[i]);
        }
        gradient.addColorStop(1,colors[colors.length-1]);
        return gradient;
    }
}
//�û��õ���ɫ������
function drawGradient(ctx,color){
    var my_gradient = ctx.createLinearGradient(0,0,400,400);
    my_gradient.addColorStop(0,"white");
    my_gradient.addColorStop(0.5,color);
    my_gradient.addColorStop(1,"black");
    ctx.fillStyle = my_gradient;
    ctx.rect(0,0,400,400);
    ctx.fill();
}
function getColor(ctx,x,y){
    var colorData = ctx.getImageData(x,y,1,1);
    var red = colorData.data[0];
    var green = colorData.data[1];
    var blue = colorData.data[2];
    return [red,green,blue];
}
//rgbתΪhsl

function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    //return [h, s, l];
    return [Math.floor(h*100), Math.round(s*100)+"%", Math.round(l*100)+"%"];

}
function clearPreviousValue(){
    var redInput = document.getElementById('r');
    var greenInput = document.getElementById('g');
    var blueInput = document.getElementById('b');
    redInput.value = "";
    greenInput.value = "";
    blueInput.value = "";

    var hInput = document.getElementById('h');
    var sInput = document.getElementById('s');
    var lInput = document.getElementById('l');
    hInput.value = "";
    sInput.value = "";
    lInput.value = "";
}