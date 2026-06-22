---
title: "CF194A Exams 题解"
date: 2020-03-09 20:38:35
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "0p7umtp1"
source: "https://www.luogu.com.cn/article/0p7umtp1"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/0p7umtp1)。

没有python题解？我来水一发

直接暴力枚举有多少门得了两分，一个一个判断即可

```python3
n,k=map(int,input().split())
def check(x):
    tk=k-x*2
    tn=n-x
    return tn*3<=tk and tk<=tn*5 #注意是tn*3 因为剩下的科目至少3分
for i in range(0,n+1):    #python的循环是左闭右开
    if check(i):
        print(i)
        break

```
