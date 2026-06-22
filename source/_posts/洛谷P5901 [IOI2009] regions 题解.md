---
title: 洛谷P5901 [IOI2009] regions 题解
date: '2022-07-21T00:00:00+08:00'
tags:
- 题解
---

题目意思很清楚不用说。

看到每个点都有颜色，然后询问和颜色的种类有关，时限开了很【】的 8s，就可以往根号分治方面想了。

按照常理，我们钦定一个 $B$，所有颜色为 $i$ 的点的集合为 $col_i$。

<!-- more -->

如果 $|col_x| \le B$ 且 $|col_y|<B$，则他们都是小块，可以直接建立出虚树暴力跑，单次询问时间复杂度 $O(\sqrt{n})$。

如果 $|col_x| > B$ 且 $|col_y| \le B$，那么我们可以进行预处理。对于所有的大块（设其颜色为 $c$），我们处理处其 $up$ 数组，$up_i$ 表示在第 $i$ 个节点到根结点的路上，有多少个颜色为 $c$ 的节点，然后在询问的时候直接计算 $\sum\limits_{v \in col_y}up_v$ 即可。预处理时间复杂度 $O(n\sqrt{n})$，单次询问时间复杂度 $O(\sqrt{n})$。

同理，如果 $|col_x| \le B$ 且 $|col_y| > B$，那么我们可以预处理 $dw_i$ 表示第 $i$ 个节点的子树中有多少个节点的颜色为 $c$，询问时计算 $\sum\limits_{v \in col_x}dw_v$。时间复杂度同上。

最后，如果 $|col_x| > B$ 且 $|col_y| > B$，那么和小块对小块一样，可以预处理，对于所有可能的大块对建出虚树算一遍答案，询问时直接调用即可。时间复杂度 $O(n\sqrt{n})$。

---

上述全部为口胡，如果实现不精细的话，时间复杂度会写成 $O(n\sqrt{n\log n})$且常数巨大，导致你可能只有 60pts 的好成绩。

---

1. 普通的倍增LCA的询问是 $O(\log n)$ 的，我们要用ST表做到 $O(n)$ 预处理，$O(1)$ 求LCA。
2. 在建立虚树的时候，有一步要对所有点按照dfs序排序。如果不想写基数排序怎么办？可以在询问前先对每个 $col_i​$ 中的元素先按照字典序排序，在询问的时候用类似归并排序的方法merge两个有序的 $col_x​$ 和 $col_y​$，就可以把这个 $\log n​$ 砍掉了。

---

现在的时间复杂度已经降到了正好的 $O(n\sqrt{n})$，但是巨大的常数仍让你在 94pts 和 97pts 之间徘徊。

为了减小常数：

