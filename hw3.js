
var myCamera=new Camera();
var myStack=new MatrixStack();
var myMatrix=1;
var myParameter=new CameraParameter();

function CameraParameter(){
    this.scaleX=2;
    this.scaleY=2;
    this.scaleZ=2;
    this.tranX=16;
    this.tranY=-10;
    this.tranZ=1;
    this.rotateX=-30;
    this.rotateY=0;
    this.rotateZ=10;
    this.fov=63.7;
    this.lookatX=0.8;
    this.lookatY=0.7;
    this.lookatZ=4.5;
    this.worldupX=-0.2;
    this.worldupY=1;
    this.worldupZ=0;
    this.positionX=13.2;
    this.positionY=-8.7;
    this.positionZ=-14.8;
    this.line="";
}

function MatrixStack(){
    this.top=0;
    this.stack=new Array(10000);
}
function Coordinate(x,y,z,w){
    this.x=x;
    this.y=y;
    this.z=z;
    this.w=w;
}
Coordinate.prototype = {
    constructor: Coordinate,
    set: function (x,y,z,w) 
    {
        this.x=x;
        this.y=y;
        this.z=z;
        this.w=w;
        return this;
    },
    dot: function(v)
    {
        return this.x*v.x+this.y*v.y+this.z*v.z;
    },
    cross: function(v)
    {
        return new Coordinate(this.y*v.z-this.z*v.y,this.z*v.x-this.x*v.z,this.x*v.y-this.y*v.x,0).scale(-1);
    },
    scale: function(v)
    {
        return new Coordinate(this.x*v,this.y*v,this.z*v,this.w);
    },
    add: function(v)
    {
        return new Coordinate(this.x+v.x,this.y+v.y,this.z+v.z,this.w);
    },
    normal:function()
    {
        var x=this.x;
        var y=this.y;
        var z=this.z;
        var len=Math.sqrt(x*x+y*y+z*z);
        return new Coordinate(x/len,y/len,z/len,this.w);
    }

}

function Camera(Miw,Mpi,position,lookat,worldup,fov){
    this.Miw=Miw;
    this.Mpi=Mpi;
    this.position=position;
    this.lookat=lookat;
    this.worldup=worldup;
    this.fov=fov;
}

function initialCamera(){
    //ClearCanvas();
    myCamera.Miw=[];
    myCamera.Mpi=[];
    myCamera.lookat=[];
    myCamera.position=[];
    myCamera.worldup=[];
    myCamera.fov=0;
    myStack.top=0;
    myMatrix=1;
}
function initialParameter(){
    myParameter=new CameraParameter();
    myType=new InterpolationType(document.getElementsByName("shadingType")[0].checked);
}
function initialText(){
    document.getElementById("scaleX").value=2;
    document.getElementById("scaleY").value=2;
    document.getElementById("scaleZ").value=2;
    document.getElementById("rotateX").value=-30;
    document.getElementById("rotateY").value=0;
    document.getElementById("rotateZ").value=10;
    document.getElementById("translateX").value=16;
    document.getElementById("translateY").value=-10;
    document.getElementById("translateZ").value=1;
    document.getElementById("positionX").value=13.2;
    document.getElementById("positionY").value=-8.7;
    document.getElementById("positionZ").value=-14.8;
    document.getElementById("lookatX").value=0.8;
    document.getElementById("lookatY").value=0.7;
    document.getElementById("lookatZ").value=4.5;
    document.getElementById("worldupX").value=-0.2;
    document.getElementById("worldupY").value=1;
    document.getElementById("worldupZ").value=0;
    document.getElementById("FOV").value=63.7;
}
function CreateScaleMatrix(coordinate){
    return [[coordinate.x,0,0,0],[0,coordinate.y,0,0],[0,0,coordinate.z,0],[0,0,0,1]];
}
function CreateTranslationMatrix(coordinate){
    return [[1,0,0,coordinate.x],[0,1,0,coordinate.y],[0,0,1,coordinate.z],[0,0,0,1]];
}
function CreateRotationByXMatrix(fov){
    var degree=fov*Math.PI/180;
    return [[1,0,0,0],[0,Math.cos(degree),0-Math.sin(degree),0],[0,Math.sin(degree),Math.cos(degree),0],[0,0,0,1]];
}
function CreateRotationByYMatrix(fov){
    var degree=fov*Math.PI/180;
    return [[Math.cos(degree),0,Math.sin(degree),0],[0,1,0,0],[0-Math.sin(degree),0,Math.cos(degree),0],[0,0,0,1]];
}
function CreateRotationByZMatrix(fov){
    var degree=fov*Math.PI/180;
    return [[Math.cos(degree),0-Math.sin(degree),0,0],[Math.sin(degree),Math.cos(degree),0,0],[0,0,1,0],[0,0,0,1]];
}
function mulMat(mat1,mat2){
    var matRow=new Array(4);
    for (k=0;k<4;k++){
        //matRow[k][j]=0;
        matRow[k]=new Array(mat2[0].length);
        for (j=0;j<mat2[0].length;j++){
            matRow[k][j]=0;
            for (i=0;i<4;i++){
                matRow[k][j]+=mat1[k][i]*mat2[i][j];
            }
        }
        //alert(s);
    }
    var w=matRow[3][mat2[0].length-1];
    if(w!=1&&w!=0){
        for (k=0;k<4;k++){
            for (i=0;i<mat2[0].length;i++){
                matRow[k][i]=matRow[k][i]/w;
            }
        }
    }
    return matRow;
}

