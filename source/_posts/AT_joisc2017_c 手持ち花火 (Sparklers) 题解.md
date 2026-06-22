---
title: "AT_joisc2017_c 手持ち花火 (Sparklers) 题解"
date: 2022-07-03 17:59:24
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "0ua1720q"
source: "https://www.luogu.com.cn/article/0ua1720q"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/0ua1720q)。

![](https://cdn.luogu.com.cn/upload/image_hosting/lghiod3w.png)

单调性可以被感性发现。

但是我们要注意一点，就是“在碰到一个人之后立刻点燃烟花棒”是不优的。

显然，我们可以让上一个人一直跟着这个人跑，直到烟花棒耗完。同样，无论在耗完的路上遇到了多少人，他们都可以一起跑。可以发现，我们这么做，即等到它耗尽再传递，能够延长火种运输的时间。~~因为你不用考虑这些人是否会累死~~

然后我们贪心的考虑，肯定是 $1\dots k-1$ 号人向右跑，$k+1 \dots n$ 号人向左跑。然后第 $k$ 个人每传递到一个人后就选择下一个传递到左边还是右边。

如果一些人一直同向跑的话，那么他们之间的距离不会变。所以说，在这个过程中，只有 $k$ 号和他的目标之间的距离在变。（我们这种模式就保证了在一个时刻只会有一个烟花棒是点燃的，而为了方便起见我们让 $k$ 号人一直跟着这个烟花棒跑，反正也累不死）

所以，这道题就可以转化成有两列人，每次一个一个撞掉开头的一个，会消耗一定的时间，如果撞掉了就可以获得 $T$ 的时间，问你能否撞完。（每撞上一个人会让这个烟花棒续命 $T$ 时间）

考虑把前面的人和后面的人都分成一些连续的小段，满足每个段的所有前缀都满足 $cost>T \times c$ 而到了结束则 $cost \le T\times c$。（$c$ 代表这一段前缀中人的个数，$cost$ 代表总消耗时间）

如果这两列能够正好被分为一些小段，那么我们执行以下操作：

每次选择一个段然后撞完，如果不能撞则一定不行了。

证明：

如果你没有把一个段撞完就去撞另外一个段，那么你肯定不如不撞这个段直接去撞另外一个段来的优，毕竟我们这个“段”的定义是所有前缀的前缀和都是要亏本的。

那么撞段的顺序会不会影响呢？也是不会的，因为这个段同时还满足了总的是要赚时间的，所以撞完就一定会有盈利。假设你面对的是两个段，你都能撞完，那么你先撞完第一个是肯定能撞完第二个的，先撞第二个同理。

综上，这个贪心策略是可行的。

如果不能被正好分完，那么就可以发现这个后缀满足 $cost > T\times c$。由于最后剩下的时间是可以求出的，我们就可以把后缀的 $T$ 和 $C$ 翻转过来，然后用上述方法再求一遍即可。

感性证明的时候感觉会可能出现还需要再翻转再递归求下去的情况，但其实不会。因为如果出现了，那么我们可以吧这个后缀提出来，发现是满足 $cost \le T \times c$ 的，就可以组成一个段，分到第一次求解的末尾。

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