1. 加入快读快输
2. 小对小和大对大中暴力统计答案的dfs看起来很累赘，那么短。如果我们能够想办法把这一步放入建立虚树的过程中，那么就可以避免存虚树的边，从而大幅减小常数（感谢[w23c3c3](https://www.luogu.com.cn/user/109942)的指导）

然后这样就能过了。

---

Talk is cheap, show me the code.

```cpp
#include<bits/stdc++.h>
using namespace std;
#define ll long long
#define mp make_pair
#define reg register
const int maxn=10005;        //很好的快读板子
char buffer[maxn],*S,*T;
inline char Get_Char(){
    if(S==T){
        T=(S=buffer)+fread(buffer,1,maxn,stdin);
        if(S==T)return EOF;
    }
    return *S++;
}
inline int read(){
    reg char c;
    reg int re=0,f=0;
    for(c=Get_Char();c<'0' or c>'9';c=Get_Char())if(c=='-')f=1;
    for(;c>='0' and c<='9';)re=(re<<1)+(re<<3)+(c-'0'),c=Get_Char();
    if(f)return -re;
    return re;
}
inline void read(int&x){
    reg char c;
    reg int re=0,f=0;
    for(c=Get_Char();c<'0' or c>'9';c=Get_Char())if(c=='-')f=1;
    for(;c>='0' and c<='9';)re=(re<<1)+(re<<3)+(c-'0'),c=Get_Char();
    if(f)x=-re;
    else x=re;
}
inline void read(ll&x){
    reg char c;
    reg ll re=0,f=0;
    for(c=Get_Char();c<'0' or c>'9';c=Get_Char())if(c=='-')f=1;
    for(;c>='0' and c<='9';)re=(re<<1)+(re<<3)+(c-'0'),c=Get_Char();
    if(f)x=-re;
    else x=re;
}
inline void print(int x){
	if(x<10){
		putchar(x+'0');
		return;
	}
	print(x/10);
	putchar(x%10+'0');
}
const int mxn=2e5+5;
vector<int>g[mxn];
int n,R,q,r[mxn];
int dep[mxn*2];
int ord[mxn*2],cco,cord[mxn*2];
int mi[mxn*2][22];
int lg[mxn*2],co;
int st[mxn*2],ed[mxn*2];
inline void dfs(int x,int par=0,int deep=1){
	cord[++cco]=x;
	st[x]=cco;ed[x]=cco;
	dep[x]=deep;ord[x]=++co;
	for(int y:g[x]){
		if(par==y)continue;
		dfs(y,x,deep+1);
		cord[++cco]=x;
		ed[x]=cco;
	}
}
inline void init(){     //预处理ST表
	lg[1]=0;
	for(int i=2;i<mxn*2;++i)lg[i]=lg[i>>1]+1;
	for(int i=1;i<=cco;++i)mi[i][0]=cord[i];
	for(int k=1;k<22;++k){
		for(int i=1;i<=cco-(1<<k)+1;++i){
			int x=mi[i][k-1],y=mi[i+(1<<(k-1))][k-1];
			if(dep[x]<dep[y])mi[i][k]=x;
			else mi[i][k]=y;
		}
	}
}
inline int lca(int x,int y){
	int fx=st[x],fy=ed[y];
	if(fx>fy)swap(fx,fy);
	int ax=mi[fx][lg[fy-fx]],ay=mi[fy-(1<<lg[fy-fx])+1][lg[fy-fx]];
	if(dep[ax]<dep[ay])return ax;
	else return ay;
}
inline bool cmp(int x,int y){return ord[x]<ord[y];}
int sta[mxn],top=0;
int sz[mxn];
int up[404][mxn],dw[404][mxn];
inline vector<int>mer(vector<int>x,vector<int>y){  //类似归并的操作
	vector<int>rt;rt.clear();
	int i=0,j=0;
	for(;i<x.size() and j<y.size();)
		if(cmp(x[i],y[j]))rt.push_back(x[i]),++i;
		else rt.push_back(y[j]),++j;
	for(;i<x.size();++i)rt.push_back(x[i]);
	for(;j<y.size();++j)rt.push_back(y[j]);
	return rt;
}
inline void gen(vector<int>v,int y){  //建立虚树
	top=0;
	sta[++top]=1;
	sz[1]=r[1]==y;
	for(int i:v){
		if(i!=1){
			int l=lca(sta[top],i);
			if(l!=sta[top]){
				for(;ord[l]<ord[sta[top-1]];)sz[sta[top-1]]+=sz[sta[top]],--top;
				if(ord[l]>ord[sta[top-1]]){
					sz[l]=r[l]==y;
					sz[l]+=sz[sta[top]];
					sta[top]=l;
				}else sz[l]+=sz[sta[top]],top--;
			}
			sz[i]=r[i]==y;
			sta[++top]=i;
		}
	}
	for(int i=top-1;i>=1;--i)sz[sta[i]]+=sz[sta[i+1]];
}
vector<int>col[mxn];
vector<int>hea;
int ans[404][404];
int id[mxn];
//inline void getans(int x,int fa,int cl){//on ng[]    //原来的暴力统计小对小和大对大的答案
//	if(r[x]==cl)sz[x]=1;
//	else sz[x]=0;
//	for(int y:ng[x])if(y!=fa)getans(y,x,cl),sz[x]+=sz[y];
//}
inline void prep(int x,int fa,int cl,int flg=0){   //预处理小对大和大对小的up和dw数组
	if(r[x]==hea[cl])dw[cl][x]=1,++flg;
	up[cl][x]=flg;
	for(int y:g[x])if(y!=fa){
		prep(y,x,cl,flg);
		dw[cl][x]+=dw[cl][y];
	}
}
inline void solve(){
	memset(id,-1,sizeof(id));
	read(n),read(R),read(q);
	read(r[1]);col[r[1]].push_back(1);
	for(int i=2;i<=n;++i){
		int x;read(x),read(r[i]);
		g[x].push_back(i);
		g[i].push_back(x);
		col[r[i]].push_back(i);
	}
	dfs(1);
	init();
	int bound=500;
	for(int i=1;i<=R;++i)if(col[i].size()>=bound)hea.push_back(i);  //这里我的B定为了500
	for(int i=0;i<hea.size();++i)id[hea[i]]=i;
	for(int i=1;i<=n;++i)sort(col[i].begin(),col[i].end(),cmp);
	for(int i=0;i<hea.size();++i)for(int j=0;j<hea.size();++j)if(i!=j){
		gen(mer(col[hea[i]],col[hea[j]]),hea[j]);
//		getans(1,0,hea[j]);
		ll res=0;
		for(int f:col[hea[i]])res+=sz[f];
		ans[i][j]=res;
	}
	for(int i=0;i<hea.size();++i)prep(1,0,i);
	for(;q--;){
		int x,y;read(x),read(y);
		if(~id[x] and ~id[y])print(ans[id[x]][id[y]]),putchar('\n');
		else if(~id[x] and id[y]==-1){
			ll res=0;
			for(int i:col[y])res+=up[id[x]][i];
			print(res),putchar('\n');
		}else if(id[x]==-1 and ~id[y]){
			ll res=0;
			for(int i:col[x])res+=dw[id[y]][i];
			print(res),putchar('\n');
		}else{
			gen(mer(col[x],col[y]),y);
//			getans(1,0,y);
			ll res=0;
			for(int f:col[x])res+=sz[f];
			print(res),putchar('\n');
		}
	}
}
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	int T=1;
	//cin>>T;
	for(;T--;)solve();
	return 0;
}
```
