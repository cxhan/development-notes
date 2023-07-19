---
title: monitor系统设计
---

[TOC]

## 前端监控平台

### 背景

最近要做一个前端监控平台，可以实现业务系统的前端错误自动上报和收集，后续还可以接入前端埋点用于业务分析。

针对这个需求就要设计一套完整的系统架构，大致的子系统如下：

### 子系统

```mermaid
flowchart TB
A(monitor-system)-->B1(js-sdk)
A-->B2(indexedDB)
A-->B3(web-component)
B1-->C1(xhr/fetch)
B1-->C2(js-error)
B1-->C3(static)
B2-->D1(crud)
B2-->D2(openapi)
B3-->E1(ui-widget)
```



### js-sdk（如何收集监控的信息）

日志的上报是有讲究的，不能一有信息就上报这样子如果收集的信息多了就相当于自造了DDOS攻击，所以日志上报的方式最好是先本地存储再择机上报或者直接本地分析日志，这才是好的日志系统需要做到的



### indexDB（监控信息怎么存储和上报，本地版本）

```mermaid
sequenceDiagram
participant client
participant sdk
participant indexedDB
participant sdk-ui

par 并行发生
	client ->> client : 客户端运行
	
and
	sdk ->> client : 监听客户端
end
rect rgb(191, 223, 255)
client ->> client : 客户端运行中
rect rgb(200, 150, 255)
sdk -->>  client : 监听错误发生
end
end

note over sdk : 监听到错误发生
sdk ->> indexedDB : 存储日志到
Note left of 老板A : 对钱不感兴趣
Note right of 员工A : 对钱很有兴趣
Note over 老板A,员工A : 对996感兴趣
老板A ->> 员工B : 666
员工B --x 老板A : 888
loop 每天7问
员工B ->> + 老板B : 求加薪
老板B ->> - 员工B : 马上就加
end
alt 请求<2次
    老板B ->> 员工B : 不可能加钱
else 请求>=2
    老板B ->> 员工B : 让我想一想
end
opt 永不可能
    老板B -->> 员工B : Say No
end
par 并行摸鱼
    员工B ->> 员工B : 不加薪就摸鱼
and
    员工B ->> 员工B : 加薪就撩妹
end
```

### 性能测试

上报1w条日志需要的存储大小和时间，平均耗时，查询需要耗费的时间，因为只是日志分析的系统只涉及indexedDB的插入和查询，不涉及修改，但是要定时删除过期的日志，而且要控制存储的规模所以对定性有一定的考量，这里一定要仔细考虑清楚才行。

### nestjs（后端版本）



https://www.w3.org/TR/IndexedDB/

https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API/Using_IndexedDB

https://sentry.io/welcome/
