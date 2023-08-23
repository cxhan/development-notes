---
title: Web页面录屏实现
---

[TOC]

# Web页面录屏实现

## IndexedDB API

1. 记录首屏的dom，通过mutation observer监听dom的变化

2. 虚拟dom模拟视频

3. 记录鼠标的坐标位置，组合鼠标，虚拟dom模拟页面录屏

   

##### 获取db容器

```javascript
// 参数1：数据库名称，参数2：数据库版本
const request = window.indexedDB.open("mydb", 1)
```



##### objectStore

objectStore是indexedDB的核心，类似于SQL数据库中的表，存放着所有数据记录，包含key和value，key是数据库的主键，不设置默认为id，默认自动生成，也可以自定义，具体规则如下：

| 键路径 (`keyPath`) | 键生成器 (`autoIncrement`) | 描述                                                         |
| :----------------- | :------------------------- | :----------------------------------------------------------- |
| No                 | No                         | 这种对象存储空间可以持有任意类型的值，甚至是像数字和字符串这种基本数据类型的值。每当我们想要增加一个新值的时候，必须提供一个单独的键参数。 |
| Yes                | No                         | 对象型仓库：这种对象存储空间只能持有 JavaScript 对象。这些对象必须具有一个和 key path 同名的属性 |
| No                 | Yes                        | 非对象型仓库：这种对象存储空间可以持有任意类型的值。键会为我们自动生成，或者如果你想要使用一个特定键的话你可以提供一个单独的键参数 |
| Yes                | Yes                        | 混个仓库：这种对象存储空间只能持有 JavaScript 对象。通常一个键被生成的同时，生成的键的值被存储在对象中的一个和 key path 同名的属性中。然而，如果这样的一个属性已经存在的话，这个属性的值被用作键而不会生成一个新的键。 |

```javascript
// onupgradeneeded会在数据库初始化和版本改变的时候调用
request.onupgradeneeded = (e) => {
  const db = e.target.result
  // 如果之前未创建过mystore则创建mystore存储控件，主键为id
  if (!db.objectStoreNames.contains('mystore')) {
    db.createObjectStore('mystore', { keyPath: 'id' , autoIncrement: true})
  }
}
```



##### index

index即索引，可以理解为一个特殊的objectStore，存储结构和原本的objectStore基本一致，不过keyPath是索引标记的字段，通常用于快速查询数据，不建议大量使用，会占用很多存储。

index依附于objectStore。我们在创建索引时，首先要得到一个objectStore，再在这个objectStore的基础上创建一个索引。一个objectStore可以有多个索引。index中的一条记录自动和 objectStore中的对应记录绑定，当objectStore中的记录发生变化时，index中的记录会自动被污染（自动更新），但要注意在存储中并不是占用的同一内存，只是在内部实现了同步更新，和同步失败的自动回滚。

```javascript
let objectStore = db.createObjectStore('mystore', { keyPath: 'id' , autoIncrement: true})
// 参数1：索引名称，参数2：索引path，unique标记是否唯一
objectStore.createIndex('name','name',{ unique: false })

// 如果要在下次初始化的时候删除没必要的索引，通过objectStore.indexNames实现
const store = db.transaction("mystore", "readwrite").objectStore("mystore");
const indexNames = store.indexNames
if (indexNames.contains('name')) {
  store.deleteIndex('name')
}
```



##### transaction

上面用到的`transaction`就是事务，是用来想数据库提示操作请求的处理程序第一个参数可以是字符串也可以是数组，表明想要操作的存储空间，第二个参数表明操作的类型是readonly或者readwrite。

需要注意的是一次数据库的连接中调用事务处理函数，一旦执行完成，在下一次时间循环开始之前，事务的生命周期就结束了会被释放掉，所以下一次操作必须要重新连接数据库。

譬如，页面上有一个按钮，点击会往数据库中添加数据，具体操作应该如下:

```javascript
btn.onclick = function() {
  var request = indexedDB.open('mydb', 1)
  requst.onsuccess = function(e) {
    var db = e.target.result
    var tx = db.transaction(["mystore"],"readwrite")
    var objectStore = tx.objectStore("mystore")
    var addRequest = objectStore.add({ ... }) 
  }
}
```

##### cursor

cursor是一个迭代器，标记是否有符合条件的索引记录或者objectStore记录，通过openCursor()和openKeyCursor()方法调用

```javascript
let result = [];
index.openCursor().onsuccess = function(event) {
  var cursor = event.target.result;
  if(cursor) {
    if(cursor.value.name.startsWith('xxx')) {
      result.push(cursor.value);
    }
    cursor.continue();
  } else {
    console.log("没有更多记录了!");
    console.log(result);
  }
}
```

