title: tailwindcss使用指南

[TOC]

# tailwindcss

> 该模板旨在搭建一个符合前端开发习惯的flutter移动端模板

## 目录

1. 核心概念
2. 定制
3. 布局

## 核心概念

## 伪类修饰符

通过修饰符来代替css的伪类，{modifier}:{styleCode}

```html
<button class="hover:bg-red-500">
  
</button>
```

breakpoint css

响应式的断点

pseudo-class and pseudo-class modifiers

### 自身伪类

```html
<button class="md:dark:focus:bg-red-600">
  test
</button>
```



### 父级元素状态

基于父状态的样式group and group-{modifier}

When you need to style an element based on the state of some *parent* element, mark the parent with the `group` class, and use `group-*` modifiers like `group-hover` to style the target element:

### 嵌套组伪类

Differentiating nested groups(组的嵌套)

When nesting groups, you can style something based on the state of a *specific* parent group by giving that parent a unique group name using a `group/{name}` class, and including that name in modifiers using classes like `group-hover/{name}`:

### Arbitrary groups(hasClass('xxx'))

group-[.xxx] xxx就是group有的其他class name

### 兄弟元素状态(sibling state)

peer and peer-{modifier}组合使用，例如下面的表单校验的错误信息提示

> 注意：It’s important to note that the `peer` marker can only be used on *previous* siblings because of how the [general sibling combinator](https://developer.mozilla.org/en-US/docs/Web/CSS/General_sibling_combinator) works in CSS.Only previous siblings can be marked as peers

```html
<form>
  <label class="block">
    <span class="block text-sm font-medium text-slate-700">Email</span>
    <input type="email" class="peer ..."/>
    <p class="mt-2 invisible peer-invalid:visible text-pink-600 text-sm">
      Please provide a valid email address.
    </p>
  </label>
</form>
```

### 多个兄弟元素

通过peer/{name}来区分

### 自定义兄弟元素类名

peer-[.{className}]

看着自己的分数他笑了，意料之中的100分满分

## 伪元素(pseudo-elements)
