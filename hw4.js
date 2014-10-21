
var myEnum=new StateEnum();
var myType=new InterpolationType(document.getElementsByName("shadingType")[0].checked);
//var myType=new InterpolationType(false);
var mySV=new StateVariables();
initialStateVariables();
NewFrameBuffer();
initialLights();
document.getElementById('files').addEventListener('change', readFile, false);

function StateVariables(){
    this.triNumber=0;
    this.output="";
    this.triangle=[];
    this.element="";
    this.c="";
    this.imageData="";
    this.Msp=1;
    //New sets for Hw4.
    this.Mtc=1;
    this.ambientLight=new Light();
    this.directionalLight0=new Light();
    this.directionalLight1=new Light();
    this.directionalLight2=new Light();
    this.ambientCoefficient=0;
    this.diffuseCoefficient=0;
    this.specularCoefficient=0;
    this.shininess=0;
    this.shadingInterpolationType=0;
}
function initialStateVariables(){
    mySV.triNumber=0;
    mySV.output="P3<br>256 256<br>255<br>";
    mySV.triangle=new Array(898);
    for (k=0;k<898;k++){
        mySV.triangle[k]=new Array(3);
        for (i=0;i<3;i++){
            mySV.triangle[k][i]=new Array(7);
            for (j=0;j<7;j++){
                mySV.triangle[k][i][j]=0;
            }
        }
    }
    mySV.Msp=[[128,0,0,128],[0,-128,0,128],[0,0,100,0],[0,0,0,1]];  
}
function InterpolationType(flag){
    if (flag==true){
        this.type=1;//0 for Phong; 1 for Gouraud;
    }
    else if(flag==false){
        this.type=0;
    }
}

function Color(r,g,b){
    this.red=r||0;
    this.green=g||0;
    this.blue=b||0;
}
Color.prototype = {
    constructor: Color,
    set: function (x,y,z) 
    {
        this.red=x;
        this.green=y;
        this.blue=z;
        return this;
    },
    dot: function(v)
    {
        return this.red*v.red+this.green*v.green+this.blue*v.blue;
    },
    normal:function()
    {
        var x=this.red;
        var y=this.green;
        var z=this.blue;
        var len=Math.sqrt(x*x+y*y+z*z);
        return new Color(x/len,y/len,z/len);
    },
    add: function(v)
    {
        return new Color(this.red+v.red,this.green+v.green,this.blue+v.blue);
    },
    scale: function(v){
        return new Color(this.red*v,this.green*v,this.blue*v);
    }
}
function Light(x,y,z,r,g,b){
    this.direction=new Coordinate(x,y,z,0)||new Coordinate(0,0,0,0);
    this.color=new Color(r,g,b)|| new Color(0,0,0);
}

