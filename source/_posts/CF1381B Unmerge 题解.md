---
title: "CF1381B Unmerge 题解"
date: 2020-07-22 20:17:48
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "qldraca0"
source: "https://www.luogu.com.cn/article/qldraca0"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/qldraca0)。

结论+dp

我们可以先观察样例。当 $n=4$ 时，整个序列的最大值为8。在merge后的序列中8后面的数在原序列中一定跟在8后面。同理得，在7后面8前面的所有数都一定跟在7后面。

于是原序列被分成了很多小段。现在要做的事就是将这些小段重新组合，得到两个长度为 $n$ 的原序列。由于你已经分好了，所以你不需要知道小段内的内容，只要知道它们的长度，然后01背包即可。

Code:

```cpp
#include<bits/stdc++.h>
using namespace std;
const int mxn=4002;
vector<int>g[mxn];
int n,m;
int a[mxn],pos[mxn];
bool ban[mxn];
vector<int>v;
int dp[mxn][mxn];
inline void solve(){
	cin>>n;for(int i=1;i<=n*2;++i)pos[i]=0;//千万不能用memset！会TLE！
	for(int i=1;i<=n*2;++i)ban[i]=0;
	v.clear();
	for(int i=1;i<=n*2;++i)cin>>a[i],pos[a[i]]=i;
	for(int i=n*2;i;--i){              //分割
		int cnt=0;
		for(int j=pos[i];j<=n*2 and !ban[j];)++cnt,ban[j]=1,++j;
		if(cnt)v.push_back(cnt);
	}
	for(int i=0;i<=v.size();++i)for(int j=0;j<=n;++j)dp[i][j]=0;
	dp[0][0]=1;
	sort(v.begin(),v.end());
	for(int i=0;i<v.size();++i){       //背包
		for(int j=0;j<=n;++j){
			if(dp[i][j]==1){
				dp[i+1][j]=1;
				if(j+v[i]<=n){
					dp[i+1][j+v[i]]=1;
				}
			}
		}
	}
	if(dp[(int)(v.size())][n])cout<<"YES\n";
	else cout<<"NO\n";
}
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	int T=1;cin>>T;
	for(;T--;)solve();
}

```
