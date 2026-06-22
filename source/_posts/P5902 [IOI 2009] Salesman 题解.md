---
title: "P5902 [IOI 2009] Salesman 题解"
date: 2020-11-16 20:28:56
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "otm5w87m"
source: "https://www.luogu.com.cn/article/otm5w87m"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/otm5w87m)。

考虑dp。

---

令 $dp_i$ 表示走到底 $i$ 个集市时的最大收益。

---

1.最朴素的dp

循环 $i$，枚举 $j$ 进行转移。

复杂度：$O(n^2)$

---

2.分离常项

假设现在是 $i$，要从 $j$ 转移

1.$place_j<place_i$

```dp[i]=max(dp[j]+U*(place[i]-place[j]))+val[i]```

有

$dp_j+U*(place_i-place_j)=dp_j-U*place_j+U*place_i$

所以

```dp[i]=max(dp[j]-U*place[j])+val[i]+U*place[i]```

用线段树/树状数组维护即可。

2.$j>i$

同理。

时间复杂度:$O(nlogn)$

---

3.日期相同的情况

贪心可得一定是从一个点直着走到另一个点，中间不会回头。

这里单独弄一个dp。

$dpl_i , dpr_i$ 表示以$i$为结束点，进过集市的开始点在 $i$ 的左边/右边的最大收益。

预处理出不考虑相同日期时每一个点的dp值，然后从左往右、从右往左贪心的递推即可。类似最大子段和。

---

Code:

```
#include<bits/stdc++.h>
#define ll long long
#define reg register
#define mp make_pair
#define ri register int
#define ld long double
using namespace std;
const int mxn=1e6+6;
int dp[mxn];
vector<int>g[mxn];
int n,S,D,U;
struct market{
	int date,money,place;
}a[mxn];
inline bool operator <(market a,market b){
	if(a.date!=b.date)return a.date<b.date;
	return a.place<b.place;
}
struct bit1{  //左边（前缀）
	int val[mxn];
	inline void init(){memset(val,-63,sizeof(val));}
	inline void upd(int x,int d){for(++x;x<mxn;x+=x&-x)val[x]=max(val[x],d);}
	inline int ask(int x){
		ri rt=-2147483647;
		for(++x;x;x-=x&-x)rt=max(rt,val[x]);
		return rt;
	}
}Left;
struct bit2{  //右边（后缀）
	int val[mxn];
	inline void init(){memset(val,-63,sizeof(val));}
	inline void upd(int x,int d){for(++x;x;x-=x&-x)val[x]=max(val[x],d);}
	inline int ask(int x){
		ri rt=-2147483647;
		for(++x;x<mxn;x+=x&-x)rt=max(rt,val[x]);
		return rt;
	}
}Right;
int tmpl[mxn],tmpr[mxn];
inline void cmax(int&x,int y){if(x<y)x=y;}
inline void Same(int L,int R){ //日期相同的情况
	for(ri i=L;i<=R;++i)tmpl[i]=tmpr[i]=max(Left.ask(a[i].place)-a[i].place*D,Right.ask(a[i].place)+a[i].place*U)+a[i].money;
	for(ri i=L+1;i<=R;++i)cmax(tmpl[i],tmpl[i-1]-(a[i].place-a[i-1].place)*D+a[i].money);
	for(ri i=R-1;i>=L;--i)cmax(tmpr[i],tmpr[i+1]-(a[i+1].place-a[i].place)*U+a[i].money);
	for(ri i=L;i<=R;++i){
		dp[i]=max(tmpl[i],tmpr[i]);
		Left.upd(a[i].place,dp[i]+a[i].place*D);
		Right.upd(a[i].place,dp[i]-a[i].place*U);
	}
}
inline void solve(){
	Left.init();Right.init();
	memset(dp,-63,sizeof(dp));
	scanf("%d%d%d%d",&n,&U,&D,&S);
	for(ri i=1;i<=n;++i)scanf("%d%d%d",&a[i].date,&a[i].place,&a[i].money);
	sort(a+1,a+n+1);
	a[n+1].place=S;a[0].place=S;a[n+1].date=a[n].date+1;++n;
	dp[0]=0;
	Left.upd(S,S*D);
	Right.upd(S,-S*U);
	for(ri i=1;i<=n;++i){
		if(a[i+1].date==a[i].date and i<=n){
			ri j=i+1;
			for(;j<=n and a[j].date==a[i].date;++j);
			Same(i,j-1);
			i=j-1;
			continue;
		}
		dp[i]=max(Left.ask(a[i].place)-a[i].place*D,Right.ask(a[i].place)+a[i].place*U)+a[i].money;
		Left.upd(a[i].place,dp[i]+a[i].place*D);
		Right.upd(a[i].place,dp[i]-a[i].place*U);
	}
	printf("%d\n",dp[n]);
}
int main(){
	ios_base::sync_with_stdio(false);
	int T=1;//cin>>T;
	for(;T--;)solve();
}
```
