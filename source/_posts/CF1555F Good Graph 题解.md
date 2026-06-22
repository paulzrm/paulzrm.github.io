---
title: "CF1555F Good Graph 题解"
date: 2021-07-31 21:45:51
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "4hlqbebw"
source: "https://www.luogu.com.cn/article/4hlqbebw"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/4hlqbebw)。

晚上有点累就没打 Edu，感觉亏大本了。

---

首先，我们需要一个性质：

合法的图中不存在两个有着公共边的环

证明：

设环 $a$ 中不与环 $b$ 公用的部分的异或值为 $x$，环 $b$ 中不与环 $a$ 公用的部分的异或值为 $y$，环 $a$ 与 $b$ 公共部分的异或值为 $z$

那么，有:

+ $x \oplus z = 1$

+ $y \oplus z = 1$

+ $x \oplus y = 1$

(对应了环 $a$，环 $b$ 和新构成的环 $c$，其中 $\oplus$ 表示异或)

将这三个式子一起异或起来，就可以得到 $0 = 1$，显然不成立，故不会有两个有着公共边的环。

所以说，每次询问，就相当于询问，加上这条边后，会不会生成一个新环，且这个环与已经存在的环有着公共边。

还有一个性质：

如果我们把所有边离线下来，按照顺序加边，如果当前这条边不会生成一个环，那么它一定是可以加入的。

证明：

因为只有加上这条边后，会生成一个新环，且这个环与已经存在的环有着公共边，才会不能加，故在不生成环的情况下，是可以随便加边的。（也可以感性理解下）

所以我们就可以先按照第二个性质建出一棵树来，然后对于非树边一个一个判断。

于是，我们对于每一条可以加入的非树边，就对 $u_i$ 到 $v_i$ 的简单路径上的所有边权加一。在询问的时候，看 $u_i$ 到 $v_i$ 的简单路径上所有边的边权和是否为 0 即可。

看到是对树上的路径操作就很容易的想到了树剖。

至于题目要求是对边权进行加，我们可以把边权转换到点上：点 $i$ 的权值为连接 $i$ 与 $i$ 父亲的边的权值。

然后就可以码码码了。

我想练练手，所以代码里判断异或和就单独写了个倍增，没有再在树剖里搞，导致巨大多常数，1497ms

Code: 5130 Byte

