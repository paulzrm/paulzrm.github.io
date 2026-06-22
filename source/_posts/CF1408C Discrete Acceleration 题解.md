---
title: "CF1408C Discrete Acceleration 题解"
date: 2020-10-01 07:22:00
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "q5l41fpw"
source: "https://www.luogu.com.cn/article/q5l41fpw"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/q5l41fpw)。

一道较为简单的双指针

每次维护左边的人走到那个旗子，右边的人走到那个旗子，慢慢向中间不断更新靠拢即可。

```cpp
#include<bits/stdc++.h>
#define ll long long
#define reg register
#define mp make_pair
#define ri register int
#define ld long double
using namespace std;
const int mxn=2e5+5;
vector<int>g[mxn];
int n,m;
ld len;
ld a[mxn];
inline void solve(){
	cin>>n>>len;
	for(int i=1;i<=n;++i)cin>>a[i];
	int l=1,r=n;
	ld cl=0,cr=len;
	ld sl=1,sr=1;
	ld ans=0;
	for(;l<=r;){//向中间推
		ld dl=a[l]-cl,dr=cr-a[r];
		ld tl=dl/sl,tr=dr/sr;
		if(tl<tr){
			cl=a[l];
			cr-=tl*sr;
			ans+=tl;
			sl=sl+1;
			++l;
		}else{
			cr=a[r];
			cl+=tr*sl;
			ans+=tr;
			sr=sr+1;
			--r;
		}
	}
	ans+=(cr-cl)/(sl+sr);//中间没有旗子了
	cout<<fixed<<setprecision(9)<<ans<<'\n';
}
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	int T=1;cin>>T;
	for(;T--;)solve();
}
```
