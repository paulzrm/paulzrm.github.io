---
title: "AT_arc023_4 [ARC023D] GCD区间 题解"
date: 2023-02-12 14:31:40
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "oraifzp9"
source: "https://www.luogu.com.cn/article/oraifzp9"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/oraifzp9)。

[link](https://www.luogu.com.cn/problem/AT_arc023_4)

题目大意：

给出一个长度为 $n$ $(1 \le n \le 10^{5})$ 的序列和 $m$ $(1 \le m \le 10^{5})$ 个询问。对于每个询问，输入 $x$ $(1 \le x \le 10^{9})$，输出满足 $gcd(a_l,a_{l+1},...,a_r)=x$ 的 $(l,r)$ 的对数。

题解：

考虑我们固定一个起点 $l$，从 $l$ 到 $n$ 扩张区间的右端点 $r$，考虑区间 gcd  的变化。

显然，这个 gcd 最多只会变化 $\log A$ 次（$A$ 是值域），因为每次变化必然是砍掉一个（或一些）质因数，而质因数的个数是 $\log A$ 级别的。

所以我们可以考虑枚举开头，每次二分出下一个变化点的位置，每个开头二分 $\log A$次，就可以求出所有可能的 gcd 的值并得到出现次数了。

注意用 $ST$ 表预处理一下 gcd，复杂度就可以做到 $n \log A \log n$ 了。

---

Code:

```cpp
#include<bits/stdc++.h>
#define ll long long
using namespace std;
const int mxn=1e6+6;
int st[mxn][20],n,q,a[mxn],lg[mxn];
inline int ask(int l,int r){
	int t=lg[r-l+1];
	return __gcd(st[l][t],st[r-(1<<t)+1][t]);
}
map<int,ll>cnt;
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	cin>>n>>q;
	for(int i=1;i<=n;++i)cin>>a[i],st[i][0]=a[i];
	for(int i=2;i<=n;++i)lg[i]=lg[i>>1]+1;
	for(int j=1;j<20;++j)for(int i=1;i<=n;++i)st[i][j]=__gcd(st[i][j-1],st[i+(1<<(j-1))][j-1]);
	for(int i=1;i<=n;++i){
		int cur=i,val=a[i];
		while(1){
			int lo=cur,hi=n+1,md;
			for(;lo<hi-1;){
				md=lo+hi>>1;
				if(ask(i,md)!=val)hi=md;
				else lo=md;
			}
			cnt[val]+=hi-cur;
			cur=hi;val=ask(i,hi);
			if(hi==n+1)break;
		}
	}
	for(;q--;){
		int x;cin>>x;
		cout<<cnt[x]<<'\n';
	}
}
```
