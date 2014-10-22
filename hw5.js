document.getElementById('texture').addEventListener('change',readTexture, false);


function Texture(u,v){
    this.u=u;
    this.v=v;
}
function readTexture(evt){
    var files = evt.target.files;
    var f=files[0];
    var fileBuffer=f;
    var reader = new FileReader();
    reader.onload = (function(theFile) {
        return function(e) {
            //console.log(e.target.result);
            fileStr=e.target.result;
            mySV.textureStr=fileStr;
        };
    })(f);
    reader.readAsText(f);
}
function FileTextureFunction(textStr,u,v){
    var line=mySV.line;
    var scaleU=parseInt(u*255);
    var scaleV=parseInt(v*255);
    alert(scaleU,scaleV);
    if(scaleU>255){
        scaleU=255;
    }
    if(scaleU<0){
        scaleU=0;
    }
    if(scaleV>255){
        scaleV=255;
    }
    if(scaleV<0){
        scaleV=0;
    }
    return new Color(line[scaleU*3+98*3*scaleV],line[scaleU*3+98*3*scaleV+1],line[scaleU*3+98*3*scaleV+2]);
}

function interpolateTexture(ps,pe,now){
    var texture =new Texture();
    texture.u=ps.texture.u*(1-now)+pe.texture.u*(now);
    texture.v=ps.texture.v*(1-now)+pe.texture.v*(now);
    return texture;
}


function calculateColorWithTexture(norm,texture){
    
    var coeff=FileTextureFunction(mySV.textureStr,texture.u,texture.v);
    var C0=calculateSingleColorWithTexture(norm,myEnum.DIRECTIONAL_LIGHT0,coeff);
    var C1=calculateSingleColorWithTexture(norm,myEnum.DIRECTIONAL_LIGHT1,coeff);
    var C2=calculateSingleColorWithTexture(norm,myEnum.DIRECTIONAL_LIGHT2,coeff);
    var realColor=new Color(0,0,0);
    //alert(realColor.red);
    //var tmpColor=new Color(myEnum.AMBIENT_LIGHT.color.red,myEnum.AMBIENT_LIGHT.color.green,myEnum.AMBIENT_LIGHT.color.blue);
    realColor.red=C0.red+C1.red+C2.red+coeff.red*myEnum.AMBIENT_LIGHT.color.red;
    realColor.green=C0.green+C1.green+C2.green+coeff.green*myEnum.AMBIENT_LIGHT.color.green;
    realColor.blue=C0.blue+C1.blue+C2.blue+coeff.blue*myEnum.AMBIENT_LIGHT.color.blue;
    return realColor;
}
function calculateSingleColorWithTexture(norm,light,coeff){
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
    var red=myEnum.SPECULAR_COEFFICIENT.red*RdotE*light.color.red+coeff.red*NdotL*light.color.red;
    var green=myEnum.SPECULAR_COEFFICIENT.green*RdotE*light.color.green+coeff.green*NdotL*light.color.green;
    var blue=myEnum.SPECULAR_COEFFICIENT.blue*RdotE*light.color.blue+coeff.blue*NdotL*light.color.blue;
    return new Color(red,green,blue);
}

function drawTriangleForTexture(triIndex){
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
    
    var u0=parseFloat(mySV.triangle[triIndex][0][6]);
    var v0=parseFloat(mySV.triangle[triIndex][0][7]);
    var u1=parseFloat(mySV.triangle[triIndex][1][6]);
    var v1=parseFloat(mySV.triangle[triIndex][1][7]);
    var u2=parseFloat(mySV.triangle[triIndex][2][6]);
    var v2=parseFloat(mySV.triangle[triIndex][2][7]);
    var texture0=new Texture(u0,v0);
    var texture1=new Texture(u1,v1);
    var texture2=new Texture(u2,v2);
    
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
    var point0=new point(Math.round(m0[0][0]),Math.round(m0[1][0]),Math.round(m0[2][0]),norm0,texture0);
    var point1=new point(Math.round(m1[0][0]),Math.round(m1[1][0]),Math.round(m1[2][0]),norm1,texture1);
    var point2=new point(Math.round(m2[0][0]),Math.round(m2[1][0]),Math.round(m2[2][0]),norm2,texture2);
    fillinTriangleForTexture(point0,point1,point2,a);
    
}

