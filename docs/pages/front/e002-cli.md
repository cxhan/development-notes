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



## cli可以实现的内容



- 命令行交互（条件分支选择）
- 网络通信（根据选择模板的不同去拉取不同的仓库代码）
- 文件操作（根据用户输入实现不同的文件修改）



## cli本地调试方法

1. 脚手架主体拆分成多个包
2. 在lib项目中执行命令npm link
3. 在cli项目中执行命令npm link {libName}来链接本地库
4. 在package.json的引用中手动添加项目名称和版本号，否则上线之后无法install
5. 项目publish前在lib、cli项目中都要unlink调试的项目



## cli命令注册和参数解析

我们一般都是通过node的process库来获取命令行的输入内容来完成cli参数配置的解析

```js
const argv = require('process').argv
const lib = require('my-cli-lib')
const command = argv[2]
const options = argv.slice(3)
if(options.length > 1) {
  let [option, param] = options
  option = option.replace('--', '')
  if(lib[command]) {
    lib[command].call(this, {option, param})
  }
}
```



> 自研cli不通过包管理的话，各个分包之间 调试和版本管理都会遇到各种问题，所以一般研发中我们都通过lerna来管理多package的npm项目

## lerna管理npm项目



##### 为什么要用lerna

- 避免重复操作，本地调试npm link的多层嵌套
- 多package的依赖安装、代码提交、代码发布
- 保持package的版本一致性

##### lerna常用操作

1. npm init -y（项目初始化）

2. npm install -g lerna（安装lerna，也可以不全局安装，只install到项目中）

3. lerna init（初始化之后要修改lerna.json，配置npm私服publish的信息）

   ```json
   {
     "packages": [
       "packages/*"
     ],
     "version": "0.0.1",
     "npmClient": "npm",
     "command": {
       "publish": {
         "ignoreChanges": [
           "ignored-file",
           "*.md"
         ],
         "message": "chore(release): publish",
         "registry": "https://registry.npm.taobao.org"
       },
       "bootstrap": {
         "ignore": "component-*",
         "npmClientArgs": [
           "--no-package-lock"
         ]
       }
     }
   }
   
   ```

   

4. Lerna create {packageName}

   > packageName是指packages目录中的包对应package的文件名，libName是指需要安装的三方包的名字

5. lerna add {libName}  /packages/{packageName}（将包安装到指定的package目录，不指定则是所有package都安装该包）

6. lerna bootstrap(重新安装依赖包)

7. lerna clean(移除packages中的依赖项)

8. lerna version

9. lerna publish（publish的时候可能会遇到git的各种问题，建议在项目初期先排错解决问题之后再进行之后的开发）



*以上就是开发前端脚手架需要的基础知识，下面我们来进行脚手架的设计和具体的开发。*



## 脚手架设计

