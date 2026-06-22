---
title: "AT_arc028_4 [ARC028D] 注文の多い高橋商店 题解"
date: 2023-01-31 17:25:50
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "vqnuf0az"
source: "https://www.luogu.com.cn/article/vqnuf0az"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/vqnuf0az)。

[link](https://www.luogu.com.cn/problem/AT_arc028_4)

题目大意：

给定 $n$，$m$。有 $n$ 种商品，编号从 $1$ 到 $n$，第 $i$ 种商品最多能拿 $a_i$ 个。

共 $q$ 次询问。每次询问给定 $k$，$x$，求第 $k$ 种商品 **恰好** 拿走 $x$ 个的前提下，在 $n$ 种商品中一共拿走 $m$ 个商品的方案数。两种方案不同当且仅当存在一种商品在二方案中被拿走的个数不同。输出答案对 $10^9+7$ 取模的结果。

- $1 \leq n,m,a_i \leq 2\times 10^3$

- $1\leq k\leq n$

- $1\leq x\leq a_k$

部分分是 $1 \le n,m,q \le 100$ 和 $1 \le n,m \le 100$。

题解：

部分分是基础 $dp$。

令 $dp_{i,j}$ 表示考虑到第 $i$ 种物品，当前已经选了$j$ 个时的方案数。转移为 $dp_{i+1,j}=\sum\limits_{\max(0,j-a_i)}^{j} dp_{i,j}$。

然后每次询问暴力求一遍 dp，可以拿到第一个部分分。

然后我们可以发现第二个部分分中 $n$ 小 $q$ 大，就可以考虑预处理出所有询问要恰好拿走的商品 id 做最后一个物品的 dp 数组（很容易发现这些商品之间的顺序无关紧要），就可以了。预处理复杂度 $O(n^2m)$。

正解还是要看到这个商品之间的顺序无关紧要。

再观察这个转移式子，$dp_{i+1,j}=\sum\limits_{\max(0,j-a_i)}^{j} dp_{i,j}$。

考虑反过来由 $dp_{i+1}$ 推向 $dp_{i}$，会有什么效果？

$dp_{i,j}$ 相当于 $dp_{i+1,j}-dp_{i+1,j-1}$ 再加上 $dp_{i,j-a_{i}-1}$（如果 $j \ge a_{i}+1$）。

再根据商品之间无关紧要，$dp_{n+1}$ 这个数组为考虑完全部的 $n$ 个物品之后得到的 dp 值，前面商品的顺序再怎么换也不会影响到它，所以我们可以枚举假设最后一个选的是 $i$ 号物品，$O(m)$ 的倒推即可。总时间复杂度 $O(nm+q)$。

---

Code:

```cpp
#include<bits/stdc++.h>
using namespace std;
const int mxn=2005;
const int md=1000000007;
inline void add(int&x,int y){
	x+=y;
	if(x>=md)x-=md;
}
inline void del(int&x,int y){
	x-=y;
	if(x<0)x+=md;
}
int n,m,q,a[mxn],f[mxn][mxn],g[mxn][mxn];
int main(){
	ios_base::sync_with_stdio(false);
	cin>>n>>m>>q;for(int i=1;i<=n;++i)cin>>a[i];
	f[1][0]=1;
	for(int i=1;i<=n;++i){
		int t=0;
		for(int j=0;j<=m*2;++j){
			add(t,f[i][j]);
			if(j>a[i])del(t,f[i][j-a[i]-1]);
			f[i+1][j]=t;
		}
	}
	for(int i=1;i<=n;++i){
		g[i][0]=1;
		for(int j=1;j<=m;++j){
			g[i][j]=(f[n+1][j]-f[n+1][j-1]+md)%md;
			if(j>a[i])add(g[i][j],g[i][j-a[i]-1]);
		}
	}
	for(;q--;){
		int x,k;cin>>x>>k;
		if(k>m)cout<<0<<'\n';
		else cout<<g[x][m-k]<<'\n';
	}
}
```