function SetCameraPosition(coordinate){
    myCamera.position=coordinate;
}
function SetCameraOrientation(lookat,worldup){
    myCamera.lookat=lookat;
    myCamera.worldup=worldup;
}
function SetCameraFOV(degree){
    myCamera.fov=degree;
}
function PushMatrix(matrix){
    if (myMatrix==1){
        myMatrix=matrix;
    }
    else{
        myMatrix=mulMat(matrix,myMatrix);
    }

    myStack.stack[top]=myMatrix;
    myStack.top+=1;
}
function PopMatrix(){
    myStack.top-=1;
    myMatrix=myStack.stack[top];
}
function startCamera(){
    mySV.output="P3<br>256 256<br>255<br>";
    initialParameter();
    initialText();
    getSnapshot();
}
function getSnapshot(){
    initialCamera();
    var scaleMatrix = CreateScaleMatrix(new Coordinate(myParameter.scaleX,myParameter.scaleY,myParameter.scaleZ,1));
    var translationMatrix = CreateTranslationMatrix(new Coordinate(myParameter.tranX,myParameter.tranY,myParameter.tranZ,1));
    var rotationByX = CreateRotationByXMatrix(myParameter.rotateX);
    var rotationByY = CreateRotationByYMatrix(myParameter.rotateY);
    var rotationByZ = CreateRotationByZMatrix(myParameter.rotateZ);

    var position = new Coordinate(myParameter.positionX,myParameter.positionY,myParameter.positionZ,1.0);
    var lookat = new Coordinate(myParameter.lookatX,myParameter.lookatY,myParameter.lookatZ,0.0);
    var worldup = new Coordinate(myParameter.worldupX,myParameter.worldupY,myParameter.worldupZ,0.0);
    //var fov = document.getElementById("FOV").value;
    var fov=myParameter.fov;

    SetCameraPosition(position);
    SetCameraOrientation(lookat, worldup);
    SetCameraFOV(fov);

    PushMatrix(scaleMatrix);
    PushMatrix(rotationByX);
    PushMatrix(rotationByY);
    PushMatrix(rotationByZ);
    PushMatrix(translationMatrix);
    SetCamera();
    ClearCanvas();
    for(triN=0;triN<mySV.triNumber;triN++){  
        //drawTriangleForcamera(triN);
        //drawTriangleForShading(triN);
        drawTriangleForTexture(triN);
    }
    flushCanvasToScreen(mySV.imageData);
    mySV.c.putImageData(mySV.imageData,0,0);
}
function SetCamera(){
    var d=1/Math.tan(myCamera.fov*Math.PI/360);
    var right=myCamera.lookat.cross(myCamera.worldup);
    myCamera.worldup=right.cross(myCamera.lookat);
    right=normalize(right);
    myCamera.lookat=normalize(myCamera.lookat);
    myCamera.worldup=normalize(myCamera.worldup);

    var a1=myCamera.lookat.x;
    var b1=myCamera.lookat.y;
    var c1=myCamera.lookat.z;
    var a2=myCamera.worldup.x;
    var b2=myCamera.worldup.y;
    var c2=myCamera.worldup.z;
    var a3=right.x;
    var b3=right.y;
    var c3=right.z;
    myCamera.Mpi=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,1/d,1]];
    myCamera.Miw=[[a3,b3,c3,0-right.dot(myCamera.position)],[a2,b2,c2,0-myCamera.worldup.dot(myCamera.position)],[a1,b1,c1,0-myCamera.lookat.dot(myCamera.position)],[0,0,0,1]];
    //myCamera.Miw=[[a3,b3,c3,myCamera.position.x],[a2,b2,c2,myCamera.position.y],[a1,b1,c1,myCamera.position.z],[0,0,0,1]];

    PushMatrix(myCamera.Miw);
    PushMatrix(myCamera.Mpi);
    PushMatrix(mySV.Msp);
}

