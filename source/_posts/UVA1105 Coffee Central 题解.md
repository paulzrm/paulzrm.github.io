---
title: "UVA1105 Coffee Central 题解"
date: 2022-07-10 19:15:50
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "y9x1dscm"
source: "https://www.luogu.com.cn/article/y9x1dscm"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/y9x1dscm)。

上架建议：套路模板题，蓝。
z
我们把这个平面可以旋转 $45\degree$。

也就是说，原来是一个斜着的正方形求和，现在变成了水平的了，直接用前缀和即可。

原来：![](https://cdn.luogu.com.cn/upload/image_hosting/x2lek9sx.png)

旋转后：![](https://cdn.luogu.com.cn/upload/image_hosting/wnj0352z.png)

实现有点丑陋，仅供参考。

```cpp
#include<bits/stdc++.h>
const int mxn=2008;
using namespace std;
int n,m,k,q;
int a[mxn][mxn];
pair<int,int> rid[mxn][mxn];
pair<int,int>id[mxn][mxn];
int usef[mxn][mxn];
int TT;
inline int get(int x,int y,int xx,int yy){
	if(xx>2*max(n,m)+7)xx=2*max(n,m)+7;
	if(yy>2*max(n,m)+7)yy=2*max(n,m)+7;
	if(x<1)x=1;
	if(y<1)y=1;
	return a[xx][yy]-a[xx][y-1]-a[x-1][yy]+a[x-1][y-1];
}
inline void solve(){
	memset(a,0,sizeof(a));
	memset(usef,0,sizeof(usef));
	int lst=max(n,m)+3;
	for(int i=1;i<=n+m-1;++i){
		int y=1,x=i+1-y;
		int ee=lst;
		for(;x>=1 and y<=m;){
			if(x<=n){
				rid[x][y]={i,ee};
				id[i][ee]={x,y};
				usef[i][ee]=1;
			}
			--x;
			++y;
			ee+=2;
		}
		--lst;
	}
	for(int i=1;i<=k;++i){
		int x,y;cin>>x>>y;
		int tx=rid[x][y].first,ty=rid[x][y].second;
		++a[tx][ty];
	}
	for(int i=0;i<=max(n,m)*2+7;++i)for(int j=0;j<=max(n,m)*2+7;++j){
		if(i)a[i][j]+=a[i-1][j];
		if(j)a[i][j]+=a[i][j-1];
		if(i and j)a[i][j]-=a[i-1][j-1];
	}
	cout<<"Case "<<TT<<":\n";
	for(int ee=0;ee<q;++ee){
		int d;cin>>d;
		int ans=0;pair<int,int>pos;pos={1,1};
		for(int i=0;i<=max(n,m)*2+8;++i)for(int j=0;j<=max(n,m)*2+8;++j){
			if(!usef[i][j])continue;
			int t=get(i-d,j-d,i+d,j+d);
			if(t>ans)ans=t,pos=id[i][j];
			else if(t==ans){
				pair<int,int>tpos=id[i][j];
				if(tpos.second<pos.second or (tpos.second==pos.second and tpos.first<pos.first))pos=tpos;
			}
		}
		cout<<ans<<" ("<<pos.first<<","<<pos.second<<")\n";
	}
}
int main(){
	ios_base::sync_with_stdio(false);
	while(cin>>n>>m>>k>>q){
		if(!n)break;
		++TT;
		solve();
	}
	return 0;
}
```
