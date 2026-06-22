---
title: "CF1408E Avoid Rainbow Cycles 题解"
date: 2020-10-01 07:15:31
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "5t331m2d"
source: "https://www.luogu.com.cn/article/5t331m2d"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/5t331m2d)。

考虑构图。

对于集合 $i$，如果有 $j$ 的话，对$i$号节点向 $m+j$ 号节点连一条边权为 $a_i+b_j$的边。

由于题目要求说是无还，所以对这张新图跑最大生成树即可。（不是树必然有环）

最大生成树就是将最小生成树 Kruskal 中每次取出边权最小的边改为最大的边即可，

Code:
```cpp
#include<bits/stdc++.h>
#define ll long long
#define reg register
#define mp make_pair
#define ld long double
using namespace std;
const int mxn=4e5+5;
vector<int>g[mxn];
int n,m;
int a[mxn],b[mxn];
vector<pair<ll,pair<int,int> > >edges;
int f[mxn];
inline int find(int x){return f[x]==x?x:f[x]=find(f[x]);}
inline void uni(int x,int y){
	x=find(x),y=find(y);
	if(x!=y)f[x]=y;
}
ll tot,ans;
inline void solve(){
	cin>>m>>n;
	for(int i=1;i<=n+m;++i)f[i]=i;
	for(int i=1;i<=m;++i)cin>>a[i];
	for(int i=1;i<=n;++i)cin>>b[i];
	for(int i=1;i<=m;++i){
		int x,u;cin>>x;
		for(;x--;){
			cin>>u;
			edges.push_back({a[i]+b[u],{i,m+u}});//建边
			tot+=a[i]+b[u];
		}
	}
	sort(edges.rbegin(),edges.rend());
	for(int tt=0;tt<edges.size();++tt){ //最大生成树（最大能保留的边的权值和）
		pair<ll,pair<int,int> >p=edges[tt];
		int x=p.second.first,y=p.second.second;
		if(find(x)==find(y))continue;
		uni(x,y);
		ans+=p.first;
	}
	cout<<tot-ans<<'\n';
}
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	int T=1;//cin>>T;
	for(;T--;)solve();
}
```