function resetCamera(){
    myParameter.scaleX=parseFloat(document.getElementById("scaleX").value);
    myParameter.scaleY=parseFloat(document.getElementById("scaleY").value);
    myParameter.scaleZ=parseFloat(document.getElementById("scaleZ").value);
    myParameter.tranX=parseFloat(document.getElementById("translateX").value);
    myParameter.tranY=parseFloat(document.getElementById("translateY").value);
    myParameter.tranZ=parseFloat(document.getElementById("translateZ").value);
    myParameter.rotateX=parseFloat(document.getElementById("rotateX").value);
    myParameter.rotateY=parseFloat(document.getElementById("rotateY").value);
    myParameter.rotateZ=parseFloat(document.getElementById("rotateZ").value);
    myParameter.fov=parseFloat(document.getElementById("FOV").value);
    myParameter.positionX=parseFloat(document.getElementById("positionX").value);
    myParameter.positionY=parseFloat(document.getElementById("positionY").value);
    myParameter.positionZ=parseFloat(document.getElementById("positionZ").value);
    myParameter.lookatX=parseFloat(document.getElementById("lookatX").value);
    myParameter.lookatY=parseFloat(document.getElementById("lookatY").value);
    myParameter.lookatZ=parseFloat(document.getElementById("lookatZ").value);
    myParameter.worldupX=parseFloat(document.getElementById("worldupX").value);
    myParameter.worldupY=parseFloat(document.getElementById("worldupY").value);
    myParameter.worldupZ=parseFloat(document.getElementById("worldupZ").value);
    getSnapshot();
}

function normalize(coord){
    var x=coord.x;
    var y=coord.y;
    var z=coord.z;
    var len=Math.sqrt(x*x+y*y+z*z);
    return new Coordinate(x/len,y/len,z/len,coord.w);
}


function moveCamera(){
    var speedX=parseFloat(document.getElementById("speedX").value);
    var speedY=parseFloat(document.getElementById("speedY").value);
    var speedZ=parseFloat(document.getElementById("speedZ").value);
    var speedNod=parseFloat(document.getElementById("nod").value);
    var speedShake=parseFloat(document.getElementById("shake").value);
    var timeKeeper=1;
    var myDegreeN=0;
    var myDegreeS=0;
    while(timeKeeper<=50){
        setTimeout(function() {
            myParameter.positionX+=speedX/10;
            myParameter.positionZ+=speedZ/10;
            myParameter.positionY+=speedY/10;
            if(myDegreeN>=-30 && myDegreeN<=30){
                kbControlDir("up",speedNod/10);
                myDegreeN+=speedNod/10;
            }
            else if(myDegreeN<-30){
                myDegreeN=-30;
                speedNod=0-speedNod;
            }
            else if(myDegreeN>30){
                myDegreeN=30;
                speedNod=0-speedNod;
            }
            if(myDegreeS>=-30 && myDegreeS<=30){
                kbControlDir("right",speedShake/10);
                myDegreeS+=speedShake/10;
            }
            else if(myDegreeS<-30){
                myDegreeS=-30;
                speedShake=0-speedShake;
            }
            else if(myDegreeS>30){
                myDegreeS=30;
                speedShake=0-speedShake;
            }
            
            getSnapshot();
          }, timeKeeper*200);
        timeKeeper+=1;
    }

}

