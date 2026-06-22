---
title: 第46届ICPC亚洲区域赛（昆明）(正式赛） E.Easy String Problem 题解
date: '2022-04-23T00:00:00+08:00'
tags:
- 题解
---

[link](https://ac.nowcoder.com/acm/contest/32708/E)

萌萌莫队模板题。

我们考虑没有询问的时候怎么做。

<!-- more -->

题目转化为，给你一个字符串 $s$，和一个位置 $x$，你可以删除任意 $l \le x < r$ 的子串 $S_{l+1\dots r-1}$ 得到 $S_{1\dots l}+S_{r\dots n}=S’$，求出所有本质不同的 $S’$ 的个数。

尝试正着做不通后，我们尝试反着做。

首先一共有 $(x+1)\times(n-x)$ 中选择 $l,r$ 的方法，故总共有这么多种 $S’$，所以我们只需要计算重复的 $S’$。

考虑什么时候会有重复的出现：

假设我们有两个位置 $a,b$ 满足 $a\le x,x<b$，满足 $s_a=s_b$，那么我们选取删除 $l=a+1,r=b$ 和 $l=a,r=b-1$ 得到的串就是一样的。

这启发我们可以维护两个桶，维护当前分割点左边和右边每个字符的出现次数 $cnt$，然后莫队的时候再维护一个 $tot$，左右移动的时候让 $tot \pm cnt[][0/1]$ 即可。

```cpp
#include<bits/stdc++.h>
#define ll long long
using namespace std;
const int mxn=1e5+5;
int p[mxn],n,m;
struct qry{int l,r,id;}q[mxn];
int ps[mxn],a[mxn];
const int B=888;
ll cnt[mxn][2],tot,ans[mxn];
inline bool operator <(qry a,qry b){return (ps[a.l]^ps[b.l])?a.l<b.l:((ps[a.l]&1)?a.r<b.r:a.r>b.r);}
inline void add(int x,int tp){--cnt[a[x]][tp],tot-=cnt[a[x]][!tp];}
inline void del(int x,int tp){++cnt[a[x]][tp],tot+=cnt[a[x]][!tp];}
int main(){
    ios_base::sync_with_stdio(false);
    cin.tie(0),cout.tie(0);
    cin>>n;
    for(int i=1;i<=n;++i)ps[i]=(i-1)/B+1;
    for(int i=1;i<=n;++i)cin>>a[i];
    cin>>m;
    for(int i=1;i<=m;++i)cin>>q[i].l>>q[i].r,q[i].id=i;
    sort(q+1,q+m+1);
    int le=1,ri=0;
    for(int i=1;i<=n;++i)++cnt[a[i]][1];
    for(int i=1;i<=m;++i){
        int l=q[i].l,r=q[i].r;
		while(le<l)del(le++,0);
		while(le>l)add(--le,0);
		while(ri>r)del(ri--,1);
		while(ri<r)add(++ri,1);
        ans[q[i].id]=l*1ll*(n-r+1)-tot;
    }
    for(int i=1;i<=m;++i)cout<<ans[i]<<endl;
    return (0-0);
}
```
