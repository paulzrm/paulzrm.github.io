---
title: '300iq contest 2 B Bitwise Xor 题解'
date: '2023-03-16T20:20:19+08:00'
categories:
- 题解
tags:
- 题解
- Codeforces
- Trie
source: https://www.luogu.com.cn/article/3vqus8j9
---

题目链接：[300iq contest 2 B. Bitwise Xor](https://codeforces.com/gym/102331/problem/B)

乡下人没见过 Trie 树，学会了。

```cpp
#include<bits/stdc++.h>
#define ll long long
using namespace std;
const int mxn=2e7+7;
const int md=998244353;
int ch[mxn][2],cnt=1,cc[mxn],n,ans;ll x,a[mxn];
inline void add(int&x,int y){x+=y;if(x>=md)x-=md;}
int main(){
    ios_base::sync_with_stdio(false);
    cin>>n>>x;
    for(int i=1;i<=n;++i)cin>>a[i];
    sort(a+1,a+n+1);
    for(int i=1;i<=n;++i){
        int dp=1,cur=1;
        for(int j=59;~j;--j){
            int c=a[i]>>j&1,d=x>>j&1;
            if(d==0)add(dp,cc[ch[cur][!c]]);
            cur=ch[cur][c^d];
        }
        add(dp,cc[cur]),add(ans,dp),cur=1;
        for(int j=59;~j;--j){
            int c=a[i]>>j&1;
            if(!ch[cur][c])ch[cur][c]=++cnt;
            cur=ch[cur][c];add(cc[cur],dp);
        }
    }cout<<ans;
}
```
