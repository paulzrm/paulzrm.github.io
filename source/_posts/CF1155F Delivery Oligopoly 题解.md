---
title: "CF1155F Delivery Oligopoly 题解"
date: 2020-07-31 20:33:36
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "bplxu9nf"
source: "https://www.luogu.com.cn/article/bplxu9nf"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/bplxu9nf)。

我们不难发现毒瘤们想让我们写状压dp，所以我们考虑如何不写状压dp。

由于这题的数据范围很小，所以我们可以考虑随机。

假设当前随机到的数为tmp，则分为3种情况：

1.将所有的点设置为"选择"（因为我们可能在一开始有一个不好的开头）

2.随机删除一条边

3.随机补回一条边

由于要使得最终结果最小，所以2的概率要大点

测试得到1为$\frac{1}{1024}$，2为$\frac{3}{4}$，3为$\frac{1}{4}$时可以过。

上代码：

```cpp
#include<bits/stdc++.h>
using namespace std;
const int mxn=15;
vector<short>g[mxn];
short n,m;
vector<pair<short,short> >edges,cur;
vector<pair<short,short> >erases,ans;
bool used[mxn];
inline bool go(){  //直接暴力判边双
	for(short i=0;i<cur.size();++i){
		memset(g,0,sizeof(g));
		for(short j=0;j<cur.size();++j)if(i!=j)g[cur[j].first].push_back(cur[j].second),g[cur[j].second].push_back(cur[j].first);
		memset(used,0,sizeof(used));
		queue<int>q;q.push(1);
		for(;q.size();){
			int p=q.front();q.pop();
			for(int j=0;j<g[p].size();++j){
				if(!used[g[p][j]]){
					used[g[p][j]]=1;
					q.push(g[p][j]);
				}
			}
		}
		for(short i=1;i<=n;++i)if(!used[i])return 0;
	}
	return 1;
}
inline void solve(){
	cin>>n>>m;
	for(short i=1,x,y;i<=m;++i){
		cin>>x>>y;
		edges.push_back({x,y});
		ans.push_back({x,y});
	}
	clock_t St=clock();
	cur=edges;
	for(;clock()-St<1900;){  //卡时间
		short rd=rand();
		if(rd%1024==0 or edges.size()==0){
			cur=edges;
			erases.clear();
			continue;
		}
		if(rd%4 or !erases.size()){
			short tmp=rand()%(cur.size());
			pair<short,short>pt=cur[tmp];
			cur.erase(cur.begin()+tmp);
			if(go()){
				if(cur.size()<ans.size())ans=cur;
			}else{
				cur.push_back(pt);
			}
		}else{
			short tmp=rand()%(erases.size());
			cur.push_back(erases[tmp]);
			erases.erase(erases.begin()+tmp);
		}
	}
	cout<<ans.size()<<'\n';
	for(short i=0;i<ans.size();++i)cout<<ans[i].first<<' '<<ans[i].second<<'\n';
}
int main(){
	srand(time(NULL));
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	short T=1;//cin>>T;
	for(;T--;)solve();
}
```
