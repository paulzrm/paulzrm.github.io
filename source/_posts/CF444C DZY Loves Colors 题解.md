---
title: "CF444C DZY Loves Colors 题解"
date: 2020-03-30 18:18:51
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "pehaxfzi"
source: "https://www.luogu.com.cn/article/pehaxfzi"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/pehaxfzi)。

这题线段树、珂朵莉树的题解都有了，我来个分块吧/cy

分块维护每一个块内的状况，如果遇到整块涂色则打上标记，可以将时间复杂度保持在$O(n\sqrt{n})$

```cpp
#include<bits/stdc++.h>
#define ll long long
#define mp make_pair
using namespace std;
const int mxn=1e5+5;
ll n,m,sn,a[mxn],b[mxn],ta[444],sb[444],tb[444],ans,th,tl,tr;
int main(){
	ios_base::sync_with_stdio(false),cin.tie(0),cout.tie(0);
	cin>>n>>m,sn=sqrt(n);
	for(int i=0;i<n;++i)a[i]=i+1;   //初始状况
	for(;m--;){
		int tmp,l,r;cin>>tmp>>l>>r,--l,--r;
		if(tmp==1){
			int x;cin>>x;
			for(int i=l;i<=r;){   //分块处理
				th=i/sn,tl=th*sn,tr=min(tl+sn,n);
				if(i==tl and r>=tr-1){
					if(ta[th])tb[th]+=abs(ta[th]-x),sb[th]+=abs(ta[th]-x)*(tr-tl);    //可以整体覆盖
					else for(int i2=tl;i2<tr;++i2)b[i2]+=abs(a[i2]-x),sb[th]+=abs(a[i2]-x);  //一个一个来
					ta[th]=x,i=tr;
				}else{
					if(ta[th]){
						for(int i2=tl;i2<tr;++i2)a[i2]=ta[th];
						ta[th]=0;
					}
					b[i]+=abs(a[i]-x),sb[th]+=abs(a[i]-x),a[i]=x,++i;
				}
			}
		}else{
			ans=0;
			for(int i=l;i<=r;){  //分块求和
				tl=i/sn*sn,tr=min(tl+sn,n),th=i/sn;
				if(i==tl and r>=tr-1)ans+=sb[th],i=tr;
				else ans+=tb[th]+b[i],++i;
			}
			cout<<ans<<endl;
		}
	}
	return 0;
}
```
