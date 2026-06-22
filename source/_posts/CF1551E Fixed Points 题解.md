---
title: "CF1551E Fixed Points 题解"
date: 2021-07-24 10:03:03
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "ic9fkggx"
source: "https://www.luogu.com.cn/article/ic9fkggx"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/ic9fkggx)。

这道题的一血，纪念一下

![](https://cdn.luogu.com.cn/upload/image_hosting/9esb4yqq.png)

---

观察一个数什么时候能对答案产生贡献。

从前往后数，如果在第 $i$ 个数之前，有 $j$ 个数被删除了，那么这个数现在的位置变成了 $i-j$，故当且仅当 $i-j = a_i$ 的时候会对答案产生贡献。

所以我们可以列出 dp 方程：

令 $dp_{i,j}$ 表示考虑到从前往后第 $i$ 个位置，在它之前已经删除了 $j$ 个数时，最大的答案。

可以得到如下的转移方程：

```
dp[i+1][j]=max(dp[i+1][j],dp[i][j]+(bool)(a[i]+j==i)); //保留这个数
dp[i+1][j+1]=max(dp[i+1][j+1],dp[i][j]);           //删除这个数
```

完事了~

Code:

```cpp
#include<bits/stdc++.h>
#define ll long long
#define mp make_pair
using namespace std;
const int mxn=2002;
int n,k,a[mxn];
int dp[mxn][mxn];
inline void solve(){
	cin>>n>>k;
	for(int i=1;i<=n;++i)cin>>a[i];
	for(int i=0;i<=n+1;++i)for(int j=0;j<=n+1;++j)dp[i][j]=0;
	for(int i=1;i<=n;++i){
		for(int j=0;j<=n;++j){
			dp[i+1][j]=max(dp[i+1][j],dp[i][j]+(bool)(a[i]+j==i));
			dp[i+1][j+1]=max(dp[i+1][j+1],dp[i][j]);
		}
	}
	for(int j=0;j<=n;++j){
		if(dp[n+1][j]>=k){
			cout<<j<<'\n';
			return;
		}
	}
	cout<<"-1\n";
}
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	int T;T=1;
	cin>>T;
	for(;T--;)solve();
}
```
