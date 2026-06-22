---
title: "AT_arc047_d [ARC047D] ナナメクエリ 题解"
date: 2023-01-29 20:52:02
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "e7qlxddg"
source: "https://www.luogu.com.cn/article/e7qlxddg"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/e7qlxddg)。

[link](https://www.luogu.com.cn/problem/AT_arc047_d)

题目大意：

有一个 $n\times n$（$1\le n \le 5000$）的正方形矩阵，初始全部为 $0$，下标从 $0$ 开始。

有 $q$（$1 \le q \le 5000$）次操作：

+ $1$ $a$ $b$ $c$ 将所有满足 $a \le x+y \le b$ 的点 $(x,y)$ 的值加上 $c$。

+ $2$ $a$ $b$ $c$ 将所有满足 $a \le x-y \le b$ 的点 $(x,y)$ 的值加上 $c$。

+ $3$ $a$ $b$ $c$ $d$ 查询所有满足 $a \le x \le b$， $c \le y \le d$ 的点 $(x,y)$ 的最大值，并求出值为最大值的点的个数。

部分分：$1 \le n \le 500$

题解：

我们考虑维护两个数组 $s1,s2$，其中 $s1_i$ 表示所有满足 $x+y=i$ 的点加的和，$s2_i$ 表示所有满足 $x-y=i$ 的点加的和。

对于一个点 $(x,y)$，他的值就是 $s1_{x+y}+s2_{x-y}$，所以我们维护 $s1,s2$ 就可以知道全矩阵的值了，$1$ 和 $2$ 操作的复杂度都为 $O(nq)$。

关键在于这个询问。

我们可以枚举所有可能的 $sum$（就是 $x+y$ 的值），那么可以发现，那些在 $sum$ 已知的条件下可行的 $x-y$ 就是连续的一些奇数或者偶数。用数据结构维护可以做到 $O(qn\log n)$，得到部分分。

再继续考虑。

考虑特殊化，查询的是一个正方形。

如果我们从小到大枚举所有的 $sum$，且枚举的时候让 $step=2$（就是按照 $sum$，$sum+2$，$sum+4 \dots$ 的顺序枚举），可以发现每次只会新增两个可能的 $x-y$，不会变少，所以我们只要暴力用新增的两个 $x-y$ 更新就行了。

同理，我们再按照 $sum+1$，$sum+3\dots$ 的顺序枚举，两种情况合并后就是答案了。

再考虑把查询一般化为长方形，则可以按照类似辗转相减法的方法每次割出最大的正方形去查询，然后合并所有的答案，可以证明单次询问复杂度为 $O(n)$，故总时间复杂度为 $O(nq)$。

---

Code:

```cpp
#include<bits/stdc++.h>
using namespace std;
const int mxn=1e4+9;
const int base=5003;
int n,q,s1[mxn],s2[mxn];
inline pair<int,int> G(pair<int,int> x,pair<int,int> y){
	if(x.first!=y.first){
		if(x.first>y.first)return x;
		else return y;
	}
	x.second+=y.second;
	return x;
}
inline pair<int,int> go(int a,int b,int c,int d){
	int cur,cnt,len;
	pair<int,int>rt={-1145141919,0};
	cur=-1145141919,cnt=0,len=-2;
	for(int sum1=a+b,sum2=c+d;sum1<=a+d;sum1+=2,sum2-=2){ //第一类
		len+=2;
		if(s2[a-b+base-len]>cur)cur=s2[a-b+base-len],cnt=1;
		else if(s2[a-b+base-len]==cur)++cnt;
		if(len!=0){
			if(s2[a-b+base+len]>cur)cur=s2[a-b+base+len],cnt=1;
			else if(s2[a-b+base+len]==cur)++cnt;
		}
		if(s1[sum1]+cur>rt.first){
			rt.first=s1[sum1]+cur;
			rt.second=cnt;
		}else if(s1[sum1]+cur==rt.first){
			rt.second+=cnt;
		}
		if(sum1!=sum2){
			if(s1[sum2]+cur>rt.first){
				rt.first=s1[sum2]+cur;
				rt.second=cnt;
			}else if(s1[sum2]+cur==rt.first){
				rt.second+=cnt;
			}
		}
	}
	len=-1,cnt=0,cur=-1145141919;
	for(int sum1=a+b+1,sum2=c+d-1;sum1<=a+d;sum1+=2,sum2-=2){ //第二类
		len+=2;
		if(s2[a-b+base-len]>cur)cur=s2[a-b+base-len],cnt=1;
		else if(s2[a-b+base-len]==cur)++cnt;
		if(len!=0){
			if(s2[a-b+base+len]>cur)cur=s2[a-b+base+len],cnt=1;
			else if(s2[a-b+base+len]==cur)++cnt;
		}
		if(s1[sum1]+cur>rt.first){
			rt.first=s1[sum1]+cur;
			rt.second=cnt;
		}else if(s1[sum1]+cur==rt.first){
			rt.second+=cnt;
		}
		if(sum1!=sum2){
			if(s1[sum2]+cur>rt.first){
				rt.first=s1[sum2]+cur;
				rt.second=cnt;
			}else if(s1[sum2]+cur==rt.first){
				rt.second+=cnt;
			}
		}
	}
	return rt;
}
inline auto solve(int a,int b,int c,int d){//割成极大正方形
	if(c-a==d-b)return go(a,b,c,d);
	int l=min(c-a,d-b);
	if(c-a>d-b){
		pair<int,int> rt=go(a,b,a+l,b+l);
		rt=G(rt,solve(a+l+1,b,c,d));
		return rt;
	}else{
		pair<int,int> rt=go(a,b,a+l,b+l);
		rt=G(rt,solve(a,b+l+1,c,d));
		return rt;
	}
}
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	cin>>n>>q;
	for(;q--;){
		int tp,a,b,c,d;
		cin>>tp;
		if(tp==1){
			cin>>a>>b>>c;
			for(int i=a;i<=b;++i)s1[i]+=c;
		}
		if(tp==2){
			cin>>a>>b>>c;
			a+=base,b+=base;
			for(int i=a;i<=b;++i)s2[i]+=c;
		}
		if(tp==3){
			cin>>a>>b>>c>>d;
			auto p=solve(a,c,b,d);
			cout<<p.first<<' '<<p.second<<'\n';
		}
	}
}
```