openCursor方法可以传入两个参数，第一参数是一个`IDBKeyRange`对象，标记游标的范围，第二个参数是查询的顺序

```javascript
// IDBKeyRange only(3) // 等于3
// IDBKeyRange.lowerBound(1, false) // 大于等于1
// IDBKeyRange.upperBound(3, false) // 小于等于3
// IDBKeyRange.bound(1, 3, false, true) // 大于等于1，小于3
var range = IDBKeyRange.only('xxx');
// 第二个参数是游标的方向，可以是next，nextunique，prev，prevunique，默认是next，prev是从最后一个数据开始遍历就是倒叙遍历，range可以为null即不对数据做筛选
index.openCursor(range, 'prev').onsuccess = function(event) {
  var cursor = event.target.result;
  if(cursor) {
    console.log('逆序查询所有name为xxx的数据：', cursor.value);
    cursor.continue();
  } else {
    console.log("没有更多记录了!");
  }
}
```



##### 数据库CRUD

**查询数据**

```javascript
// 通过主键查询匹配的第一条数据
var queryRequest1 = objectStore.get(1);
// 通过索引查询匹配的第一条数据
var queryRequest2 = objectStore.index('name').get('MyName');
// getAll查询所有匹配的记录
objectStore.getAll().onsuccess = function(event) {
  alert("get all data: " + event.target.result);
};
// 也可以通过游标来遍历数据，但是查看游标的 `value` 属性会带来性能消耗，因为对象是被懒生成的。当你使用 `getAll()` ，浏览器必须一次创建所有的对象。如果你仅仅想检索某个键，那么使用游标将比使用 `getAll()` 高效得多。当然如果你想获取一个由对象仓库中所有对象组成的数组，请使用 `getAll()`。
```

**更新数据**

```javascript
// 通过objectStore.get查询到数据之后修改data
data.age = 18;
var putRequest = objectStore.put(data);
putRequest.onsuccess = function(event) {
  console.log("修改数据成功")
}
```

**删除数据**

```javascript
// 删除主键id为1的数据
var deleteRequest = logObjectStore.delete(1);
deleteRequest.onsuccess = function(event) {
  console.log("删除数据成功");
}
```

**添加数据**

```javascript
var addRequest = logObjectStore.add(item);
addRequest.onsuccess = function(event) {
  console.log("数据添加成功");
}
```



> 由于原生的indexedDB代码复杂度太高，而且回调的嵌套不方便使用，所以建议最好使用封装库，目前比较流行的库有`dexie.js`

## Dexie.js

sdk负责收集错误，设置默认的indexedDB上报方式

- 原生所有操作都是在回调中进行的
- 原生所有操作都需要不断地创建事务，判断表和索引的存在性
- 原生为表建立索引很繁琐
- 原生查询支持的较为简单，复杂的查询需要自己去实现
- 原生不支持批量操作
- 原生的错误需要在每个失败回调中接收处理



```javascript
function getExplore(){
  var Sys = {};  
  var ua = navigator.userAgent.toLowerCase();  
  var s;  
  (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
  (s = ua.match(/msie ([\d\.]+)/)) ? Sys.ie = s[1] :  
  (s = ua.match(/edge\/([\d\.]+)/)) ? Sys.edge = s[1] :
  (s = ua.match(/firefox\/([\d\.]+)/)) ? Sys.firefox = s[1] :  
  (s = ua.match(/(?:opera|opr).([\d\.]+)/)) ? Sys.opera = s[1] :  
  (s = ua.match(/chrome\/([\d\.]+)/)) ? Sys.chrome = s[1] :  
  (s = ua.match(/version\/([\d\.]+).*safari/)) ? Sys.safari = s[1] : 0;  
  // 根据关系进行判断
  if (Sys.ie) return ('IE: ' + Sys.ie);  
  if (Sys.edge) return ('EDGE: ' + Sys.edge);
  if (Sys.firefox) return ('Firefox: ' + Sys.firefox);  
  if (Sys.chrome) return ('Chrome: ' + Sys.chrome);  
  if (Sys.opera) return ('Opera: ' + Sys.opera);  
  if (Sys.safari) return ('Safari: ' + Sys.safari);
  return 'Unkonwn';
}
```



错误统计：

统计总数

折线图查询近2个星期的错误数量统计



列表需要展示字段



设备信息：

浏览器

js引擎

操作系统

设备



位置信息

ip、地点、运营商



其他信息

appid、appversion、ua信息



概要信息

时间、类型、title就是message、url（发生报错的location）

资源信息

非通用





### 参考资料：

[1] https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API

[2] https://github.com/dexie/Dexie.js

[3] https://www.tangshuang.net/3735.html