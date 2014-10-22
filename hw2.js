var zbuffer=new Array();
for (k=0;k<70000;k++)
    zbuffer[k]=0;

function point(x,y,z,n,t){
    this.x=x||0;
    this.y=y||0;
    this.z=z||0;
    this.norm=n||new Color(0,0,0);
    this.w=0;
    this.texture=t;
}

function realTriangle(p0,p1,p2){
    this.p0=p0;
    this.p1=p1;
    this.p2=p2;
}

function NewFrameBuffer(){
    mySV.element=document.getElementById("mycanvas");
    mySV.c=mySV.element.getContext("2d");
    var width=parseInt(mySV.element.getAttribute("width"));
    var height=parseInt(mySV.element.getAttribute("height"));
    mySV.imageData=mySV.c.createImageData(width,height);
}

function FreeFrameBuffer(){
    mySV.c=null;
    mySV.imageData=null;
    mySV.element=null;
}

function ClearCanvas(){
    FreeFrameBuffer();
    mySV.element=document.getElementById("mycanvas");
    mySV.c=mySV.element.getContext("2d");
    var width=parseInt(mySV.element.getAttribute("width"));
    var height=parseInt(mySV.element.getAttribute("height"));
    mySV.c.clearRect(0,0,width,height);
    mySV.imageData=mySV.c.createImageData(width,height);
    for (k=0;k<70000;k++){
        zbuffer[k]=0;
    }

}
//fuction for hw2
function setPixel(x,y,z,r,g,b,a){
    var imageData=mySV.imageData;
    if(r>255){
        r=255;
    }
    if(g>255){
        g=255;
    }
    if(b>255){
        b=255;
    }
    if(x<256&&x>=0&&y<256&&y>=0){
        if(zbuffer[x+y*256]==0||zbuffer[x+256*y]>z){
            var index=4*(x+y*imageData.width);
            imageData.data[index+0]=r;
            imageData.data[index+1]=g;
            imageData.data[index+2]=b;
            imageData.data[index+3]=a;
            zbuffer[x+256*y]=z;
        }
    }

}

function flushCanvasToScreen(imageData){
    for (k=0;k<256;k++){
        for (i=0;i<256;i++){
            index=4*(i+k*imageData.width);
            mySV.output+=imageData.data[index+0]+" "+imageData.data[index+1]+" "+imageData.data[index+2]+" ";
        }
        mySV.output+="<br>"
    }
}

function showPPMString(output){
    document.getElementById('show').innerHTML=mySV.output;
}

function readFile(evt) {
    mySV.line=mySV.textureStr.split(',');
    var files = evt.target.files;
    var f=files[0];
    var fileBuffer=f;
    var reader = new FileReader();
    reader.onload = (function(theFile) {
        return function(e) {
            //console.log(e.target.result);
            fileStr=e.target.result;
            analysisFile(fileStr);

        };
    })(f);
    reader.readAsText(f);
}

function analysisFile(fileStr){
    var line=fileStr.split('\n');
    mySV.triNumber=parseInt(line.length/3);
    for(i=0;i<parseInt(line.length/3);i++){   
        mySV.triangle[i][0]=line[i*3].split(',');
        mySV.triangle[i][1]=line[i*3+1].split(',');
        mySV.triangle[i][2]=line[i*3+2].split(',');
    }
    startCamera();
}


function fillinTriangle(p0,p1,p2,r,g,b,a){
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
    var thisTri=new realTriangle(x0,y0,z0,x1,y1,z1,x2,y2,z2);
    if(y0==y1){
        for(i=y0;i>y2;i--){
            drawBetweenLine(i,getX(x0,y0,x2,y2,i),getX(x1,y1,x2,y2,i),r,g,b,a,thisTri);
        }
    }
    else if (y1==y2){
        for(i=y0;i>y2;i--){
            drawBetweenLine(i,getX(x0,y0,x2,y2,i),getX(x0,y0,x1,y1,i),r,g,b,a,thisTri);
        }
    }
    else{
        i=y0;
        while(i>=y1){
            drawBetweenLine(i,getX(x0,y0,x2,y2,i),getX(x0,y0,x1,y1,i),r,g,b,a,thisTri);
            i-=1;
        }
        while(i>y2){
            drawBetweenLine(i,getX(x1,y1,x2,y2,i),getX(x0,y0,x2,y2,i),r,g,b,a,thisTri);
            i-=1;
        }
    }
}
function drawBetweenLine(ynow,xx0,xx1,r,g,b,a,myTri){
    var xe=Math.max(xx0,xx1);
    var xs=Math.min(xx0,xx1);
    xe=Math.round(xe);
    xs=Math.round(xs);
    for(j=xs;j<xe;j++){
        var z=getZ(myTri.x0,myTri.y0,myTri.z0,myTri.x1,myTri.y1,myTri.z1,myTri.x2,myTri.y2,myTri.z2,j,ynow);
        setPixel(j,ynow,z,r,g,b,a);
    }
}
function getX(p0,q0,p1,q1,q){
    var dp=p1-p0;
    var dq=q1-q0;
    return dp*(q-q0)/dq+p0;
}
function getZ(a0,b0,c0,a1,b1,c1,a2,b2,c2,a,b){
    var aa=(b1-b0)*(c2-c0)-(c1-c0)*(b2-b0);  
    var bb=(c1-c0)*(a2-a0)-(a1-a0)*(c2-c0);  
    var cc=(a1-a0)*(b2-b0)-(b1-b0)*(a2-a0);  
    var dd=0-(aa*a0+bb*b0+cc*c0);
    if (cc!=0)
        return Math.round(-1000000*(aa*a+bb*b+dd)/cc)/1000000;
    else
        return 2000000000;
}
function display(){
    document.getElementById('show').innerHTML=mySV.output;
}
//hw2 end