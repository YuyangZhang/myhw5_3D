import string
file = open("/Users/yuyangzhang/Desktop/homeworks/hw-3D/myhw4/POT4.ASC")
out=open("/Users/yuyangzhang/Desktop/homeworks/hw-3D/myhw4/pot4.txt","w")
line="start"
s=0
while line:
    line = file.readline()
    if line.find("triangle")==-1 and line!='':
        list=line.split("	")
        elements=[0 for i in range(0,len(list))]
        for i in range(0,len(list)):
            elements[i]=float(list[i])
        for i in range(0,len(list)-1):
            out.write(str(elements[i])+',')
        out.write(str(elements[len(list)-1])+'\n')
out.close()
file.close()
