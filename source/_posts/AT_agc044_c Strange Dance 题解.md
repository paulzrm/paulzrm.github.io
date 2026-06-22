---
title: 'AT_agc044_c [AGC044C] Strange Dance 题解'
date: '2023-03-16T20:20:19+08:00'
categories:
- 题解
tags:
- 题解
- AtCoder
- Trie
source: https://www.luogu.com.cn/article/3vqus8j9
---

题目链接：[[AGC044C] Strange Dance](https://www.luogu.com.cn/problem/AT_agc044_c)

乡下人 × 2。这次是低位在上。

```cpp
#include<bits/stdc++.h>
using namespace std;
const int mxn=5e6+6;
int ch[mxn][3],tag[mxn],n,root,cnt,val[mxn];
string s;
inline void build(int&x,int dep,int id,int ml){
    if(!x)x=++cnt;
    if(dep==n){
        val[x]=id;
        return;
    }
    build(ch[x][0],dep+1,id,ml*3);
    build(ch[x][1],dep+1,id+ml,ml*3);
    build(ch[x][2],dep+1,id+ml*2,ml*3);
}
inline void pushdown(int x){
    if(tag[x]){
        tag[ch[x][0]]^=tag[x];
        tag[ch[x][1]]^=tag[x];
        tag[ch[x][2]]^=tag[x];
        tag[x]=0;
        swap(ch[x][1],ch[x][2]);
    }
}
inline void go(int x,int dep){
    if(dep==n)return;
    pushdown(x);
    swap(ch[x][1],ch[x][2]),swap(ch[x][0],ch[x][1]);
    go(ch[x][0],dep+1);
}
inline void S(){tag[root]^=1;}
inline void R(){go(root,0);}
int ans[mxn],cc;
inline void get(int x,int dep,int id,int ml){
    if(dep==n){
        ++cc;
        ans[val[x]]=id;
        return;
    }
    pushdown(x);
    get(ch[x][0],dep+1,id,ml*3);
    get(ch[x][1],dep+1,id+ml,ml*3);
    get(ch[x][2],dep+1,id+ml*2,ml*3);
}
int main(){
    ios_base::sync_with_stdio(false);
    cin>>n>>s;
    build(root,0,0,1);
    for(int i=0;i<s.size();++i){
        if(s[i]=='S')S();
        else R();
    }
    get(root,0,0,1);
    for(int i=0;i<cc;++i)cout<<ans[i]<<' ';
    cout<<'\n';
}
```
