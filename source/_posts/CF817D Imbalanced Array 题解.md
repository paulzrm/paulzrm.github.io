---
title: "CF817D Imbalanced Array 题解"
date: 2021-07-04 22:16:07
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "58dxopwh"
source: "https://www.luogu.com.cn/article/58dxopwh"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/58dxopwh)。

实质上这题可以用4棵不同的树状数组莽过去

大致思路其他的题解已经讲的很清楚了，这里就讲讲树状数组的不同写法和作用。

比如这道题，我写的第1、2、3、4棵线段树，作用分别是：

1，求左端后缀最大值

2，求右端后缀最小值

3，求左端前缀最大值

4，求右端前缀最小值

如果是要处理前缀的话，我们的 add 函数 和 ask 函数 应该这么写：

```cpp
	inline void add(int x,int d){for(;x<mxn;x+=x&-x)val[x]=max(val[x],d);}  //add 往后 让后面的数在ask时能够处理到它
	inline int ask(int x){  //ask 往前
		int rt=0;
		for(;x;x-=x&-x)rt=max(rt,val[x]);
		return rt;
	}
```

反之，如果是处理后缀的话：

```cpp
	inline void add(int x,int d){for(;x;x-=x&-x)val[x]=max(val[x],d);}//add往前
	inline int ask(int x){//ask往后
		int rt=0;
		for(;x<mxn;x+=x&-x)rt=max(rt,val[x]);
		return rt;
	}
```

此外，这题还有个小问题，样例以就很好的体现了：在两个数相同的时候，且它们都可以作为最小/大值，那么，他们的贡献就会被多次计算。

其实没有太大的关系，因为我们可以钦定如果两个数相同，前面的数大于后面的数，就可以处理掉这种情况了。实现的话就是在 ask 左端时 ask $a_i$ 而在 ask 右端时 ask $a_i +1$ 或 $a_i -1$ 即可。

---

Code:

```cpp
#include<bits/stdc++.h>
#define ll long long
#define mp make_pair
using namespace std;
const int mxn=1e6+6;
int a[mxn],n;
struct fenwick1{
	int val[mxn];
	inline void init(){memset(val,0,sizeof(val));}
	inline void add(int x,int d){for(;x;x-=x&-x)val[x]=max(val[x],d);}
	inline int ask(int x){
		int rt=0;
		for(;x<mxn;x+=x&-x)rt=max(rt,val[x]);
		return rt;
	}
}f1;
struct fenwick2{
	int val[mxn];
	inline void init(){for(int i=0;i<mxn;++i)val[i]=n+1;}
	inline void add(int x,int d){for(;x;x-=x&-x)val[x]=min(val[x],d);}
	inline int ask(int x){
		int rt=n+1;
		for(;x<mxn;x+=x&-x)rt=min(rt,val[x]);
		return rt;
	}
}f2;
struct fenwick3{
	int val[mxn];
	inline void init(){memset(val,0,sizeof(val));}
	inline void add(int x,int d){for(;x<mxn;x+=x&-x)val[x]=max(val[x],d);}
	inline int ask(int x){
		int rt=0;
		for(;x;x-=x&-x)rt=max(rt,val[x]);
		return rt;
	}
}f3;
struct fenwick4{
	int val[mxn];
	inline void init(){for(int i=0;i<mxn;++i)val[i]=n+1;}
	inline void add(int x,int d){for(;x<mxn;x+=x&-x)val[x]=min(val[x],d);}
	inline int ask(int x){
		int rt=n+1;
		for(;x;x-=x&-x)rt=min(rt,val[x]);
		return rt;
	}
}f4;
int BiggerL[mxn],BiggerR[mxn];
int SmallerL[mxn],SmallerR[mxn];
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	cin>>n;
	for(int i=1;i<=n;++i)cin>>a[i];
	f1.init(),f2.init(),f3.init(),f4.init();
	for(int i=1;i<=n;++i){
		BiggerL[i]=f1.ask(a[i]);
		f1.add(a[i],i);
	}
	for(int i=n;i;--i){
		BiggerR[i]=f2.ask(a[i]+1);
		f2.add(a[i],i);
	}
	for(int i=1;i<=n;++i){
		SmallerL[i]=f3.ask(a[i]);
		f3.add(a[i],i);
	}
	for(int i=n;i;--i){
		SmallerR[i]=f4.ask(a[i]-1);
		f4.add(a[i],i);
	}
	ll ans=0;
	for(int i=1;i<=n;++i){
		ans+=a[i]*1ll*(i-BiggerL[i])*(BiggerR[i]-i);
		ans-=a[i]*1ll*(i-SmallerL[i])*(SmallerR[i]-i);
	}
	cout<<ans<<'\n';
	return 0;
}
```
