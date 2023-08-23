---
title: 前端面试八股文
---

[TOC]

# 前端面试八股文

**背就行了，不用太动脑子**

## html&&css

<details>
   <summary>1. 浏览器的渲染原理，渲染过程中遇到js又如何处理，css会阻挡js的解析吗？</summary>
   <code style="width: 100%;display:inline-block;">
   console.log(111)<br/>
   test111
   </code>
</details>
<details>
   <summary>2. css有哪些属性是可以继承的</summary>
   *问题2答案
</details>
<details>
   <summary>3. css选择器的优先级算法是怎么计算的？</summary>
   * 问题3答案
</details>
<details>
  <summary>4. 不知道是什么问题，随便弄的？</summary>
  <code>
  hahaha
  </code>
</details>

## js基础

1. 说一下js的数据类型都有哪些，哪些是栈（原始数据类型），哪些是堆类型(引用数据类型)，怎么检测一个数据的类型(typeof,instanceof, constructor实现)

2. 说一下数组有哪些原生的API，里面哪些是纯函数呢？

3. （场景题）两个有序的数组如何合并成新的有序数组？

4. 你是怎么理解js的原型和原型链这个概念的，原型链的终点是什么(**Object.prototype.\_\_proto\_\_**)？如何打印出原型链的终点？如何获得对象非原型链上的属性？

5. 下面这段代码解释一下是什么意思？

   ```javascript
   [].forEach.call($$("*"),function(a){
    　　a.style.outline="1px solid #"+(~~(Math.random()*(1<<24))).toString(16);
   })
   ```

6. 说一下xmlhttprequest向服务端发起请求到收到响应的全过程

7. 能说一下浏览器的同源策略吗，为什么会有这个机制？

8. 跨域是什么，如何解决？

9. 你知道哪些http的状态码，能说一下304的过程吗(未修改。所请求的资源未修改，服务器返回此状态码时，不会返回任何资源。客户端通常会缓存访问过的资源，通过提供一个头信息指出客户端希望只返回在指定日期之后修改的资源)?

10. 前端性能监控的时候，有一个概念就是白屏时间、首屏时间，如何量化？

11. canvas的常用api?

12. js延迟加载有哪些方式

13. > js 延迟加载，也就是等页面加载完成之后再加载 JavaScript 文件。
    >
    > js 延迟加载有助于提
    >
    > 高页面加载速度。
    >
    > * defer
    > * async属性
    > * 动态创建dom
    > * setTimeout延迟
    > * 让js最后加载

## vue基础

1. 简要说一下vue的响应式原理

2. 说下一下vue中常用的内置指令

3. vue这些MVVM框架都有个声明周期的概念，我想问的是在vue中，父子关系的组件，在组件挂载和更新的两个阶段，created，mounted，updated分别是怎么调用的

4. vue中参数是怎么传递的，父子、子子或者全局的数据的透传都可以说一下？

5. 使用 Vuex 只需执行 Vue.use(Vuex)，并在 Vue 的配置中传入一个 store 对象的示例，store 是如何实现注入的？

   > Vue.use(Vuex) 方法执行的是 install 方法，它实现了 Vue 实例对象的 init 方法封装和注入，使传入的 store 对象被设置到 Vue 上下文环境的store中。因此在VueComponent任意地方都能够通过this.store 访问到该 store。

6. $nextTick这个api使用场景是什么？知道原理吗？

7. vue中怎么实现路由的拦截，简单点说就是vue-router有哪些守卫函数？

8. 做过哪些性能优化的工作

9. vue中如何实现逻辑复用的，有哪些方式？

9. vue3或者react、react-hook有使用过吗，说下一下和vue2的差别呢，可以从响应式、逻辑复用

## react基础

1. react的事件和普通的HTML事件有什么不同？
2. 哪些方法会触发react重新渲染，重新渲染render会做些什么？
3. react refs的作用，有哪些应用场景，可以在render阶段访问refs吗？
4. React.forwardRef是什么，它有什么作用？
5. react的插槽Portals有什么使用场景？
6. react的setState批量更新的过程是什么，第二个参数作用是什么，replaceState这个api与其有什么区别?
7. React-redux的state是怎么注入到组件中的，从reducer到组件经历了什么样的过程？
8. React16.x中props改变后在哪个生命周期处理，getDerivedStateFromProps
9. react性能优化在哪个生命周期，shouldComponentUpdate，
10. shouldComponentUpdate提供了两个参数nextProps和nextState，表示下一次props和一次state的值，当函数返回false时候，render()方法不执行，组件也就不会渲染，返回true时，组件照常重渲染。此方法就是拿当前props中值和下一次props中的值进行对比，数据相等时，返回false，反之返回true。需要注意，在进行新旧对比的时候，是**浅对比，**也就是说如果比较的数据时引用数据类型，只要数据的引用的地址没变，即使内容变了，也会被判定为true。
11. react组件间怎么通信
12. react-router的实现原理

## 常用手写题

## 易混淆题

## 算法

## 其他

1. 前端工程化的相关工作有接触过吗？
2. 平常你做项目的过程中，你觉得最有挑战性的事情或者说是你做的最好的点，能跟我说一下吗？
3. 有什么想问我的吗？

## Q&A

<details>
   <summary>问题1</summary>
   *问题1答案1-1
   * 问题1答案1-2
</details>

<details>
   <summary>问题2</summary>
   问题2答案
</details>
