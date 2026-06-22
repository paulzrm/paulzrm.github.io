---
title: 远古ARC-D题选做
date: '2023-03-18T00:00:00+08:00'
tags:
- 笔记
---

[[ARC048D] たこ焼き屋とQ人の高橋君](https://www.luogu.com.cn/problem/AT_arc048_d)

题目大意：

给你一棵有 $n$ ($1 \le n \le 10^5$) 个节点的树，其中一些节点是特殊节点，相邻两个点的距离为 $1$。

有 $q$ ($1 \le q \le 10^5$) 次询问，每次给你两个点 $u,v$，你需要求出从 $u$ 走到 $v$ 的最小时间。

一开始，你的速度是每 $2$ 个时间单位走 $1$ 个距离单位。假设在某一时刻你到了一个特殊节点，那么你的速度就会变为 $1$ 个时间单位走 $1$ 个距离单位，这次询问内有效。

<!-- more -->

题解：

显然有两种过程：

- 从 $u$ 直接走到 $v$，花费时间 $2\times dist(u,v)$。
- 从 $u$ 走到 $u,v$ 链上某个节点 $x$，再从 $x$ 走到某个特殊节点 $y$，再从 $y$ 返回 $x$，最后从 $x$ 走到 $v$。

第一种情况平凡，我们考虑第二种。

有以下结论：

- 第二种情况下的答案 $ans=dist(u,v)+dist(u,x)+3\times dist(x,y)$
- $y$ 一定是到 $x$ 距离最近的特殊节点。显然，因为 $y$ 只和 $3\times dist(x,y)$ 一项有关。

所以我们可以跑一遍 bfs 处理出到所有节点最近的特殊节点的距离 $\times 3$ （记为 $C(x)$） 是多少。

然后在 $u,v$ 已知的情况下，$dist(u,v)$ 容易算出，我们只需要求出 $dist(u,x)+3\times C(x)$ 的最小值就可以了。

$dist(u,x)$ 比较难算，但我们可以用一个分类讨论的套路把它拆开来：

令 $l$ 为 $u,v$ 的 LCA，进行分类：

- $x$ 在 $u \rightarrow l$ 这条链上

此时 $dist(u,x)=deep_u-deep_x$（$deep_x$ 为节点 $x$ 的深度），所以在 $u$ 给定的情况下，我们需要求得的是 $C(x)-deep_x$ 的最小值，可以直接树剖或者倍增维护。

- $x$ 在 $l\rightarrow v$ 这条链上

同理，不过 $dist(u,x)$ 变为 $deep_u+deep_x-2\times deep_l$，维护 $C(x)+deep_x$ 的最小值即可。

---

Code:

```cpp
#include<bits/stdc++.h>
using namespace std;
const int mxn=1e5+5;
string s;
int n,k,dst[mxn],top[mxn],sz[mxn],dep[mxn],ord[mxn],cc,fa[mxn],son[mxn];
int st[mxn],ed[mxn];
vector<int>g[mxn];
inline void dfs(int x,int par=1){              //树剖
	fa[x]=par;sz[x]=1;dep[x]=dep[par]+1;
	for(int y:g[x])if(y!=par){
		dfs(y,x);
		if(sz[y]>sz[son[x]])son[x]=y;
		sz[x]+=sz[y];
	}
}
inline void go(int x,int par=1,int tpf=1){
	st[x]=++cc;ord[cc]=x,top[x]=tpf;
	if(son[x]){
		go(son[x],x,tpf);
		for(int y:g[x])if(y!=par and y!=son[x])go(y,x,y);
	}
	ed[x]=cc;
}
int F1(int x){return dst[x]-dep[x];}//left
int F2(int x){return dst[x]+dep[x];}//right
struct SP{
	int VAL[mxn],val[mxn<<2];
	inline void build(int x,int l,int r){
		if(l==r){val[x]=VAL[ord[l]];return;}
		int md=l+r>>1;
		build(x<<1,l,md);
		build(x<<1|1,md+1,r);
		val[x]=min(val[x<<1],val[x<<1|1]);
	}
	inline int ask(int x,int l,int r,int a,int b){
		if(a<=l and r<=b)return val[x];
		if(b<l or r<a)return 1145141;
		int md=l+r>>1;
		return min(ask(x<<1,l,md,a,b),ask(x<<1|1,md+1,r,a,b));
	}
	inline void init(int (*F)(int)){
		for(int i=1;i<=n;++i)VAL[i]=F(i);
		build(1,1,n);
	}
	inline int qryRange(int x,int y){
		int ans=1145141;
		for(;top[x]!=top[y];){
			if(dep[top[x]]>dep[top[y]])swap(x,y);
			ans=min(ans,ask(1,1,n,st[top[y]],st[y]));
			y=top[y],y=fa[y];
		}
		if(dep[x]>dep[y])swap(x,y);
		ans=min(ans,ask(1,1,n,st[x],st[y]));
		return ans;
	}
	inline int lca(int x,int y){
		for(;top[x]!=top[y];){
			if(dep[top[x]]>dep[top[y]])swap(x,y);
			y=top[y],y=fa[y];
		}
		if(dep[x]>dep[y])swap(x,y);
		return x;
	}
}s1,s2;
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	cin>>n>>k;
	for(int i=1,u,v;i<n;++i){
		cin>>u>>v;
		g[u].push_back(v);
		g[v].push_back(u);
	}
	dfs(1);go(1);
	cin>>s;s=" "+s;queue<int>q;
	for(int i=1;i<=n;++i)dst[i]=6*n;
	for(int i=1;i<=n;++i)if(s[i]=='1')dst[i]=0,q.push(i);  //bfs
	for(;q.size();){
		int x=q.front();q.pop();
		for(int y:g[x])if(dst[y]>dst[x]+3){
			dst[y]=dst[x]+3;
			q.push(y);
		}
	}
	s1.init(F1);
	s2.init(F2);
	for(;k--;){
		int u,v,l;cin>>u>>v;
		l=s1.lca(u,v);
		cout<<dep[u]+dep[v]-2*dep[l]+min(min(dep[u]+s1.qryRange(u,l),dep[u]+s2.qryRange(l,v)-2*dep[l]),dep[u]+dep[v]-2*dep[l])<<'\n';
	}
}
```

[[ARC047D] ナナメクエリ](https://www.luogu.com.cn/problem/AT_arc047_d)

题目大意：

有一个 $n\times n$（$1\le n \le 5000$）的正方形矩阵，初始全部为 $0$，下标从 $0$ 开始。

有 $q$（$1 \le q \le 5000$）次操作：

- $1$ $a$ $b$ $c$ 将所有满足 $a \le x+y \le b$ 的点 $(x,y)$ 的值加上 $c$。
- $2$ $a$ $b$ $c$ 将所有满足 $a \le x-y \le b$ 的点 $(x,y)$ 的值加上 $c$。
- $3$ $a$ $b$ $c$ $d$ 查询所有满足 $a \le x \le b$， $c \le y \le d$ 的点 $(x,y)$ 的最大值，并求出值为最大值的点的个数。

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

[[ARC028D] 注文の多い高橋商店](https://www.luogu.com.cn/problem/AT_arc028_4)

题目大意：

给定 $n$，$m$。有 $n$ 种商品，编号从 $1$ 到 $n$，第 $i$ 种商品最多能拿 $a_i$ 个。

共 $q$ 次询问。每次询问给定 $k$，$x$，求第 $k$ 种商品 **恰好** 拿走 $x$ 个的前提下，在 $n$ 种商品中一共拿走 $m$ 个商品的方案数。两种方案不同当且仅当存在一种商品在二方案中被拿走的个数不同。输出答案对 $10^9+7$ 取模的结果。

- $1 \leq n,m,a_i \leq 2\times 10^3$
- $1\leq k\leq n$
- $1\leq x\leq a_k$

部分分是 $1 \le n,m,q \le 100$ 和 $1 \le n,m \le 100$。

题解：

部分分是基础 $dp$。

令 $dp_{i,j}$ 表示考虑到第 $i$ 种物品，当前已经选了$j$ 个时的方案数。转移为 $dp_{i+1,j}=\sum\limits_{\max(0,j-a_i)}^{j} dp_{i,j}$。

然后每次询问暴力求一遍 dp，可以拿到第一个部分分。

然后我们可以发现第二个部分分中 $n$ 小 $q$ 大，就可以考虑预处理出所有询问要恰好拿走的商品 id 做最后一个物品的 dp 数组（很容易发现这些商品之间的顺序无关紧要），就可以了。预处理复杂度 $O(n^2m)$。

正解还是要看到这个商品之间的顺序无关紧要。

再观察这个转移式子，$dp_{i+1,j}=\sum\limits_{\max(0,j-a_i)}^{j} dp_{i,j}$。

考虑反过来由 $dp_{i+1}$ 推向 $dp_{i}$，会有什么效果？

$dp_{i,j}$ 相当于 $dp_{i+1,j}-dp_{i+1,j-1}$ 再加上 $dp_{i,j-a_{i}-1}$（如果 $j \ge a_{i}+1$）。

再根据商品之间无关紧要，$dp_{n+1}$ 这个数组为考虑完全部的 $n$ 个物品之后得到的 dp 值，前面商品的顺序再怎么换也不会影响到它，所以我们可以枚举假设最后一个选的是 $i$ 号物品，$O(m)$ 的倒推即可。总时间复杂度 $O(nm+q)$。

---

Code:

```cpp
#include<bits/stdc++.h>
using namespace std;
const int mxn=2005;
const int md=1000000007;
inline void add(int&x,int y){
	x+=y;
	if(x>=md)x-=md;
}
inline void del(int&x,int y){
	x-=y;
	if(x<0)x+=md;
}
int n,m,q,a[mxn],f[mxn][mxn],g[mxn][mxn];
int main(){
	ios_base::sync_with_stdio(false);
	cin>>n>>m>>q;for(int i=1;i<=n;++i)cin>>a[i];
	f[1][0]=1;
	for(int i=1;i<=n;++i){
		int t=0;
		for(int j=0;j<=m*2;++j){
			add(t,f[i][j]);
			if(j>a[i])del(t,f[i][j-a[i]-1]);
			f[i+1][j]=t;
		}
	}
	for(int i=1;i<=n;++i){
		g[i][0]=1;
		for(int j=1;j<=m;++j){
			g[i][j]=(f[n+1][j]-f[n+1][j-1]+md)%md;
			if(j>a[i])add(g[i][j],g[i][j-a[i]-1]);
		}
	}
	for(;q--;){
		int x,k;cin>>x>>k;
		if(k>m)cout<<0<<'\n';
		else cout<<g[x][m-k]<<'\n';
	}
}
```

[[ARC045D] みんな仲良し高橋君](https://www.luogu.com.cn/problem/AT_arc045_d)

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

- 如果有多个大小为奇数的连通块，则所有答案都是 `NG`。
- 也就是说，我们可以无视掉所有大小为偶数的连通块（这些块内的点的答案都是`NG`，因为删掉这种点，最终还是会有至少一个大小为奇数的连通块，不符合）。
- 所以，我们只要在那唯一一个大小为奇数的连通块中，考虑删掉那些点可以使得剩下所有连通块的大小都是偶数。

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

[[ARC023D] GCD区間](https://www.luogu.com.cn/problem/AT_arc023_4)

题目大意：

给出一个长度为 $n$ $(1 \le n \le 10^{5})$ 的序列和 $m$ $(1 \le m \le 10^{5})$ 个询问。对于每个询问，输入 $x$ $(1 \le x \le 10^{9})$，输出满足 $gcd(a_l,a_{l+1},…,a_r)=x$ 的 $(l,r)$ 的对数。

题解：

考虑我们固定一个起点 $l$，从 $l$ 到 $n$ 扩张区间的右端点 $r$，考虑区间 gcd 的变化。

显然，这个 gcd 最多只会变化 $\log A$ 次（$A$ 是值域），因为每次变化必然是砍掉一个（或一些）质因数，而质因数的个数是 $\log A$ 级别的。

所以我们可以考虑枚举开头，每次二分出下一个变化点的位置，每个开头二分 $\log A$次，就可以求出所有可能的 gcd 的值并得到出现次数了。

注意用 $ST$ 表预处理一下 gcd，复杂度就可以做到 $n \log A \log n$ 了。

---

Code:

```cpp
#include<bits/stdc++.h>
#define ll long long
using namespace std;
const int mxn=1e6+6;
int st[mxn][20],n,q,a[mxn],lg[mxn];
inline int ask(int l,int r){
	int t=lg[r-l+1];
	return __gcd(st[l][t],st[r-(1<<t)+1][t]);
}
map<int,ll>cnt;
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	cin>>n>>q;
	for(int i=1;i<=n;++i)cin>>a[i],st[i][0]=a[i];
	for(int i=2;i<=n;++i)lg[i]=lg[i>>1]+1;
	for(int j=1;j<20;++j)for(int i=1;i<=n;++i)st[i][j]=__gcd(st[i][j-1],st[i+(1<<(j-1))][j-1]);
	for(int i=1;i<=n;++i){
		int cur=i,val=a[i];
		while(1){
			int lo=cur,hi=n+1,md;
			for(;lo<hi-1;){
				md=lo+hi>>1;
				if(ask(i,md)!=val)hi=md;
				else lo=md;
			}
			cnt[val]+=hi-cur;
			cur=hi;val=ask(i,hi);
			if(hi==n+1)break;
		}
	}
	for(;q--;){
		int x;cin>>x;
		cout<<cnt[x]<<'\n';
	}
}
```

[[ARC052D] 9](https://www.luogu.com.cn/problem/AT_arc052_d)

题目翻译是错误的，正确的如下：

给定两个正整数 $K,M (1\le K,M \le 10^{10})$，你需要求出有多少个正整数 $N$ 满足 $1 \le N \le M$ 且 $N \equiv S_N (\mod K) $，其中 $S_N$ 是 $N$ 的各位数字之和。

题解：

这个 $10^{10}$ 的数据范围并不常见，但是可以发现大概是根号的复杂度。

显然无法分块，考虑怎么做到根号分治。我们先对 $K$ 设定一个阈值 $T$，其中 $T$ 是 $\sqrt{M}$ 级别。

- $K \ge T$

当 $1 \le N \le 10^{10}$ 时，最大的 $S_N$ 不过 $9\times 10=90$，所以我们可以去先枚举数字和 $S$，然后就可以发现，$\mod K= S$ 的 $N$ 的个数不会超过 $\lfloor\frac{M}{K}\rfloor +1$ 个。直接枚举这些数就可以了。复杂度 $O(90\times \frac{M}{K})$。

- $K \le T$

我们可以考虑把 $K$ 做为一维压到数位 dp 里了。令 $dp_{i,j,sm,0/1}$ 表示考虑到从高到低第 $i$ 位，此时的数 $\mod K = j$，数字和为 $sm$，是否已经小于 $m$ 的数的个数。这样就可以 dp 了，复杂度 $O(10\times90\times K\times 10)=O(9000K)$。

均衡一下取 $K=10000$ 最优。

Code:

```cpp
#include<bits/stdc++.h>
#define ll long long
#define int ll
using namespace std;
ll k,m,n;
int ee[12];
ll dp[12][10000][91][2];
inline void add(ll&x,ll y){x+=y;}
signed main(){
	cin>>k>>m;
	ll ans=0;ll tm=m;
	for(int i=1;;++i){
		ee[i]=tm%10;
		tm/=10;
		if(tm==0){
			n=i;
			break;
		}
	}
	reverse(ee+1,ee+n+1);
	if(k>=10000){
		for(int i=0;i<=90;++i){
			for(ll ee=i;ee<=m;ee+=k){
				ll t=ee,cnt=0;
				while(t){
					cnt+=t%10;
					t/=10;
				}
				if(cnt%k==i)++ans;
			}
		}
		cout<<ans-1<<'\n';
		return 0;
	}
	dp[1][0][0][0]=1;
	for(int i=1;i<=n;++i){
		for(int j=0;j<k;++j){
			for(int sm=0;sm<=90;++sm){
				{//f=0
					for(int t=0;t<ee[i];++t){
						if(sm+t<=90){
							add(dp[i+1][(j*10+t)%k][sm+t][1],dp[i][j][sm][0]);
						}
					}
					if(sm+ee[i]<=90)add(dp[i+1][(j*10+ee[i])%k][sm+ee[i]][0],dp[i][j][sm][0]);
				}
				{//f=1
					for(int t=0;t<10;++t)if(sm+t<=90)add(dp[i+1][(j*10+t)%k][sm+t][1],dp[i][j][sm][1]);
				}
			}
		}
	}
	for(int ee=0;ee<=90;++ee)add(ans,dp[n+1][ee%k][ee][0]),add(ans,dp[n+1][ee%k][ee][1]);
	cout<<ans-1<<'\n';
}
```
