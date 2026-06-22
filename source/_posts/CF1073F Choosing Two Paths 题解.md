---
title: "CF1073F Choosing Two Paths 题解"
date: 2022-11-13 18:24:17
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "higstxh6"
source: "https://www.luogu.com.cn/article/higstxh6"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/higstxh6)。

模拟赛考了这题，花了2h刚了个弱智的点分治做法。

假设当前我们分治到的重心是 $x$，那么我们此时钦定重合部分一定要经过点  $x$。

这时候就会有两种情况：

1. $x$ 不是一个端点。

那么我们可以对 $x$ 的所有儿子排序，以 $dep$ 为第一关键字（该有根子树中最深的有两个及以上儿子的节点的深度），以 $sum$ 为第二关键字（该有根子树中满足第一关键字下最大的深度的节点的两个距离该节点距离最大的两个点的距离之和，说人话就是两个分叉的长度）进行排序。

排序后，由于可能存在多个直径，我们需要找到所有经过点 $x$ 的直径的答案。但是，我们按照上述规则排完序后，直接比较前两大的即可。

证明：

+ 如果有多个儿子的深度最大，那么该方法肯定只在他们之间选。而且，根据第二关键字，我们选前两个就足以凑到在公共部分最长的情况下总长度最长的 方案了。

+ 如果只有一个儿子深度最大，那么按照第二关键字还是能把所有深度第二大的儿子按照分叉从大到小排序，仍然可以选择前两大的配对。

2. $x$ 是一个直径的端点。

这种情况可能在一个蒲公英一样的图上出现（一个菊花接了一条链和一个小分叉）。

那么 $x$ 的所有儿子中有两个及以上叶子的节点只有一个（伸出去的那条链），我们不得不看 $x$ 的所有其他直接儿子作为分叉。就是记录每个儿子的 $lt$ 表示其最深的叶子到它的距离，和 $id$ 表示 $lt$ 对应的叶子的编号。

然后套一个点分治模板就行了。

```cpp
#include<bits/stdc++.h>
using namespace std;
const int mxn=2e5+5;
vector<int>g[mxn];
int ban[mxn];
int root=-1,ma=mxn,totn;
int sz[mxn],n;
inline void findroot(int x,int fa=0){
	sz[x]=1;int cm=0;
	for(int y:g[x])if(y!=fa and !ban[y]){
		findroot(y,x);
		sz[x]+=sz[y];
		cm=max(cm,sz[y]);
	}
	cm=max(cm,totn-sz[x]);
	if(cm<ma){
		ma=cm;
		root=x;
	}
}
vector<int>v,o;
int deg[mxn],dt[mxn],lt[mxn],fa[mxn],id[mxn],dep[mxn],sm[mxn],par[mxn];
pair<int,int>ch[mxn];
inline void dfs(int x,int fa=0){
	par[x]=fa,v.push_back(x),deg[x]=0,lt[x]=0,id[x]=x,sz[x]=1,dep[x]=-mxn;
	for(int y:g[x])if(!ban[y] and y!=fa){
		dfs(y,x),++deg[x];sz[x]+=sz[y];
		if(lt[x]<lt[y]+1){
			lt[x]=lt[y]+1;
			id[x]=id[y];
		}
	}
}
inline void dfs2(int x,int fa=0){
	vector<pair<int,int> >cv;cv.clear();
	sm[x]=-mxn;ch[x]={-mxn,-mxn};dep[x]=-mxn;
	for(int y:g[x])if(!ban[y] and y!=fa){
		dfs2(y,x);
		if(dep[y]+1>dep[x] and sm[y]>=0){
			sm[x]=sm[y],ch[x]=ch[y];dep[x]=dep[y]+1;
		}else if(dep[y]+1==dep[x] and sm[y]>=0){
			if(sm[y]>sm[x]){
				sm[x]=sm[y];
				ch[x]=ch[y];
			}
		}
		cv.push_back({lt[y],id[y]});
		sort(cv.rbegin(),cv.rend());
		if(cv.size()>3)cv.pop_back();
	}
	if(sm[x]<0 and cv.size()>1){
		if(cv[0].first+cv[1].first>sm[x]){
			sm[x]=cv[0].first+cv[1].first;
			ch[x]={cv[0].second,cv[1].second};
			dep[x]=0;
		}
	}
}
#define x1 x114514
#define y1 y114514
#define x2 x1919810
#define y2 y1919810
int cml,sml,x1,y1,x2,y2,bp[mxn];
vector<int>ee;bool fd;
int cnt=0;
inline void go(int x){
	v.clear(),dfs(x);
	if(v.size()<=5){
		for(int i:v)ban[i]=1;
		return;
	}
	dfs2(x);
	vector<pair<int,pair<int,pair<int,int> > > >cv;cv.clear();
	for(int y:g[x])if(!ban[y] and sm[y]>=0 and dep[y]>=0)cv.push_back({dep[y]+1,{sm[y],ch[y]}});
	if(cv.size()>1){
		sort(cv.rbegin(),cv.rend());
		if(cml<cv[0].first+cv[1].first or (cml==cv[0].first+cv[1].first and sml<cv[0].second.first+cv[1].second.first)){
			cml=cv[0].first+cv[1].first;
			sml=cv[0].second.first+cv[1].second.first;
			x1=cv[0].second.second.first,x2=cv[0].second.second.second;
			y1=cv[1].second.second.first,y2=cv[1].second.second.second;
		}
	}else if(cv.size()==1){
		vector<pair<int,int> >wr;wr.clear();
		for(int y:g[x])if(!ban[y] and dep[y]<0)wr.push_back({lt[y],id[y]});
		sort(wr.rbegin(),wr.rend());
		if(wr.size()>1){
			int tc=cv[0].first,ts=cv[0].second.first+wr[0].first+wr[1].first;
			if(tc>cml or (tc==cml and ts>sml)){
				cml=tc,sml=ts;
				x1=wr[0].second,x2=wr[1].second;
				y1=cv[0].second.second.first,y2=cv[0].second.second.second;
			}
		}
	}
	ban[x]=1;
	for(int y:g[x]){
		if(ban[y])continue;
		totn=sz[y];ma=mxn;
		findroot(y);
		go(root);
	}
}
int main(){
//	freopen("reveal.in","r",stdin);
//	freopen("reveal.out","w",stdout);
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	cin>>n;for(int i=1,u,v;i<n;++i)cin>>u>>v,g[u].push_back(v),g[v].push_back(u);
	totn=n;findroot(1,0);
	go(root);
	cout<<x1<<' '<<y1<<'\n'<<x2<<' '<<y2<<'\n';
	return 0;
}
```
