---
title: "CF464D World of Darkraft - 2 题解"
date: 2022-02-19 19:47:29
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "z7qabciy"
source: "https://www.luogu.com.cn/article/z7qabciy"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/z7qabciy)。

题目大意：

一款游戏中有 $k$ 种装备，你一开始每种装备各有 $1$ 个，且每种装备的初始等级均为 $1$。游戏中可以靠打怪来获取新装备，总共有 $n$ 只怪兽，每打赢 $1$ 只怪兽后会随机获得一种装备 $a \in [1,k]$。假设原有的 $a$ 装备的等级为 $t$，那么新获得的装备的等级为 $[1,t+1]$，且你会将新获得的装备和原来的装备中等级较高的装备留下，等级较低的装备卖出，卖出可获得的金币为该装备的等级。 问打完这 $n$ 只怪兽后，获得的金币的期望。

$1 \le n \le 10^5, 1 \le k \le 100$

题解：

期望 dp

观察到这 $k$ 种装备都是“一样”的，所以我们可以随便选择一种装备来考虑它在打这 $n$ 个怪兽时是如何变化的，然后对答案乘上 $k$ 就可以了。

令 $dp_{i,j}$ 表示考虑到 **还剩** $i$ 个怪兽没打，且此时装备的等级为 $j$ 时的期望答案。

为什么是 **还剩** $i$ 个怪兽，而不是 **打了** $i$ 个怪兽呢？因为如果我们如果设计是**打了** $i$ 个怪兽的话，每次往后转移的时候还要考虑到这种情况出现的概率，不好处理。而如果从后往前转移的话，就避免了复杂的计算。

**这个trick在期望题中很常用**

考虑转移。

+ 正好拿到了这种装备，而且等级为 $j+1$

卖掉了原有的等级为 $j$ 的装备，可能性为 $\frac{1}{k\times(j+1)}$，收益为 $j$

+ 拿到了这种装备，但等级不为 $j+1$

那就相当于拿到了又卖了

可能性为 $\frac{j}{(j+1)\times k}$，收益为 $\frac{\sum\limits_{f=1}^{j}f}{j}=\frac{j\times(j+1)}{2\times j}=\frac{j+1}{2}$

+ 拿到了其它装备

可能性为 $\frac{k-1}{k}$，对其它装备有影响，而对这个装备的收益为 $0$

但发现这个方程的转移是 $O(n^2)$ 的，无法通过。

你想了想，发现这题要求输出的是**小数**，就打算在这上面动心思。

考虑每一次升级的概率。

从 $j$ 级升到 $j+1$ 的期望次数为 $k\times(j+1)$，所以从 $1$ 级升到 $j+1$ 级的期望次数为 $\sum\limits_{f=1}^{j}k\times(j+1)=k\times\sum\limits_{f=1}^{j}f=\frac{k\times j \times (j+1)}{2}$

发现到了后面就很大可能不会再升级了。

所以，我们可以假定一个最大等级 $l=1000$，当达到最大等级后就不再升级，这样也是在误差范围内的。

Code:
```cpp
using namespace std;
int n;
#define ld long double
ld dp[2][1005],k; //滚动了下，防炸空间
inline void solve(){
	cin>>n>>k;
	int cur=0,pre=1;
	for(int i=1;i<=n;++i){
		for(int j=1;j<=1000;++j){
			dp[cur][j]=0;
			dp[cur][j]+=(dp[pre][j+1]+j)/(j+1)/k;
			dp[cur][j]+=(dp[pre][j]+(j+1.0)/2.0)*1.0*j/k/(1.0*(j+1));
			dp[cur][j]+=(dp[pre][j])*(k-1)/k;
		}
		swap(cur,pre);
	}
	cout<<fixed<<setprecision(9)<<dp[pre][1]*k<<'\n';
}
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	int T=1;
	//cin>>T;
	for(;T--;)solve();
	return 0;
}
```
