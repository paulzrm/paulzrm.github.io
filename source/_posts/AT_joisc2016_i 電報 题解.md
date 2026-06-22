---
title: "AT_joisc2016_i 電報 题解"
date: 2022-07-27 17:49:31
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "ilbvs1nv"
source: "https://www.luogu.com.cn/article/ilbvs1nv"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/ilbvs1nv)。

题目意思很清楚不解释。

我们一共有 $n$ 个点，但只有 $n$ 条有向边，还想让这张图强连通，显然是要求我们把这张图变为一个环。

稍微思考一下即可发现，这个题目等价于保留代价最大的那些链，然后删掉剩余的边进行缝缝补补。（因为最后是要变为一个环，换上每个点的入读和出度均为 $1$，如果保留的不是链的形式那么肯定有点出度或者入度大于 $1$，肯定不合法）

回头看看这个图。$n$ 个点，$n$ 条边，是一个基环树的形式。按照套路把环和树分开来看。

对于一个树点，由于要删掉大部分边使得它的入度变为 $1$，我们就可以只保留到它的边权最大的那条边。

由于这张图可能是个基环树森林，我们需要把所有的环也拼接起来，所以说，每个环上至少要断开一个点。

对于一个环，我们令 $mx_i$ 表示点 $i$ 的所有树节点儿子到 $i$ 的那条边上权值的最大值，$sum_i$ 为这些权值的和。令 $val_i$ 表示环上指向 $i$ 的那个点到 $i$ 的这条边的边权。

统计 $cnt$ 为对于一个环 $ring$ 上面的点，满足 $val_i<mx_i$ 的点的个数。

如果这个环的 $cnt > 0$，那么我们想不断白不断（管它是环点还是树点，都只能有一条入边，且断了环边仍是合法的）。

如果这个环的 $cnt=0$，那么为了满足“每个环至少要断开一个点”这个条件，我们就要找到 $val_i-mx_i$ 最小的那个点断开，使得代价最小。

ps. 有一个特例，整张图只有一个大环，且这个大环包括了所有点的时候，它既不需要和其他环拼接，也不需要让其他树点挤进来，所以答案就是 $0$。

Code:

```cpp
#include<bits/stdc++.h>
#define ll long long
#define int ll
using namespace std;
const int mxn=2e5+5;
vector<int>g[mxn];
vector<pair<int,int> >tos[mxn];
int n,a[mxn],c[mxn];
int used[mxn],cused;
int ord[mxn],cord;
int inring[mxn];
int sum[mxn],ma[mxn];
vector<vector<int> >rings;
inline void dfs(int x){
	if(used[x]==cused){//find a ring
		ord[++cord]=x;
		vector<int>ring;
		for(int i=cord-1;i;--i){
			inring[ord[i]]=1;
			ring.push_back(ord[i]);
			if(ord[i]==x)break;
		}
		rings.push_back(ring);
		return;
	}
	if(used[x])return;
	ord[++cord]=x;
	used[x]=cused;
	dfs(a[x]);
	--cord;
}
signed main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	cin>>n;
	for(int i=1;i<=n;++i){
		cin>>a[i]>>c[i];
		g[i].push_back(a[i]);
		tos[a[i]].push_back({i,c[i]});
	}
	for(int i=1;i<=n;++i){
		if(!used[i]){
			++cused;
			cord=0;
			dfs(i);
		}
	}
	if(rings.size()==1 and rings[0].size()==n){
		cout<<0<<endl;
		return 0;
	}
	ll ans=0;
	for(int i=1;i<=n;++i){
		if(!inring[i]){
			int mx=0,sm=0;
			for(auto p:tos[i]){
				mx=max(mx,p.second);
				sm+=p.second;
			}
			ans+=sm-mx;
		}
	}
	for(vector<int>ring:rings){
		ll tot=0;
		int cnt=0,tval,delta=0;
		for(int i:ring){
			int mx=0,sm=0;
			for(auto p:tos[i]){
				if(!inring[p.first]){
					mx=max(mx,p.second);
					sm+=p.second;
				}else tval=c[p.first];
			}
			ma[i]=mx;
			sum[i]=sm;
			tot+=sum[i];
			if(tval<mx)++cnt,delta+=mx-tval;
		}
		if(cnt==0){
			ll res=11451491919810;
			for(int i:ring){
				int j=a[i];
				res=min(res,tot-ma[j]+c[i]);
			}
			ans+=res;
		}else ans+=tot-delta;
	}
	cout<<ans<<endl;
}
```
