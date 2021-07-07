---
title: Docker基础
---

## Docker入门教程

[阮一峰的Docker入门教程](https://www.ruanyifeng.com/blog/2018/02/docker-tutorial.html)

[Docker私有仓库push](https://www.cnblogs.com/lph970417/p/12121011.html)

## Docker基础命令总结

登录私有Docker镜像仓库

``` shell
docker login -u {userName} -p {password} {domainName}
```

拉取镜像(需要先在客户端配置registry-mirrors包含私有镜像仓库，然后再执行拉取命令)

``` shell
{
  "registry-mirrors":  ["https://aijuoso5.mirror.aliyuncs.com"]
}

docker pull {imageName}
```

拉取镜像之后就可以在本地查看local镜像

``` shell
docker image ls
```

镜像需要run或者start之后才可以在容器中查看,下面的8888是宿主机的端口号，80是镜像expose的端口号，一般前端项目基础镜像是nginx的alpine版本(nginx:1.13.12-alpine),需要expose 80端口,name可以不指定由Docker service自动生成

``` shell
docker run --name {containerName}  -p 8888:80 -d {imageName}
```

查看local容器

``` shell
docker container ls 或者 docker ps
```

Docker镜像打包,后面的点是Dockerfile所在路径

``` shell
docker build -t {imageName} .
```

Docker镜像发布,发布到私有镜像仓库需要修改docker的配置文件，然后再push，如果不修改配置文件，会push到Docker官方的hub上，开源的比较流行的Docker私有镜像仓库有harbor，其仓库配置文件为harbor.yml，修改其内容，restart即可

``` shell
docker push {imageName}
```

一般前后端分离的项目Dockerfile如下，daemon配置项的意思是执行daemon进程，让其脱离terminal执行，这样子关闭terminal也不会结束进程，另外还可以配置.dockerignore文件，让docker忽略对应文件或目录，在打包镜像的时候提高检索效率

``` shell
FROM nginx:1.13.12-alpine
COPY dist/ /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