function StateEnum(){
    this.AMBIENT_LIGHT=0;
    this.DIRECTIONAL_LIGHT0=0;
    this.DIRECTIONAL_LIGHT1=0;
    this.DIRECTIONAL_LIGHT2=0;
    this.AMBIENT_COEFFICIENT=0;
    this.DIFFUSE_COEFFICIENT=0;
    this. SPECULAR_COEFFICIENT=0;
    this. SHININESS=0;
    this. SHADING_INTERPOLATION_TYPE=0;
}
function initialLights(){
    var light0 = new Light();
	light0.direction.x = -0.7071;
	light0.direction.y = 0.7071;
	light0.direction.z = 0.0;
	light0.color.red = 0.5;
	light0.color.green = 0.5;
	light0.color.blue = 0.9;

	var light1 = new Light();
	light1.direction.x = 0.0;
	light1.direction.y = -0.7071;
	light1.direction.z = -0.7071;
	light1.color.red = 0.9;
	light1.color.green = 0.2;
	light1.color.blue = 0.3;

	var light2 = new Light();
	light2.direction.x = 0.7071;
	light2.direction.y = 0.0;
	light2.direction.z = -0.7071;
	light2.color.red = 0.2;
	light2.color.green = 0.7;
	light2.color.blue = 0.3;

	var ambientLight = new Light();
	ambientLight.direction.x = 0.0;
	ambientLight.direction.y = 0.0;
	ambientLight.direction.z = 0.0;
	ambientLight.color.red = 0.3;
	ambientLight.color.green = 0.3;
	ambientLight.color.blue = 0.3;

	var ambientCoefficient = new Color(0.1, 0.1, 0.1);
	var diffuseCoefficient = new Color(0.7, 0.7, 0.7);
	var specularCoefficient = new Color(0.3, 0.3, 0.3); // R, G, B
	var shininess = 32.0;
    
    myEnum.AMBIENT_LIGHT=ambientLight;
	myEnum.DIRECTIONAL_LIGHT0=light0;
	myEnum.DIRECTIONAL_LIGHT1=light1;
	myEnum.DIRECTIONAL_LIGHT2=light2;
	myEnum.AMBIENT_COEFFICIENT=ambientCoefficient;
	myEnum.DIFFUSE_COEFFICIENT=diffuseCoefficient;
	myEnum.SPECULAR_COEFFICIENT=specularCoefficient;
	myEnum.SHININESS=shininess;
}
function changeToImageNorm(norm){
    var scaleMatrix = CreateScaleMatrix(new Coordinate(myParameter.scaleX,myParameter.scaleY,myParameter.scaleZ,1));
    var translationMatrix = CreateTranslationMatrix(new Coordinate(myParameter.tranX,myParameter.tranY,myParameter.tranZ,1));
    var rotationByX = CreateRotationByXMatrix(myParameter.rotateX);
    var rotationByY = CreateRotationByYMatrix(myParameter.rotateY);
    var rotationByZ = CreateRotationByZMatrix(myParameter.rotateZ);
    var vnorm=[[norm.red],[norm.green],[norm.blue],[0]];
    var tmpMatrix=mulMat(rotationByX,scaleMatrix);
    tmpMatrix=mulMat(rotationByY,tmpMatrix);
    tmpMatrix=mulMat(rotationByZ,tmpMatrix);
    tmpMatrix=mulMat(translationMatrix,tmpMatrix);
    tmpMatrix=mulMat(myCamera.Miw,tmpMatrix);
    vnorm=mulMat(tmpMatrix,vnorm)
    var newNorm=(new Color(vnorm[0][0],vnorm[1][0],vnorm[2][0])).normal();
    return newNorm;
}
function interpolateNorm(ps,pe,now){
    var norm =new Color();
    norm=ps.norm.scale(1-now).add(pe.norm.scale(now));
    return norm;
}

