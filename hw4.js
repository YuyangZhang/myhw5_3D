
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
    this.textureStr="";
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