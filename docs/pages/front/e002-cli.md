---
title: 打造前端脚手架
---

# 打造前端脚手架


## cli初识

##### cli应包含的内容

- 创建项目、组件、模块等通用流程
- git操作+构建+发布上线
- cli操作数据埋点收集

##### 核心价值

- 自动化(创建项目、组件、模块自动化)
- 标准化(项目目录等因人而异，cli可以实现工程的标准化、规范化)
- 数据化(研发过程系统化、数据化，使得研发过程可量化，需要cli接入elk等类似的日志系统)

##### 和CI/CD的区别

- jenkins、travis等在git hooks中触发，服务端执行，只能覆盖云构建的操作，无法覆盖本地的内容，例如创建项目、组件自动化，本地git操作自动化
- 定制复杂，CI/CD插件开发较复杂，cli开发的模式前端开发较熟悉上手会比较快



## cli基本原理

##### 脚手架的执行流程

脚手架本质是操作系统命令的执行，包括主命令、命令、命令参数、配置、配置参数5个部分

例如：

```javascript
vue create test-app --force true(默认值为true可不设置)
```

执行流程如下：

1. 输入命令
2. 解析出vue的主命令
3. 在环境变量中找到vue软链接对应的实际文件vue.js
4. 根据shell头部对应的语言来用不同的语言来执行文件，此处应该是node
5. vue.js解析command/options(create命令、--force配置及其参数)
6. vue.js执行command
7. 执行完毕或者执行异常，退出执行

##### 脚手架实现原理

我们可以通过3个问题来大致的了解脚手架如何来选择对应的语言来执行对应的命令及其对应的执行文件

- 安装的是@vue/cli为何执行命令是vue？是在package.json的bin参数中配置，配置vue命令及其指向文件的相对目录
- 全局安装@vue/cli的时候发生了什么？npm会通过ln命令生成一个软链接来对应package.json中bin参数设置的所有主命令及其文件
- 为什么可以直接通过node来执行vue.js而不需要指定node参数？因为vue.js首行通过#!/usr/bin/env node来指定了node来执行该文件，**env是指在环境变量中找到node来执行文件**