function calculateColor(norm){
    var C0=calculateSingleColor(norm,myEnum.DIRECTIONAL_LIGHT0);
    var C1=calculateSingleColor(norm,myEnum.DIRECTIONAL_LIGHT1);
    var C2=calculateSingleColor(norm,myEnum.DIRECTIONAL_LIGHT2);
    var realColor=new Color(0,0,0);
    //alert(realColor.red);
    //var tmpColor=new Color(myEnum.AMBIENT_LIGHT.color.red,myEnum.AMBIENT_LIGHT.color.green,myEnum.AMBIENT_LIGHT.color.blue);
    realColor.red=C0.red+C1.red+C2.red+myEnum.AMBIENT_COEFFICIENT.red*myEnum.AMBIENT_LIGHT.color.red;
    realColor.green=C0.green+C1.green+C2.green+myEnum.AMBIENT_COEFFICIENT.green*myEnum.AMBIENT_LIGHT.color.green;
    realColor.blue=C0.blue+C1.blue+C2.blue+myEnum.AMBIENT_COEFFICIENT.blue*myEnum.AMBIENT_LIGHT.color.blue;
    return realColor;
}
function calculateSingleColor(norm,light){
    var E=new Coordinate(0,0,-1,0);
    var N=new Coordinate(norm.red,norm.green,norm.blue,0);
    var L=light.direction;
    var tmpL=new Coordinate(L.x,L.y,L.z,L.w);
    var R=(N.scale((N.dot(tmpL))*2)).add(tmpL.scale(-1));
    var RdotE=R.dot(E);
    var NdotL=N.dot(tmpL);
    var NdotE=N.dot(E);
    //alert(RdotE,NdotL,NdotE);
    if(NdotE*NdotL<0){
        return new Color(0,0,0);
    }
    else if(NdotE<0&&NdotL<0){
        NdotL*=-1;
        RdotE*=-1;
    }
    RdotE=Math.pow(RdotE,myEnum.SHININESS);
    var red=myEnum.SPECULAR_COEFFICIENT.red*RdotE*light.color.red+myEnum.DIFFUSE_COEFFICIENT.red*NdotL*light.color.red;
    var green=myEnum.SPECULAR_COEFFICIENT.green*RdotE*light.color.green+myEnum.DIFFUSE_COEFFICIENT.green*NdotL*light.color.green;
    var blue=myEnum.SPECULAR_COEFFICIENT.blue*RdotE*light.color.blue+myEnum.DIFFUSE_COEFFICIENT.blue*NdotL*light.color.blue;
    return new Color(red,green,blue);
}
function drawTriangleForShading(triIndex){
    var x0=parseFloat(mySV.triangle[triIndex][0][0]);
    var y0=parseFloat(mySV.triangle[triIndex][0][1]);
    var z0=parseFloat(mySV.triangle[triIndex][0][2]);
    var x1=parseFloat(mySV.triangle[triIndex][1][0]);
    var y1=parseFloat(mySV.triangle[triIndex][1][1]);
    var z1=parseFloat(mySV.triangle[triIndex][1][2]);
    var x2=parseFloat(mySV.triangle[triIndex][2][0]);
    var y2=parseFloat(mySV.triangle[triIndex][2][1]);
    var z2=parseFloat(mySV.triangle[triIndex][2][2]);
    
    var r0=parseFloat(mySV.triangle[triIndex][0][3]);
    var g0=parseFloat(mySV.triangle[triIndex][0][4]);
    var b0=parseFloat(mySV.triangle[triIndex][0][5]);
    var r1=parseFloat(mySV.triangle[triIndex][1][3]);
    var g1=parseFloat(mySV.triangle[triIndex][1][4]);
    var b1=parseFloat(mySV.triangle[triIndex][1][5]);
    var r2=parseFloat(mySV.triangle[triIndex][2][3]);
    var g2=parseFloat(mySV.triangle[triIndex][2][4]);
    var b2=parseFloat(mySV.triangle[triIndex][2][5]);
    var a=0xff;
    var m0=mulMat(myMatrix,[[x0],[y0],[z0],[1]]);
    var m1=mulMat(myMatrix,[[x1],[y1],[z1],[1]]);
    var m2=mulMat(myMatrix,[[x2],[y2],[z2],[1]]);
    
    var norm0=new Color(r0,g0,b0);
    norm0=changeToImageNorm(norm0);
    var norm1=new Color(r1,g1,b1);
    norm1=changeToImageNorm(norm1);
    var norm2=new Color(r2,g2,b2);
    norm2=changeToImageNorm(norm2);
    var point0=new point(Math.round(m0[0][0]),Math.round(m0[1][0]),Math.round(m0[2][0]),norm0);
    var point1=new point(Math.round(m1[0][0]),Math.round(m1[1][0]),Math.round(m1[2][0]),norm1);
    var point2=new point(Math.round(m2[0][0]),Math.round(m2[1][0]),Math.round(m2[2][0]),norm2);
    fillinTriangleForShading(point0,point1,point2,a);
    
}

