import struct
import string
file = open("/Users/yuyangzhang/Desktop/homeworks/hw-3D/myhw5/list.txt",'r')
out=open("/Users/yuyangzhang/Desktop/homeworks/hw-3D/myhw5/texture.txt","w")
line="start"
s=0
while line:
    line = file.readline()
    if line!='':
        list=line.split(",")
        print (list[0])
        print ( len(list)/3)
        
out.close()
file.close()
