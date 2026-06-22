---
title: "CF1656C Make Equal With Mod 题解"
date: 2022-03-25 17:16:52
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "2mq3l9jp"
source: "https://www.luogu.com.cn/article/2mq3l9jp"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/2mq3l9jp)。

送 300iq 下 2400 的毒瘤题。

这题带有一定的诈骗性质。

首先，如果这个数列中即含有 $0$ 又含有 $1$，那么它肯定就是不合法的，因为模数要 $\geq 2$，所以 $1$ 永远是 $1$，$0$ 永远是 $0$。

然后我们对这个数列有没有 $1$ 进行分类讨论。

+ 这个数列里没有 $1$

诈骗。我们对这个数组按照从大到小排序，每次选择最大的那个数做为模数，让所有数对它取模即可。

因为他是最大的数，所以所有其他数肯定小于等于他。小于它的不变，等于它的和他一起变为 $0$。最终所有数都变为 $0$。

+ 这个数列里有 $1$

我们已经知道 $1$ 是动不了的，所以我们想让所有其他数都变为 $1$。

有个结论，就是当这个序列中存在两个连续的数时，它不合法；反之，他一定合法。

证明：

1.不存在两个连续的数时，这个序列合法

这个比较好证，还是从大到小排，对第 $i$ 大的数 $a_i$，让所有数都对 $a_i-1$ 取模即可。（因为不存在 $a_i-1$，所以不会有数变为 $0$）

2.存在两个连续的数时，这个序列不合法

设存在的两个连续的数为 $x,x+1$，那么无论取什么数做为模数，他们都不可能相等。

（他们之差为 $1$，只有当模数为 $1$ 的时候这个 $1$ 才能被消去，故不可能）

综上，~~写几个 if 和 for 就完事了~~

Code:

```cpp
using namespace std;
const int mxn=2e5+5;
int n,a[mxn];
inline void solve(){
	cin>>n;
	int hv0=0,hv1=0;
	for(int i=1;i<=n;++i){
		cin>>a[i];
		if(a[i]==0)hv0=1;
		if(a[i]==1)hv1=1;
	}
	sort(a+1,a+n+1);
	if(hv0 and hv1){
		cout<<"NO\n";
		return;
	}
	if(!hv1){
		cout<<"YES\n";
		return;
	}
	for(int i=1;i<n;++i)if(a[i+1]==a[i]+1){
		cout<<"NO\n";
		return;
	}
	cout<<"YES\n";
}
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	int T=1;
	cin>>T;
	for(;T--;)solve();
	return (0-0);
}
```