function fillinTriangleForShading(p0,p1,p2,a){
    var y0=p0.y;
    var y1=p1.y;
    var y2=p2.y;
    var x0=p0.x;
    var x1=p1.x;
    var x2=p2.x;
    var t0;
    var t1;
    var t2;
    if(y0>=y1&&y1>=y2){
        t0=p0;
        t1=p1;
        t2=p2;
    }
    else if(y0>=y2&&y2>=y1){
        t0=p0;
        t1=p2;
        t2=p1;
    }
    else if(y1>=y2&&y2>=y0){
        t0=p1;
        t1=p2;
        t2=p0;
    }
    else if(y1>=y0&&y0>=y2){
        t0=p1;
        t1=p0;
        t2=p2;
    }
    else if(y2>=y1&&y1>=y0){
        t0=p2;
        t1=p1;
        t2=p0;
    }
    else if(y2>=y0&&y0>=y1){
        t0=p2;
        t1=p0;
        t2=p1;
    }
    y0=t0.y;
    y1=t1.y;
    y2=t2.y;
    x0=t0.x;
    x1=t1.x;
    x2=t2.x;
    z0=t0.z;
    z1=t1.z;
    z2=t2.z;
    var thisTri=new realTriangle(t0,t1,t2);
    //
    if(myType.type==1){
        var tmp=calculateColor(t0.norm);
        t0.norm=tmp;
        tmp=calculateColor(t1.norm);
        t1.norm=tmp;
        tmp=calculateColor(t2.norm);
        t2.norm=tmp;
    }
    if(y0==y1){
        for(i=y0;i>y2;i--){            
            var realNormS=interpolateNorm(t0,t2,(i-y0)/(y2-y0));
            var realNormE=interpolateNorm(t1,t2,(i-y1)/(y2-y1));
            var startPoint=new point(getX(x0,y0,x2,y2,i),i,0,realNormS);
            var endPoint=new point(getX(x1,y1,x2,y2,i),i,0,realNormE);

            drawBetweenLineForShading(startPoint,endPoint,thisTri,a);
        }
    }
    else if (y1==y2){
        for(i=y0;i>y2;i--){
            var realNormS=interpolateNorm(t0,t2,(i-y0)/(y2-y0));
            var realNormE=interpolateNorm(t0,t1,(i-y0)/(y1-y0));
            var startPoint=new point(getX(x0,y0,x2,y2,i),i,0,realNormS);
            var endPoint=new point(getX(x0,y0,x1,y1,i),i,0,realNormE);
            drawBetweenLineForShading(startPoint,endPoint,thisTri,a);
        }
    }
    else{
        i=y0;
        while(i>=y1){
            var realNormS=interpolateNorm(t0,t2,(i-y0)/(y2-y0));
            var realNormE=interpolateNorm(t0,t1,(i-y0)/(y1-y0));
            var startPoint=new point(getX(x0,y0,x2,y2,i),i,0,realNormS);
            var endPoint=new point(getX(x0,y0,x1,y1,i),i,0,realNormE);
            drawBetweenLineForShading(startPoint,endPoint,thisTri,a);
            i-=1;
        }
        while(i>y2){
            var realNormS=interpolateNorm(t0,t2,(i-y0)/(y2-y0));
            var realNormE=interpolateNorm(t1,t2,(i-y1)/(y2-y1));
            var startPoint=new point(getX(x0,y0,x2,y2,i),i,0,realNormS);
            var endPoint=new point(getX(x1,y1,x2,y2,i),i,0,realNormE);
            drawBetweenLineForShading(startPoint,endPoint,thisTri,a);
            i-=1;
        }
    }
}
function drawBetweenLineForShading(startPoint,endPoint,myTri,a){
    var xx0=startPoint.x;
    var xx1=endPoint.x;
    if(xx0>xx1){
        var newPoint=startPoint;
        startPoint=endPoint;
        endPoint=newPoint;
    }
    xx0=startPoint.x;
    xx1=endPoint.x;
    var ynow=endPoint.y;
    var xe=endPoint.x;
    var xs=startPoint.x;
    xe=Math.round(xe);
    xs=Math.round(xs);
    for(j=xs;j<xe;j++){
        var z=getZ(myTri.p0.x,myTri.p0.y,myTri.p0.z,myTri.p1.x,myTri.p1.y,myTri.p1.z,myTri.p2.x,myTri.p2.y,myTri.p2.z,j,ynow);
        if (myType.type==0){
            var realNorm=interpolateNorm(startPoint,endPoint,(j-xs)/(xe-xs)).normal(); 
            var realColor=calculateColor(realNorm);
        }
        else if(myType.type==1){
            var realColor=interpolateNorm(startPoint,endPoint,(j-xs)/(xe-xs));
            
        }
        //alert("here!");
        setPixel(j,ynow,z,255*realColor.red,255*realColor.green,255*realColor.blue,a);
    }
}