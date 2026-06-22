---
title: "P6823 「EZEC-4」paulzrm Loves Array 题解"
date: 2020-09-10 22:02:35
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "3pn95rno"
source: "https://www.luogu.com.cn/article/3pn95rno"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/3pn95rno)。

这里是官方题解

---

考虑到在所有的排序操作之后，之前的所有操作都会没有用。

所以我们只需要找到最后的一个排序操作后处理即可。

对于翻转，我们只需要设定一个变量$x$。

如果是正序，$x=0$，反之，$x=1$

如果翻转了，$x=1-x$

如果交换了：

当 $x=0$ 时 $swap(a[l],a[r])$

当 $x=1$ 时 $swap(a[n-l+1],a[n-r+1])$

最后输出即可。

Code:

```cpp
#include<iostream>
#include<cstdio>
using namespace std;
bool rev;
int ope[1000005];
int x[1000005],y[1000005];
int arr[1000005];
int main(){
	int n,m,lst;
	scanf("%d%d",&n,&m);
	for(int i=1;i<=n;++i)arr[i]=i;
	for(int i=1;i<=m;++i){
		scanf("%d",ope+i);
		if(ope[i]==3)scanf("%d%d",x+i,y+i);
	}
	for(lst=m;lst;--lst)if(ope[lst]==1 or ope[lst]==2)break;
	if(ope[lst]==2)rev=1;
	else rev=0;
	for(int i=lst+1;i<=m;++i){
		if(ope[i]==3){
			if(not rev)swap(arr[x[i]],arr[y[i]]);
			else swap(arr[n-x[i]+1],arr[n-y[i]+1]);
		}else rev=1-rev;
	}
	if(rev==0)for(int i=1;i<=n;++i)printf("%d ",arr[i]);
	else for(int i=n;i;--i)printf("%d ",arr[i]);
	return 0;
}
```
