---
title: indexed使用
---

[TOC]

# indexedDB使用

> 以下是indexedDB原生api的初步使用，包括`数据库创建、打开、事务处理、CRUD、游标、索引`的使用

```javascript
if (!("indexedDB" in window)) {
  console.warn("This browser doesn't support IndexedDB");
  return;
}

// open 请求不会立即打开数据库或者开始一个事务
var request = window.indexedDB.open("LogDatabase", 1);
var db;

// 初始化数据库或者数据库版本更新时调用
request.onupgradeneeded = function(event) {
  db = event.target.result;

  // FOCUS 如果表已经存在，先删除表，也可以在删除前先格式化表中的数据方便数据迁移
  if(db.objectStoreNames.contains("log")) {
    db.deleteObjectStore("log");
  }

  // 创建一个名为log的表
  var objectStore = db.createObjectStore("log", {
    keyPath: "id", // 主键key,可以理解为默认的查询索引
    autoIncrement: true // 是否为该仓库开启键生成器
  });

  /**
   * @important 创建索引用于快速查询，但是会占用更多的空间，所以不要滥用索引
   * @param {string} log_type 日志类型索引
   * @param {string} create_time 创建时间索引
   */
  objectStore.createIndex("log_type", "log_type", { unique: false });
  objectStore.createIndex("create_time", "create_time", { unique: false });

  // MOCK 初始化到表中的数据
  const logData = [
    {
      app_id: 'test1',
      app_version: 'v1.0.0',
      location: location.href,
      user_agent: navigator.userAgent,
      screen: { width: window.screen.width, height: window.screen.height },
      auto_report: true,
      log_type: 'js-error',
      create_time: new Date().getTime(),
      log_message: new Error('js-error-1').message,
      log_stack: new Error('js-error-1').stack
    },
    {
      app_id: 'test1',
      app_version: 'v1.1.0',
      location: location.href,
      user_agent: navigator.userAgent,
      screen: { width: window.screen.width, height: window.screen.height },
      auto_report: true,
      log_type: 'promise-error',
      create_time: new Date().getTime(),
      log_message: new Error('promise-error-1').message,
      log_stack: new Error('promise-error-1').stack
    },
    {
      app_id: 'test2',
      app_version: 'v1.0.0',
      location: location.href,
      user_agent: navigator.userAgent,
      screen: { width: window.screen.width, height: window.screen.height },
      auto_report: true,
      log_type: 'js-error',
      create_time: new Date().getTime(),
      log_message: new Error('js-error-2').message,
      log_stack: new Error('js-error-2').stack
    },
    {
      app_id: 'test3',
      app_version: 'v1.0.0',
      location: location.href,
      user_agent: navigator.userAgent,
      screen: { width: window.screen.width, height: window.screen.height },
      auto_report: true,
      log_type: 'unknown-error',
      create_time: new Date().getTime(),
      log_message: new Error('unknown-error').message,
      log_stack: new Error('unknown-error').stack
    }
  ]
  // 使用事务的oncomplete事件确保在插入数据前对象仓库已经创建完毕
  objectStore.transaction.oncomplete = function(event) {
    var logObjectStore = db.transaction("log", "readwrite").objectStore("log");
    logData.forEach(item => {
      var addRequest = logObjectStore.add(item);
      addRequest.onsuccess = function(event) {
        console.log("数据添加成功");
        var queryRequest = logObjectStore.get(1);
        queryRequest.onsuccess = function(event) {
          var data = event.target.result;
          console.log("查询数据成功，数据为: " + JSON.stringify(data));
          // 要修改数据，必须先查询到数据，然后再修改
          data.app_version = 'v1.2.0';
          var putRequest = logObjectStore.put(data);
          putRequest.onsuccess = function(event) {
            console.log("修改数据成功")
            var deleteRequest = logObjectStore.delete(4);
            deleteRequest.onsuccess = function(event) {
              console.log("删除数据成功");
            }
          }
        }
      }
      addRequest.onerror = function(event) {
        console.log("添加数据失败，失败原因: " + event.target.errorCode);
      }
    });
  }
}

// onupgradeneeded调用成功后会执行onsuccess回调
request.onsuccess = function(event) {
  db = event.target.result;
  var store = db.transaction("log", "readonly").objectStore("log");
  var index = store.index("log_type");
  var result = [];
  // index.get()方法只能查询到符合条件的第一条数据
  index.get('js-error').onsuccess = function(event) {
    console.log('index.get js-error ======', event.target.result);
  }
  // 想要查询所有符合条件的数据，应该使用游标遍历查询数据
  // openCursor()方法会返回一个游标对象，游标对象会遍历所有的数据。可以通过store的openCursor()方法来遍历所有的数据，可以通过index的openCursor()方法来遍历索引的数据
  index.openCursor().onsuccess = function(event) {
    var cursor = event.target.result;
    if(cursor) {
      // 查询所有的js-error类型的日志
      // FOCUS 查看游标的 value 属性会带来性能消耗，因为对象是被懒生成的。当你使用 getAll() ，浏览器必须一次创建所有的对象。如果你仅仅想检索 m 键，那么使用游标将比使用 getAll() 高效得多。当然如果你想获取一个由对象仓库中所有对象组成的数组，请使用 getAll()。
      if(cursor.value.log_type === 'js-error') {
        result.push(cursor.value);
      }
      cursor.continue();
    } else {
      console.log("No more entries!");
      console.log(result);
    }
  }
  // 使用IDBKeyRange对象指定游标的范围和方向
  // IDBKeyRange only(3) // 等于3
  // IDBKeyRange.lowerBound(1, false) // 大于等于1
  // IDBKeyRange.upperBound(3, false) // 小于等于3
  // IDBKeyRange.bound(1, 3, false, true) // 大于等于1，小于3
  var range = IDBKeyRange.only('js-error');
  // openCursor第一个参数是一个IDBKeyRange对象，第二个参数是游标的方向，可以是next，nextunique，prev，prevunique，默认是next，prev是从最后一个数据开始遍历就是倒叙遍历，range可以为null即不对数据做筛选
  index.openCursor(range, 'prev').onsuccess = function(event) {
    var cursor = event.target.result;
    if(cursor) {
      console.log('逆序查询所有日志类型未js-error的日志：', cursor.value);
      cursor.continue();
    } else {
      console.log("No more entries!");
    }
  }
  store.openCursor().onsuccess = function(event) {
    var cursor = event.target.result;
    if(cursor) {
      console.log('cursor value ======', cursor.value);
      cursor.continue();
    } else {
      console.log("No more entries!");
    }
  }
  // openKeyCursor用于获取主键指针对象，主键指针对象是一个只读的对象，只有一个属性key，用于获取主键的值
  store.openKeyCursor(IDBKeyRange.only(2)).onsuccess = function(event) {
    var cursor = event.target.result;
    if(cursor) {
      console.log('主键指针遍历 ====== ', cursor.key);
      cursor.continue();
    } else {
      // 主键指针对象遍历结束
    }
  }
}

request.onerror = function(event) {
  console.error("IndexedDB error: " + event.target.errorCode);
}

// onblocked事件会在另一个页面已经打开了数据库，而且数据库的版本号比当前页面的版本号高时触发
request.onblocked = function(event) {
  console.error("IndexedDB blocked: " + event.target.errorCode);
}

```

