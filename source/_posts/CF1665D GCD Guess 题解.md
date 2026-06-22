---
title: "CF1665D GCD Guess 题解"
date: 2022-03-29 15:52:05
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "ufxzgqmz"
source: "https://www.luogu.com.cn/article/ufxzgqmz"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/ufxzgqmz)。

前置知识：中国剩余定理

我们钦定 $a<b$，然后这个 $gcd(x+a,x+b)$ 根据辗转相减法就可以变为 $gcd(b-a,x+a)$

所以说，当 $gcd(x+a,x+b)$ 是 $b-a$ 的倍数的时候，要求 $x+a$ 是 $b-a$ 的倍数。

我们考虑如何充分利用这个性质。

构造一个数 $a=2\times 3\times 7 \times 11 \times 13 \times 17 \times 19 \times 23 \times 29$，和一个数组 $b={2,3,7,11,13,17,19,23,29}$，发现 $a$ 中是由好多素数构成的。

我们枚举 $i=0\dots28$，求 $gcd(x+i,x+a+i)$，记为 $r_i$。如果 $r_i$ 是某个 $b_j$ 的倍数，那么就可以得到 $x\mod b_j= b_j-i \mod b_j$。

为什么呢？

首先，$b$ 中的数两两互质，所以在 gcd 中互不影响。其次，$gcd(x+i,x+a+i)$ 是 $b_j$ 的倍数，那么就意味着 $x+i$ 是 $b_j$ 的倍数，所以 $x+i \mod b_j = 0$，移项就得到了上面那个式子。

最后发现这就是中国剩余定理的板子，直接套即可。

p.s. 这个 $a$ 正好处于 $10^9$ 和 $2\times 10^9$ 之间，所以我们选取这些数的积做为模数。


Code:
```cpp
#include<bits/stdc++.h>
using namespace std;
#define ll long long
#define reg register
int rem[29];
int pri[]={2,3,7,11,13,17,19,23,29};
ll n,a[16],m[16],Mi[16],mul=1,X;
void exgcd(ll a,ll b,ll &x,ll &y){
    if(b==0){x=1;y=0;return ;}
    exgcd(b,a%b,x,y);
    int z=x;x=y,y=z-y*(a/b);
}
inline void solve(){
	for(int i=1;i<=29;++i){
		cout<<"? "<<i<<' '<<1293938646+i<<endl;
		fflush(stdout);
		int x;cin>>x;fflush(stdin);
		for(int j=0;j<9;++j)if(x%pri[j]==0)rem[j]=pri[j]-(i%pri[j]);
	}
	n=9;mul=1;memset(m,0,sizeof(m));X=0;memset(Mi,0,sizeof(Mi));
    for(int t=1;t<=n;++t){
		m[t]=pri[t-1];
		mul*=m[t];
		a[t]=rem[t-1];
    }
    for(int t=1;t<=n;++t){
		Mi[t]=mul/m[t];
		ll x=0,y=0;
        exgcd(Mi[t],m[t],x,y);
        X+=a[t]*Mi[t]*(x<0?x+m[t]:x);
    }
    cout<<"! "<<X%mul<<'\n';
}
int main(){
//	ios_base::sync_with_stdio(false);
//	cin.tie(0),cout.tie(0);
	int T=1;
	cin>>T;
	for(;T--;)solve();
	return (0-0);
}
```