function fillinTriangleForTexture(p0,p1,p2,a){
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
        var tmp=calculateColorWithTexture(t0.norm,t0.texture);
        t0.norm=tmp;
        tmp=calculateColorWithTexture(t1.norm,t1.texture);
        t1.norm=tmp;
        tmp=calculateColorWithTexture(t2.norm,t2.texture);
        t2.norm=tmp;
    }
    if(y0==y1){
        for(i=y0;i>y2;i--){            
            var realNormS=interpolateNorm(t0,t2,(i-y0)/(y2-y0));
            var realNormE=interpolateNorm(t1,t2,(i-y1)/(y2-y1));
            var realTextureS=interpolateTexture(t0,t2,(i-y0)/(y2-y0));
            var realTextureE=interpolateTexture(t1,t2,(i-y1)/(y2-y1));
            var startPoint=new point(getX(x0,y0,x2,y2,i),i,0,realNormS,realTextureS);
            var endPoint=new point(getX(x1,y1,x2,y2,i),i,0,realNormE,realTextureE);

            drawBetweenLineForTexture(startPoint,endPoint,thisTri,a);
        }
    }
    else if (y1==y2){
        for(i=y0;i>y2;i--){
            var realNormS=interpolateNorm(t0,t2,(i-y0)/(y2-y0));
            var realNormE=interpolateNorm(t0,t1,(i-y0)/(y1-y0));
            var realTextureS=interpolateTexture(t0,t2,(i-y0)/(y2-y0));
            var realTextureE=interpolateTexture(t0,t1,(i-y0)/(y1-y0));
            var startPoint=new point(getX(x0,y0,x2,y2,i),i,0,realNormS,realTextureS);
            var endPoint=new point(getX(x0,y0,x1,y1,i),i,0,realNormE,realTextureE);
            drawBetweenLineForTexture(startPoint,endPoint,thisTri,a);
        }
    }
    else{
        i=y0;
        while(i>=y1){
            var realNormS=interpolateNorm(t0,t2,(i-y0)/(y2-y0));
            var realNormE=interpolateNorm(t0,t1,(i-y0)/(y1-y0));
            var realTextureS=interpolateTexture(t0,t2,(i-y0)/(y2-y0));
            var realTextureE=interpolateTexture(t0,t1,(i-y0)/(y1-y0));
            
            var startPoint=new point(getX(x0,y0,x2,y2,i),i,0,realNormS,realTextureS);
            var endPoint=new point(getX(x0,y0,x1,y1,i),i,0,realNormE,realTextureE);
            drawBetweenLineForTexture(startPoint,endPoint,thisTri,a);
            i-=1;
        }
        while(i>y2){
            var realNormS=interpolateNorm(t0,t2,(i-y0)/(y2-y0));
            var realNormE=interpolateNorm(t1,t2,(i-y1)/(y2-y1));
            var realTextureS=interpolateTexture(t0,t2,(i-y0)/(y2-y0));
            var realTextureE=interpolateTexture(t1,t2,(i-y1)/(y2-y1));
            var startPoint=new point(getX(x0,y0,x2,y2,i),i,0,realNormS,realTextureS);
            var endPoint=new point(getX(x1,y1,x2,y2,i),i,0,realNormE,realTextureE);
            drawBetweenLineForTexture(startPoint,endPoint,thisTri,a);
            i-=1;
        }
    }
}
function drawBetweenLineForTexture(startPoint,endPoint,myTri,a){
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
            var realTexture=interpolateTexture(startPoint,endPoint,(j-xs)/(xe-xs));
            var realColor=calculateColorWithTexture(realNorm,realTexture);
        }
        else if(myType.type==1){
            var realColor=interpolateNorm(startPoint,endPoint,(j-xs)/(xe-xs));
            
        }
        //alert("here!");
        setPixel(j,ynow,z,255*realColor.red,255*realColor.green,255*realColor.blue,a);
    }
}