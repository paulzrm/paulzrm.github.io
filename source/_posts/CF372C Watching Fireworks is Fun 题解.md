---
title: "CF372C Watching Fireworks is Fun 题解"
date: 2022-11-07 22:23:04
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "xap3la6s"
source: "https://www.luogu.com.cn/article/xap3la6s"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/xap3la6s)。

[CF372C Watching Fireworks is Fun](https://www.luogu.com.cn/problem/CF372C)

我们可以换种思考方式来解决这个问题。

显然 $b_i$ 是一个很无关紧要的东西，我们可以把它们先全部累加到 $ans$ 里。然后题目就变成了要让 $\sum -|a_i-x|$ 最大，所以就可以看为要使得 $\sum |a_i-x|$ 最小。

令 $f(x)$ 表示考虑到某个时间点，此时你的坐标为 $x$ 的最小的 $\sum |a_i-x|$。

假设我们已经考虑了前 $i$ 场烟花，此时我们要考虑加入第 $i+1$ 场烟花带来的影响。

令 $\Delta t=t_{i+1}-t_i, s=\Delta t\times d$，则我们就相当于执行 $f(x)=\min(f(x-d)\dots f(x+d))$。

然后每燃放一场烟花，我们就相当于对 $f(x)$ 加上一个 $|a_i-x|$ 的函数。

综上，可以发现，这个 $f(x)$ 是一个折线函数，且段数是 $O(m)$ 的，计算相邻时间和加入新烟花秀都可以在 $O(m)$ 的时间内解决，故我们得到了一个时间复杂度为 $O(m^2)$ 的做法。

考虑继续优化。

发现这个 $f(x)$ 的每条折线的斜率从左往右可以看作依次为 $-i,-i+1,\dots,0,\dots i-1,i$。

这启发我们可以维护两个优先队列一样的东西，一个维护左半段斜率小于 $0$ 的部分的转折点的 $x$ 坐标，另一个维护右半段的东西。

我们考虑在这种维护方式下，等待时间和加入烟花秀各有什么影响。

由于这个 $f(x)$ 是先降后增的，所以这个等待一段时间就变得非常好处理。就是让 $L$ 中的所有元素减去 $s$，$R$ 中的所有元素加上 $s$，中间多出一段斜率为 $0$ 的段。

当然，我们没有必要真的去减一遍，我们只需要维护两个全局减去/加上的 $sL$ 和 $sR$，每次就让 $sL-s,sR+s$，然后再 $L,R$ 中加入新元素的时候就加入 $l+sL,r-sR$。

再考虑这个加入烟花的操作。

令左半段最右边的转折点横坐标为 $l$，右半段最左边的转折点横坐标为 $r$。

+ $l<a_i<r$

此时就相当于 $L,R$ 都多了一个转折点 $a_i$，都push。

+ $a_i \le l$

此时 $L$ 的最右边的转折点就成为了 $a$，且斜率为 $-1$ 的转折点消失了，但不妨碍我们维护，因为我们可以想象它和斜率为 $0$ 的转折点重合了。

所以我们加入两边 $a$ 至 $L$，然后把 $l$ 加到 $R$ 即可。

+ $a_i \ge r$

和上一种情况同理。

综上，时间复杂度 $O(m\log m)$，可以加强到 $n=10^9,m=2\times10^5$，甚至比原题的单调队列优化dp好写的多。

Code:

```cpp
#include<bits/stdc++.h>
using namespace std;
#define int long long
int n,m,d,ans,tag,pre;
priority_queue<int>L;
priority_queue<int,vector<int>,greater<int> >R;
signed main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	cin>>n>>m>>d;
	for(int i=1;i<=m;++i){
		int a,b,t;cin>>a>>b>>t;
		ans+=b;
		if(i==1)L.push(a),R.push(a),pre=t;
		else{
			tag+=d*(t-pre);
			int l=L.top()-tag,r=R.top()+tag;
			if(a<l)L.pop(),L.push(a+tag),L.push(a+tag),R.push(l-tag),ans-=l-a;
			else if(a>r)R.pop(),R.push(a-tag),R.push(a-tag),L.push(r+tag),ans-=a-r;
			else L.push(a+tag),R.push(a-tag);
		}
		pre=t;
	}
	cout<<ans<<'\n';
}
```
