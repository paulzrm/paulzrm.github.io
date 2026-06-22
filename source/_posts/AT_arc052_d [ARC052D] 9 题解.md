---
title: "AT_arc052_d [ARC052D] 9 题解"
date: 2023-03-05 10:00:59
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "0hmo0mdd"
source: "https://www.luogu.com.cn/article/0hmo0mdd"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/0hmo0mdd)。

题目翻译是错误的，正确的如下：

给定两个正整数 $K,M (1\le K,M \le 10^{10})$，你需要求出有多少个正整数 $N$ 满足 $1 \le N \le M$ 且 $N \equiv S_N (\bmod K) $，其中 $S_N$ 是 $N$ 的各位数字之和。

题解：

这个 $10^{10}$ 的数据范围并不常见，但是可以发现大概是根号的复杂度。

显然无法分块，考虑怎么做到根号分治。我们先对 $K$ 设定一个阈值 $T$，其中 $T$ 是 $\sqrt{M}$ 级别。


+ $K \ge T$

当 $1 \le N \le 10^{10}$ 时，最大的 $S_N$ 不过 $9\times 10=90$，所以我们可以去先枚举数字和 $S$，然后就可以发现，$\bmod K= S$ 的 $N$ 的个数不会超过 $\lfloor\frac{M}{K}\rfloor +1$ 个。直接枚举这些数就可以了。复杂度 $O(S_N\times \frac{M}{K})$。

+ $K \le T$

我们可以考虑把 $K$ 做为一维压到数位 dp 里了。令 $dp_{i,j,sm,0/1}$ 表示考虑到从高到低第 $i$ 位，此时的数 $\bmod K = j$，数字和为 $sm$，是否已经小于 $m$ 的数的个数。这样就可以 dp 了，复杂度 $O(\log k \times S_N\times K)$。

均衡一下取 $K=10000$ 最优。

Code:

```cpp
#include<bits/stdc++.h>
#define ll long long
#define int ll
using namespace std;
ll k,m,n;
int ee[13];
ll dp[13][10000][91][2];
inline void add(ll&x,ll y){x+=y;}
signed main(){
	cin>>k>>m;
	ll ans=0;ll tm=m;
	for(int i=1;;++i){
		ee[i]=tm%10;
		tm/=10;
		if(tm==0){
			n=i;
			break;
		}
	}
	reverse(ee+1,ee+n+1);
	if(k>=10000){
		for(int i=0;i<=90;++i){
			for(ll ee=i;ee<=m;ee+=k){
				ll t=ee,cnt=0;
				while(t){
					cnt+=t%10;
					t/=10;
				}
				if(cnt%k==i)++ans;
			}
		}
		cout<<ans-1<<'\n';
		return 0;
	}
	dp[1][0][0][0]=1;
	for(int i=1;i<=n;++i){
		for(int j=0;j<k;++j){
			for(int sm=0;sm<=90;++sm){
				{//f=0
					for(int t=0;t<ee[i];++t){
						if(sm+t<=90){
							add(dp[i+1][(j*10+t)%k][sm+t][1],dp[i][j][sm][0]);
						}
					}
					if(sm+ee[i]<=90)add(dp[i+1][(j*10+ee[i])%k][sm+ee[i]][0],dp[i][j][sm][0]);
				}
				{//f=1
					for(int t=0;t<10;++t)if(sm+t<=90)add(dp[i+1][(j*10+t)%k][sm+t][1],dp[i][j][sm][1]);
				}
			}
		}
	}
	for(int ee=0;ee<=90;++ee)add(ans,dp[n+1][ee%k][ee][0]),add(ans,dp[n+1][ee%k][ee][1]);
	cout<<ans-1<<'\n';
}
```
