---
title: "CF1271D Portals 题解"
date: 2019-12-16 20:58:30
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "vflrpd4s"
source: "https://www.luogu.com.cn/article/vflrpd4s"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/vflrpd4s)。

在1:43时A掉了这一题，成功翻盘，rank34

---

题解：

贪心+dp

首先我们可以发现，如果一个城堡是可以被守卫的，那么，我们就会尽可能的让他往后被守卫。

为什么呢？

因为，如果在前面就守卫了，也许就会影响到后面的关卡过不去。而到了最后，如果你再不守卫的话，那么就没有机会了。但是如果到最后再守卫，造成的代价与之前一样，但是可以让他有更多的机会去进攻。

dp:

令dp[i][j]表示考虑到第i个城堡时，剩余了j个人时的最大成果。

```cpp
inline void solve(){
	cin>>n>>m>>k;
	for(int i=1;i<=n;++i)cin>>a[i]>>b[i]>>c[i];  //读入
	checkbad();                       //特判-1
	for(int i=1;i<=m;++i){
		int u,v;
		cin>>u>>v;
		lst[v]=max(lst[v],u);             //找最后
	}
	for(int i=1;i<=n;++i){
		lst[i]=max(lst[i],i);
		v[lst[i]].push_back(i);
	}
	for(int i=1;i<=n;++i)sort(v[i].begin(),v[i].end(),cmp);  //贪心
	for(int i=1;i<=n;++i)for(int j=0;j<=5000;++j)dp[i][j]=-INf; //初始化
	dp[1][k]=0;
	for(int i=1;i<=n;++i){
		for(int j=a[i];j<=5000;++j){
			dp[i+1][j+b[i]]=max(dp[i+1][j+b[i]],dp[i][j]);  //不选
			int sum=0,cnt=0;
			for(int f:v[i]){  //贪心的选
				sum+=c[f];
				++cnt;
				if(j+b[i]-cnt>=0)dp[i+1][j+b[i]-cnt]=max(dp[i+1][j+b[i]-cnt],dp[i][j]+sum);
				else break;   //优化
			}
		}
	}

```
