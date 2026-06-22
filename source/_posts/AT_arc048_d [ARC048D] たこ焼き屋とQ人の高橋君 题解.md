---
title: "AT_arc048_d [ARC048D] たこ焼き屋とQ人の高橋君 题解"
date: 2023-01-25 20:51:28
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "uncnaxx6"
source: "https://www.luogu.com.cn/article/uncnaxx6"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/uncnaxx6)。

[link](https://www.luogu.com.cn/problem/AT_arc048_d)

题目大意：

给你一棵有 $n$ ($1 \le n \le 10^5$) 个节点的树，其中一些节点是特殊节点，相邻两个点的距离为 $1$。

有 $q$ ($1 \le q \le 10^5$) 次询问，每次给你两个点 $u,v$，你需要求出从 $u$ 走到 $v$ 的最小时间。

一开始，你的速度是每 $2$ 个时间单位走 $1$ 个距离单位。假设在某一时刻你到了一个特殊节点，那么你的速度就会变为 $1$ 个时间单位走 $1$ 个距离单位，这次询问内有效。

题解：

显然有两种过程：

+ 从 $u$ 直接走到 $v$，花费时间 $2\times dist(u,v)$。

+ 从 $u$ 走到 $u,v$ 链上某个节点 $x$，再从 $x$ 走到某个特殊节点 $y$，再从 $y$ 返回 $x$，最后从 $x$ 走到 $v$。

第一种情况平凡，我们考虑第二种。

有以下结论：

+ 第二种情况下的答案 $ans=dist(u,v)+dist(u,x)+3\times dist(x,y)$

+ $y$ 一定是到 $x$ 距离最近的特殊节点。显然，因为 $y$ 只和 $3\times dist(x,y)$ 一项有关。

所以我们可以跑一遍 bfs 处理出到所有节点最近的特殊节点的距离 $\times 3$ （记为 $C(x)$） 是多少。

然后在 $u,v$ 已知的情况下，$dist(u,v)$ 容易算出，我们只需要求出 $dist(u,x)+3\times C(x)$ 的最小值就可以了。

$dist(u,x)$ 比较难算，但我们可以用一个分类讨论的套路把它拆开来：

令 $l$ 为 $u,v$ 的 LCA，进行分类：

+ $x$ 在 $u \rightarrow l$ 这条链上

此时 $dist(u,x)=deep_u-deep_x$（$deep_x$ 为节点 $x$ 的深度），所以在 $u$ 给定的情况下，我们需要求得的是 $C(x)-deep_x$ 的最小值，可以直接树剖或者倍增维护。

+ $x$ 在 $l\rightarrow v$ 这条链上

同理，不过 $dist(u,x)$ 变为 $deep_u+deep_x-2\times deep_l$，维护 $C(x)+deep_x$ 的最小值即可。

---

Code:

```cpp
#include<bits/stdc++.h>
using namespace std;
const int mxn=1e5+5;
string s;
int n,k,dst[mxn],top[mxn],sz[mxn],dep[mxn],ord[mxn],cc,fa[mxn],son[mxn];
int st[mxn],ed[mxn];
vector<int>g[mxn];
inline void dfs(int x,int par=1){              //树剖
	fa[x]=par;sz[x]=1;dep[x]=dep[par]+1;
	for(int y:g[x])if(y!=par){
		dfs(y,x);
		if(sz[y]>sz[son[x]])son[x]=y;
		sz[x]+=sz[y];
	}
}
inline void go(int x,int par=1,int tpf=1){
	st[x]=++cc;ord[cc]=x,top[x]=tpf;
	if(son[x]){
		go(son[x],x,tpf);
		for(int y:g[x])if(y!=par and y!=son[x])go(y,x,y);
	}
	ed[x]=cc;
}
int F1(int x){return dst[x]-dep[x];}//left
int F2(int x){return dst[x]+dep[x];}//right
struct SP{
	int VAL[mxn],val[mxn<<2];
	inline void build(int x,int l,int r){
		if(l==r){val[x]=VAL[ord[l]];return;}
		int md=l+r>>1;
		build(x<<1,l,md);
		build(x<<1|1,md+1,r);
		val[x]=min(val[x<<1],val[x<<1|1]);
	}
	inline int ask(int x,int l,int r,int a,int b){
		if(a<=l and r<=b)return val[x];
		if(b<l or r<a)return 1145141;
		int md=l+r>>1;
		return min(ask(x<<1,l,md,a,b),ask(x<<1|1,md+1,r,a,b));
	}
	inline void init(int (*F)(int)){
		for(int i=1;i<=n;++i)VAL[i]=F(i);
		build(1,1,n);
	}
	inline int qryRange(int x,int y){
		int ans=1145141;
		for(;top[x]!=top[y];){
			if(dep[top[x]]>dep[top[y]])swap(x,y);
			ans=min(ans,ask(1,1,n,st[top[y]],st[y]));
			y=top[y],y=fa[y];
		}
		if(dep[x]>dep[y])swap(x,y);
		ans=min(ans,ask(1,1,n,st[x],st[y]));
		return ans;
	}
	inline int lca(int x,int y){
		for(;top[x]!=top[y];){
			if(dep[top[x]]>dep[top[y]])swap(x,y);
			y=top[y],y=fa[y];
		}
		if(dep[x]>dep[y])swap(x,y);
		return x;
	}
}s1,s2;
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	cin>>n>>k;
	for(int i=1,u,v;i<n;++i){
		cin>>u>>v;
		g[u].push_back(v);
		g[v].push_back(u);
	}
	dfs(1);go(1);
	cin>>s;s=" "+s;queue<int>q;
	for(int i=1;i<=n;++i)dst[i]=6*n;
	for(int i=1;i<=n;++i)if(s[i]=='1')dst[i]=0,q.push(i);  //bfs
	for(;q.size();){
		int x=q.front();q.pop();
		for(int y:g[x])if(dst[y]>dst[x]+3){
			dst[y]=dst[x]+3;
			q.push(y);
		}
	}
	s1.init(F1);
	s2.init(F2);
	for(;k--;){
		int u,v,l;cin>>u>>v;
		l=s1.lca(u,v);
		cout<<dep[u]+dep[v]-2*dep[l]+min(min(dep[u]+s1.qryRange(u,l),dep[u]+s2.qryRange(l,v)-2*dep[l]),dep[u]+dep[v]-2*dep[l])<<'\n';
	}
}
```
