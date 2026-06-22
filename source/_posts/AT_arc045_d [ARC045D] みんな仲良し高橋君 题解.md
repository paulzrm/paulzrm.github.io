---
title: "AT_arc045_d [ARC045D] みんな仲良し高橋君 题解"
date: 2023-01-31 22:16:49
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "tt60cfml"
source: "https://www.luogu.com.cn/article/tt60cfml"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/tt60cfml)。

[link](https://www.luogu.com.cn/problem/AT_arc045_d)

题目大意：

平面上有 $2n+1$ 个点，两个点可以构成一组配对当且仅当它们的横坐标或纵坐标相等。

对于从 $1$ 到 $2n+1$ 的每个 $i$，询问在去掉第 $i$ 个点后，剩下 $2n$ 个点是否能配成 $n$ 对，满足每个点恰好出现在一组配对中。询问间互相独立。

- $1 \leq n \leq 10^5$

题解：

先有一个很重要结论：

如果有两个点 $x,y$ 他们能匹配上，我们对 $x,y$ 之间连一条边。

然后，如果一个连通块的大小是偶数，那么它一定可以达到完美匹配。

证明：

考虑取出两个当前没有匹配上的点 $x$ 和 $y$。

由于他们是在一个连通块里，所以一定可以找到一条从 $x$ 到 $y$ 的路径。

将这条路径上相邻的进行匹配，如果有摧毁的原有匹配那么按照与路径平行的方向找到下一个待匹配的，可以证明一定能将两个匹配被摧毁的不在路径上的点匹配到一起。

所以，如果原图有多个连通块：

+ 如果有多个大小为奇数的连通块，则所有答案都是 ```NG```。

+ 也就是说，我们可以无视掉所有大小为偶数的连通块（这些块内的点的答案都是```NG```，因为删掉这种点，最终还是会有至少一个大小为奇数的连通块，不符合）。

+ 所以，我们只要在那唯一一个大小为奇数的连通块中，考虑删掉那些点可以使得剩下所有连通块的大小都是偶数。

然后发现这玩意很像一个圆方树，所以建出圆方树后跑一下就行了。

注意：

如果暴力建原图的话边的条数是 $O(n^2)$ 的，所以我们可以对行和列的 $id$ 分别建点，然后将点连向行/列即可。

最终只有 $2\times n+1$ 个点是真的，大小算 $1$，那些代表行/列/点双的点大小都要算 $0$。

---

Code:

```cpp
#include<bits/stdc++.h>
using namespace std;
const int mxn=2e6+6;
vector<int>g[mxn];int k,n;
int X[mxn],Y[mxn];
bool used[mxn];
int cnt,cur;
vector<int>vtmp,odd;
inline void dfs(int x){
	used[x]=1;
	if(x<=n)vtmp.push_back(x),++cur;
	for(int y:g[x])
		if(!used[y])dfs(y);
}
int dfn[mxn],low[mxn],sta[mxn],idx,top,ca;vector<int>ans[mxn];
vector<int>ng[mxn];
inline void tarjan(int x,int fa){
	int son=0;
	low[x]=dfn[x]=++idx;sta[++top]=x;
	for(int y:g[x]){
		if(!dfn[y]){
			tarjan(y,x);
			++son;
			low[x]=min(low[x],low[y]);
			if(low[y]>=dfn[x]){
				++ca;
				while(sta[top+1]!=y)ans[ca].push_back(sta[top--]);
				ans[ca].push_back(x);
			}
		}else if(y!=fa)low[x]=min(low[x],dfn[y]);
	}
	if(fa==0 and son==0)ans[++ca].push_back(x);
}
int siz[mxn],fa[mxn];
inline void go(int x,int par=0){
	fa[x]=par;
	if(x>ca and x<=ca+n)siz[x]=1;
	for(int y:ng[x])if(y!=par){
		go(y,x);
		siz[x]+=siz[y];
	}
}
int imp[mxn],res[mxn];
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	cin>>k;n=2*k+1;
	int base=n+1,base2=n*3+5;
	for(int i=1;i<=n;++i){
		cin>>X[i]>>Y[i];
		g[i].push_back(base+X[i]);
		g[base+X[i]].push_back(i);
		g[i].push_back(base2+Y[i]);
		g[base2+Y[i]].push_back(i);
	}
	for(int i=1;i<=n;++i){
		if(!used[i]){
			cur=0;vtmp.clear();
			dfs(i);
			if(cur%2==1){
				++cnt;
				odd=vtmp;
				if(cnt>1){
					for(int j=1;j<=n;++j)cout<<"NG\n";
					return 0;
				}
			}
		}
	}
//	for(int i:odd)cerr<<i<<' ';cerr<<'\n';
	for(int i:odd)imp[i]=1;
	for(int i=1;i<=n;++i)if(imp[i] and !dfn[i]){
		top=0;
		tarjan(i,0);
	}
	for(int i=1;i<=ca;++i)for(int j:ans[i])ng[i].push_back(ca+j),ng[ca+j].push_back(i);
	go(1);
	for(int i=ca+1;i<=ca+n;++i){
		if(imp[i-ca]){
			int tot=odd.size()-1;
			int bad=0;
			for(int j:ng[i])if(j!=fa[i]){
				if(siz[j]%2==1){
					bad=1;
					break;
				}
				tot-=siz[j];
			}
			if(tot%2==1)bad=1;
			if(bad)res[i-ca]=-1;
		}
	}
	for(int i=1;i<=n;++i){
		if(!imp[i] or res[i]==-1)cout<<"NG\n";
		else cout<<"OK\n";
	}
}
```