```cpp
#include<bits/stdc++.h>
#define ll long long
#define mp make_pair
using namespace std;
const int mxn=5e5+5;
int n,q,root;
int val[mxn];
int bg[mxn],ed[mxn],top[mxn],sz[mxn],dep[mxn],dfsc;
int pa[mxn],ord[mxn],P[mxn][22],xo[mxn][22];
vector<int>g[mxn];
int par_val[mxn];
inline int dfs1(int x,int par=0,int deep=1){   //树剖基操
	dep[x]=deep;
	sz[x]=1;pa[x]=par;
	P[x][0]=par;
	for(int i=0;i<g[x].size();++i){
		int y=g[x][i];
		if(y==par)continue;
		sz[x]+=dfs1(y,x,deep+1);
	}
	return sz[x];
}
inline void dfs(int x,int tpf=root,int par=0){
	bg[x]=++dfsc;
	top[x]=tpf;
	ord[dfsc]=x;
	int mx=-1,pos;
	for(int i=0;i<g[x].size();++i){
		int y=g[x][i];
		if(y==par)continue;
		if(sz[y]>mx){
			mx=sz[y];
			pos=y;
		}
	}
	if(mx==-1){
		ed[x]=dfsc;
		return;
	}
	dfs(pos,tpf,x);
	for(int i=0;i<g[x].size();++i){
		int y=g[x][i];
		if(y==par or y==pos)continue;
		dfs(y,y,x);
	}
	ed[x]=dfsc;
}
struct segt{                         //线段树维护树点权
	int sum[mxn<<3];
	int laz[mxn<<3];
	int siz[mxn<<3];
	inline void init(){
		memset(siz,0,sizeof(siz));
		memset(laz,0,sizeof(laz));
		memset(sum,0,sizeof(sum));
	}
	inline void pushup(int x){sum[x]=sum[x<<1]+sum[x<<1|1];}
	inline void pushdown(int x){
		if(laz[x]){
			sum[x]+=1ll*laz[x]*siz[x];
			laz[x<<1]+=laz[x];
			laz[x<<1|1]+=laz[x];
			laz[x]=0;
		}
	}
	inline void build(int x,int l,int r){
		siz[x]=r-l+1;
		if(l==r){
			sum[x]=val[ord[l]];
			return;
		}
		int md=l+r>>1;
		build(x<<1,l,md);
		build(x<<1|1,md+1,r);
		pushup(x);
	}
	inline void add(int x,int l,int r,int a,int b,int d){
		pushdown(x);
		if(a<=l and r<=b){
			laz[x]+=d;
			pushdown(x);
			return;
		}
		if(r<a or b<l)return;
		int md=l+r>>1;
		add(x<<1,l,md,a,b,d);
		add(x<<1|1,md+1,r,a,b,d);
		pushup(x);
	}
	inline int ask(int x,int l,int r,int a,int b){
		pushdown(x);
		if(a<=l and r<=b)return sum[x];
		if(r<a or b<l)return 0;
		int md=l+r>>1;
		return ask(x<<1,l,md,a,b)+ask(x<<1|1,md+1,r,a,b);
	}
}seg;
inline void updRange(int x,int y,int d){   //路径修改
	for(;top[x]!=top[y];){
		if(dep[top[x]]>dep[top[y]])swap(x,y);
		seg.add(1,1,n,bg[top[y]],bg[y],d);
		y=top[y];
		y=pa[y];
	}
	if(dep[x]>dep[y])swap(x,y);
	seg.add(1,1,n,bg[x],bg[y],d);
}
inline int qryRange(int x,int y){       //路径查询
	int ans=0;
	for(;top[x]!=top[y];){
		if(dep[top[x]]>dep[top[y]])swap(x,y);
		ans+=seg.ask(1,1,n,bg[top[y]],bg[y]);
		y=top[y];
		y=pa[y];
	}
	if(dep[x]>dep[y])swap(x,y);
	ans+=seg.ask(1,1,n,bg[x],bg[y]);
	return ans;
}
inline void addSub(int x,int d){     //闲着无聊把子树和也写了下，但没用
	seg.add(1,1,n,bg[x],ed[x],d);
}
inline int qrySub(int x){return seg.ask(1,1,n,bg[x],ed[x]);}
struct dsu{                   //并查集，用来离线后把所有树边提前加上
	int fa[mxn];
	inline void init(){for(int i=1;i<mxn;++i)fa[i]=i;}
	inline int find(int x){return fa[x]==x?x:fa[x]=find(fa[x]);}
	inline int merge(int x,int y){
		x=find(x),y=find(y);
		if(x==y)return 0;
		fa[x]=y;
		return 1;
	}
}d;
int u[mxn],v[mxn],w[mxn];
int ans[mxn];
int roots[mxn];
inline void dfs_xor(int x,int P=0){          //写的倍增处理异或
	xo[x][0]=par_val[x];
	for(int i=0;i<g[x].size();++i){
		int y=g[x][i];
		if(y==P)continue;
		dfs_xor(y,x);
	}
}
inline void init_xor(){
	for(int j=1;j<=20;++j){
		for(int i=1;i<=n;++i){
			P[i][j]=P[P[i][j-1]][j-1];
			xo[i][j]=xo[i][j-1]^xo[P[i][j-1]][j-1];
		}
	}
}
inline int qryXor(int x,int y){
	int rt=0;
	if(dep[x]>dep[y])swap(x,y);
	for(int i=20;~i;--i)if(dep[P[y][i]]>=dep[x])rt^=xo[y][i],y=P[y][i];
	for(int i=20;~i;--i)if(P[x][i]!=P[y][i])rt^=xo[x][i],rt^=xo[y][i],x=P[x][i],y=P[y][i];
	if(x!=y){
		rt^=xo[x][0],rt^=xo[y][0];
		x=P[x][0],y=P[y][0];
	}
	return rt;
}
inline int lca(int x,int y){              //又用倍增写了个LCA
	if(dep[x]>dep[y])swap(x,y);
	for(int i=20;~i;--i)if(dep[P[y][i]]>=dep[x])y=P[y][i];
	for(int i=20;~i;--i)if(P[x][i]!=P[y][i])x=P[x][i],y=P[y][i];
	if(x!=y)x=P[x][0],y=P[y][0];
	return x;
}
inline void solve(){
	cin>>n>>q;
	d.init();
	for(int i=1;i<=q;++i){               //处理树边
		cin>>u[i]>>v[i]>>w[i];
		ans[i]=d.merge(u[i],v[i]);
		if(ans[i])g[u[i]].push_back(v[i]),g[v[i]].push_back(u[i]);
	}
	for(int i=1;i<=n;++i)if(!top[i]){       //可能会有多个边
		roots[i]=1;
		dfs1(i);
		dfs(i,i);
	}
	for(int i=1;i<=q;++i){
		if(!ans[i])continue;
		if(u[i]==pa[v[i]])par_val[v[i]]=w[i];
		else par_val[u[i]]=w[i];
	}
	for(int i=1;i<=n;++i)
		if(roots[i])
			dfs_xor(i);
	init_xor();
	seg.build(1,1,n);
	for(int i=1;i<=q;++i){                //边权转点权
		if(ans[i]){
			if(u[i]==pa[v[i]])val[v[i]]=w[i];
			else val[u[i]]=w[i];
		}
	}
	for(int i=1;i<=q;++i){
		if(ans[i])continue;
		int X=qryXor(u[i],v[i])^w[i];
		if(X==0)continue;
		int LCA=lca(u[i],v[i]);
//		cerr<<u[i]<<' '<<v[i]<<' '<<w[i]<<'\n';
//		for(int i=1;i<=n;++i)cerr<<qryRange(i,i)<<' ';cerr<<'\n';
		int t=qryRange(u[i],v[i])-qryRange(LCA,LCA);   //一定要减掉LCA处的点权 因为它对应的是LCA到LCA的父亲这条边的边权，不在路径上
//		cerr<<"??? "<<qryRange(u[i],v[i])<<' '<<qryRange(u[i],u[i])<<' '<<qryRange(v[i],v[i])<<' '<<qryRange(LCA,LCA)<<'\n';
		if(t!=0);
		else{
			ans[i]=1;
			updRange(u[i],v[i],1);    //同理
			updRange(LCA,LCA,-1);
		}
	}
	for(int i=1;i<=q;++i){
		if(ans[i])cout<<"YES\n";
		else cout<<"NO\n";
	}
}
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	int T;T=1;
//	cin>>T;
	for(;T--;)solve();
	return 0;
}
```
