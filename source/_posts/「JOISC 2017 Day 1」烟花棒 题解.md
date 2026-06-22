---
title: 「JOISC 2017 Day 1」烟花棒 题解
date: '2022-07-04T00:00:00+08:00'
tags:
- 题解
---

<!-- more -->

单调性可以被感性发现。

但是我们要注意一点，就是“在碰到一个人之后立刻点燃烟花棒”是不优的。

显然，我们可以让上一个人一直跟着这个人跑，直到烟花棒耗完。同样，无论在耗完的路上遇到了多少人，他们都可以一起跑。可以发现，我们这么做，即等到它耗尽再传递，能够延长火种运输的时间。~~因为你不用考虑这些人是否会累死~~

然后我们贪心的考虑，肯定是 $1\dots k-1$ 号人向右跑，$k+1 \dots n$ 号人向左跑。然后第 $k$ 个人每传递到一个人后就选择下一个传递到左边还是右边。

如果一些人一直同向跑的话，那么他们之间的距离不会变。所以说，在这个过程中，只有 $k$ 号和他的目标之间的距离在变。（我们这种模式就保证了在一个时刻只会有一个烟花棒是点燃的，而为了方便起见我们让 $k$ 号人一直跟着这个烟花棒跑，反正也累不死）

所以，这道题就可以转化成有两列人，每次一个一个撞掉开头的一个，会消耗一定的时间，如果撞掉了就可以获得 $T$ 的时间，问你能否撞完。（每撞上一个人会让这个烟花棒续命 $T$ 时间）

考虑把前面的人和后面的人都分成一些连续的小段，满足每个段的所有前缀都满足 $cost>T\times c$ 而到了结束则 $cost \le T\times c$。（$c$ 代表这一段前缀中人的个数，$cost$ 代表总消耗时间）

如果这两列能够正好被分为一些小段，那么我们执行以下操作：

每次选择一个段然后撞完，如果不能撞则一定不行了。

如果不能被正好分完，那么就可以发现这个后缀满足 $cost > T\*c$。由于最后剩下的时间是可以求出的，我们就可以把后缀的 $T$ 和 $C$ 翻转过来，然后用上述方法再求一遍即可。

Talk is cheap, show me the code.

```cpp
#include<bits/stdc++.h>
using namespace std;
#define ll long long
const int ll inf=1e9;
const int mxn=1e5+5;
ll n,k,t;
ll a[mxn],b[mxn];
inline bool check(int x){
	for(int i=1;i<=n;++i)b[i]=a[i]-2ll*t*x*i; //预处理然后就可以直接比大小
	if(b[1]<b[n])return 0;
	int lx=k,rx=k;
	for(int i=k-1;i;--i)if(b[i]>=b[lx])lx=i;
	for(int i=k+1;i<=n;++i)if(b[i]<=b[rx])rx=i;
	int l=k,r=k;
	for(;lx<l or r<rx;){//正着
		bool ok=0,f=0;
		int tl=l,tr=r;
		for(;tl>lx and b[tl-1]>=b[r];)if(b[--tl]>=b[l]){
			f=1;
			break;
		}
		if(f)ok=1,l=tl;
		f=0;
		for(;tr<rx and b[tr+1]<=b[l];)if(b[++tr]<=b[r]){
			f=1;
			break;
		}
		if(f)ok=1,r=tr;
		if(!ok)return 0;
	}
	l=1,r=n;
	for(;l<lx or rx<r;){//处理后缀
		bool ok=0,f=0;
		int tl=l,tr=r;
		for(;tl<lx and b[tl+1]>=b[r];)if(b[++tl]>=b[l]){
			f=1;
			break;
		}
		if(f)ok=1,l=tl;
		f=0;
		for(;tr>rx and b[tr-1]<=b[l];)if(b[--tr]<=b[r]){
			f=1;
			break;
		}
		if(f)ok=1,r=tr;
		if(!ok)return 0;
	}
	return 1;
}
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	cin>>n>>k>>t;
	for(int i=1;i<=n;++i)cin>>a[i];
	int l=0,r=inf/t+1,md;
	for(;l<r-1;){
		md=l+r>>1;
		if(check(md))r=md;
		else l=md;
	}
	if(check(0))r=0;
	cout<<r<<endl;
}
```
