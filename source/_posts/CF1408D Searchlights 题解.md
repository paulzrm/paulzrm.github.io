---
title: "CF1408D Searchlights 题解"
date: 2020-10-01 07:19:54
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "83gnu31o"
source: "https://www.luogu.com.cn/article/83gnu31o"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/83gnu31o)。

考虑dp。

令 $f_i$ 表示向左移动 $i$ 格时，向上移动的最小格数。

对于数据预处理完后，倒着去一边取 $max$ 即可。（因为它要大于它后面所有的）

```cpp
#include<bits/stdc++.h>
#define ll long long
#define reg register
#define mp make_pair
#define ri register int
#define ld long double
using namespace std;
const int mxn=1e6+6;
int n,m;
int a[mxn],b[mxn],c[mxn],d[mxn];
int l[mxn],u[mxn];
inline void solve(){
	cin>>n>>m;
	for(int i=1;i<=n;++i)cin>>a[i]>>b[i];
	for(int i=1;i<=m;++i)cin>>c[i]>>d[i];
	for(int i=1;i<=n;++i){
		for(int j=1;j<=m;++j){
			if(c[j]>=a[i] and d[j]>=b[i]){//预
				l[c[j]-a[i]]=max(l[c[j]-a[i]],d[j]-b[i]+1);
			}
		}
	}
	for(int i=1000001;~i;--i)l[i]=max(l[i],l[i+1]);//总
	int ans=100000001;
	for(int i=0;i<=1000001;++i)ans=min(ans,i+l[i]);//比较
	cout<<ans<<'\n';
}
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	int T=1;//cin>>T;
	for(;T--;)solve();
}
```
