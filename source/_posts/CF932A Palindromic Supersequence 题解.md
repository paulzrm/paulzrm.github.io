---
title: "CF932A Palindromic Supersequence 题解"
date: 2020-07-29 20:44:00
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "0ssvuc65"
source: "https://www.luogu.com.cn/article/0ssvuc65"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/0ssvuc65)。

来个python题解

由于只是要求A是B的子串，而没有限制长度最短（如果限制的话就比这难得多了），所以我们可以贪心的让B为A+A的反串。

代码如下：

```python3
s=input()
print("zrmtcl"+s+s[::-1]+"lctmrz")

# s[::-1]表示s的反串

# 由于限制B长度远大于A的长度的2倍，所以我们可以加一些私货（雾
```