function movePot(){
    var timeKeeper=1;
    while(timeKeeper<=300){
        setTimeout(function() {
            //myParameter.positionX+=speedX/10;
            //myParameter.positionZ+=speedZ/10;
            myParameter.rotateX+=1;

            getSnapshot();
          }, timeKeeper*200);
        timeKeeper+=1;
    }

}

function keyDown(e) {
    var keycode = e.which;
    var realkey = String.fromCharCode(e.which);
    if (realkey=='S'){
       kbControlPos("positionY",-0.5);
    }
    else if (realkey=='W'){
       kbControlPos("positionY",0.5);
    }
    else if (realkey=='Q'){
       kbControlPos("positionZ",0.5);
    }
    else if (realkey=='E'){
       kbControlPos("positionZ",-0.5);
    }
    else if (realkey=='A'){
       kbControlPos("positionX",-0.5);
    }
    else if (realkey=='D'){
       kbControlPos("positionX",0.5);
    }
    else if (keycode==38){
       kbControlDir("up",-5);
    }
    else if (keycode==40){
       kbControlDir("up",5);
    }
    else if (keycode==37){
       kbControlDir("right",-5);
    }
    else if (keycode==39){
       kbControlDir("right",5);
    }
    else if (realkey=='I'){
        myParameter.rotateX+=5;
        getSnapshot();
    }
    else if (realkey=='K'){
        myParameter.rotateX-=5;
        getSnapshot();
    }
    else if (realkey=='J'){
        myParameter.rotateY-=5;
        getSnapshot();
    }else if (realkey=='L'){
        myParameter.rotateY+=5;
        getSnapshot();
    }else if (realkey=='U'){
        myParameter.rotateZ-=5;
        getSnapshot();
    }else if (realkey=='O'){
        myParameter.rotateZ+=5;
        getSnapshot();
    }
    
    
}
function kbControlPos(action,length){
    switch(action){
        case "positionX": myParameter.positionX+=length; break;
        case "positionY": myParameter.positionY+=length; break;
        case "positionZ": myParameter.positionZ+=length; break;
    }
    getSnapshot();
}
function kbControlDir(action,degree){
    
    var rotateV;
    if (action=="up"){
        rotateV=CreateRotationByXMatrix(degree);
    }
    else if (action=="right"){
        rotateV=CreateRotationByYMatrix(degree);
    }
    var lookat=[[myParameter.lookatX],[myParameter.lookatY],[myParameter.lookatZ],[1]];
    lookat=mulMat(rotateV,lookat);
    var worldup=[[myParameter.worldupX],[myParameter.worldupY],[myParameter.worldupZ],[1]];
    worldup=mulMat(rotateV,worldup);
    if(lookat[0][0]<4.2 &&lookat[0][0]>-3.45 &&lookat[1][0]<4&&lookat[1][0]>-3.5){
        myParameter.lookatX=lookat[0][0];
        myParameter.lookatY=lookat[1][0];
        myParameter.lookatZ=lookat[2][0];

        myParameter.worldupX=worldup[0][0];
        myParameter.worldupY=worldup[1][0];
        myParameter.worldupZ=worldup[2][0];
    }
    else{
        alert("Out of range!");
    }
    getSnapshot();
}
document.onkeydown = keyDown;