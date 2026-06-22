---
title: 第46届ICPC亚洲区域赛（昆明）(正式赛） J.Just Another String Problem 题解
date: '2022-05-02T00:00:00+08:00'
tags:
- 题解
---

[link](https://ac.nowcoder.com/acm/contest/32708/J)

题目大意：

定义一个好集合 $T$：

- 所有元素均为字符串
- $T$ 中不包含两个串 $p,q$，满足 $p$ 是 $q$ 的后缀

先给你一个长度为 $n$ 的字符串$s$，和一个长度为 $n$ 的数组 $v$。

<!-- more -->

一个好的集合 $T$ 的权值定义为 $\sum\limits_{s \in T} v_{|s|}$，其中 $|s|$ 表示字符串 $s$ 的长度。

然后 $q$ 次询问，每次给定两个数 $l,k$，问你当好集合 $T$ 的元素均为 $s_{1\dots l}$ 的子串，且 $T$ 的大小 $\le k$ 时，$T$ 的最大权值是多少。

---

- **Lema 1. 最优情况下的 $T$ 中的所有串都是 $s$ 的前缀**

可以反证。

如果其中有一个串 $p$ 不是 $s$ 的前缀，设 $p=s_{l\dots r}$，那么我们让 $p=s_{1\dots r}$ 答案一定不会劣。

首先，题目中保证了 $v_i$ 单调增，所以这个新 $T’$ 的权值一定会更大。

然后，我们来说明这个 $T’$ 是合法的。

还是反证，假设这个 $p’=s_{1 \dots r}$ 是某个串 $q$ 的后缀。

那么显然，由于 $p$ 是 $p’$ 的后缀，$p’$ 又是 $q$ 的后缀，所以 $p$ 就是 $q$ 的后缀，然而 $p$ 和 $q$ 均在原来的 $T$ 中，故 $T$ 不合法，而原来的 $T$ 是合法的，矛盾、

- **Lema 2. 对于每一个 $1\le i \le n$，我们最多选择一个串满足结尾为 $i$**

由引理1易证，同一个串不能出现两次。

- **Lema 3. 对于两个不同的 $1 \le i < j \le n$，以 $j$ 结尾的串的权值一定大于 $i$ 的**

引理1和2可以得到只能选择$s_{1\dots i}$ 和 $s_{1 \dots j}$，又由 $v_j\geq v_i$ 可得。

---

由引理1可得，我们考虑两个前缀什么时候不能出现。

考虑 kmp 建出的 fail 数组并把它拎成一棵fail树，那么对于长度为 $j$ 的前缀和长度为 $i$ 的前缀（ $i \le j$ ）不能同时出现，当且仅当 $i$ 不是 $j$ 的祖先。

$fail_i$ 的定义：$fail_i<i$，且 $s_{1\dots fail_i}$ 是最长的既是 $s_i$ 的前缀又是后缀的串。

由定义得当 $i=fail_j$ 的时候 $i$ 和 $j$ 不能同时出现。

然后我们考虑 $t=fail_{fail_{j}}$，由于$s_{1\dots t}$ 为 $s_{1\dots fail_j}$ 的前缀和后缀，而 $s_{1\dots fail_j}$ 是 $s_{1 \dots j}$ 的前缀和后缀，所以 $s_{1\dots t}$ 是 $s_{1 \dots j}$ 的前缀和后缀。递归下去就可以推出是祖先就不能出现的结论了。

最后我们要做的，就是把询问离线，按照 $l$ 从小到大排序，依次加入 $s_i$ ，维护一棵线段树即可。

由引理3可得，选择越靠后的串总权值越大，就可以用主席树查询区间第 $k$ 大的方法来求答案了。

Code:

```cpp
#include<bits/stdc++.h>
using namespace std;
#define ll long long
#define mp make_pair
#define reg register
const int mxn=1e6+6;
int n,q;
int nxt[mxn];
ll ans[mxn],v[mxn];
char s[mxn];
bool used[mxn];
inline void kmp(){
	nxt[1]=0;
	for(int i=2,j=0;i<=n;++i){
		for(;j and s[j+1]!=s[i];)j=nxt[j];
		if(s[i]==s[j+1])++j;
		nxt[i]=j;
	}
}
ll sz[mxn<<3],val[mxn<<3];
vector<int>g[mxn];
inline void init(){memset(used,0,sizeof(used));memset(sz,0,sizeof(sz)),memset(val,0,sizeof(val)),memset(nxt,0,sizeof(nxt)),memset(ans,0,sizeof(ans)),memset(g,0,sizeof(g));}
int e[mxn],f[mxn];
inline void pushup(int x){
	sz[x]=sz[x<<1]+sz[x<<1|1];
	val[x]=val[x<<1]+val[x<<1|1];
}
inline void erase(int x,int l,int r,int pos){
	if(l==r){
		sz[x]=0,val[x]=0;
		return;
	}
	int md=l+r>>1;
	if(pos<=md)erase(x<<1,l,md,pos);
	else erase(x<<1|1,md+1,r,pos);
	pushup(x);
}
inline void add(int x,int l,int r,int pos){
	if(l==r){
		sz[x]=1,val[x]=v[pos];
		return;
	}
	int md=l+r>>1;
	if(pos<=md)add(x<<1,l,md,pos);
	else add(x<<1|1,md+1,r,pos);
	pushup(x);
}
inline ll ask(int x,int l,int r,int k){
	if(sz[x]<=k)return val[x];
	int md=l+r>>1;
	if(k<=sz[x<<1|1])return ask(x<<1|1,md+1,r,k);
	else return ask(x<<1|1,md+1,r,k)+ask(x<<1,l,md,k-sz[x<<1|1]);
}
inline void solve(){
	init();
	scanf("%d%d",&n,&q);
    scanf("%s",s+1);s[n+1]=0;
	kmp();
//	for(int i=1;i<=n;++i)cout<<nxt[i]<<' ';cout<<endl;
	for(int i=1;i<=n;++i)scanf("%d",v+i);
	for(int i=1;i<=q;++i){
		scanf("%d%d",e+i,f+i);
		g[e[i]].push_back(i);
	}
	for(int i=1;i<=n;++i){
		if(used[nxt[i]]){
			erase(1,1,n,nxt[i]);
			used[nxt[i]]=0;
		}
		used[i]=1;
		add(1,1,n,i);
		for(int j:g[i])ans[j]=ask(1,1,n,f[j]);
	}
	for(int i=1;i<=q;++i)printf("%lld\n",ans[i]);
}
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	int T=1;
	scanf("%d",&T);
	for(;T--;)solve();
	return (0-0);
}
```
