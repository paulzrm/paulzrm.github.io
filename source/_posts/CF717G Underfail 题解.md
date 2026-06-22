---
title: CF717G Underfail 题解
date: '2022-02-13T00:00:00+08:00'
tags:
- 题解
---

此题我们可以考虑费用流

我们考虑建出一张 $n+2$ 个点的图（本文字符串下标从 $1$ 开始）

<!-- more -->

首先对于 $s$ 的一个子串 $s_{l\dots r}$，如果它可以和一个权值为 $w$ 的串匹配上，那么就建立一条从 $l$ 个点出发，连向第 $r+1$ 个点，流量为1，费用为 $w$ 的边；

然后，我们对于所有的 $1 \le i \le n+1$，建立一条从 $i$ 号点 出发，连向 $i+1$ 号点，流量为 $x$ （如题目所给，一个字符能被覆盖的最大次数），费用为0。

然后以 $1$ 号点为源点，$n+2$ 号点为汇点，跑最大费用最大流就可以了。

然后解释一下为什么这么建图是正确的：

建立从 $l$ 到 $r$，流量为 $1$ 的边很好理解，就是为了满足题目中所给的“每个串在每个位置只能匹配一次”的条件；

那么为什么建立从 $i$ 到 $i+1$，流量为 $x$ 的边就可以满足题目中要求“一个字符能被覆盖的最大次数为 $x$ ”的条件呢？

我们考虑一下，把那 $n+1$ 个点平铺在一个坐标轴上，这张流量网络大概长成什么样：（样例，边的方向都是从前往后，绿色为费用，蓝色为流量）

![](/images/posts/d33db4f3c1945999.png)

然后我们再尝试着把这张图拍扁。

如果对于一个点，它对应的字符出现了多于 $x$ 次，会出现什么情况？

它上面那些“高速公路”上的流量，最终一定会都流到“主路”上！

然而，如果他对应了多余 $x$ 次，那么它上方的“高速公路”上的流量就会大于 $x$，就超过了主路上相邻两点之间流量 $\le x$ 的限制。

那么为什么要建立这看似多余的第 $n+2$ 个节点呢？

其实很简单，万一有很多高速公路在 $n+1$ 号节点上才下来，这就不会受到主路的流量限制了啊！我们再连一条从 $n+1$ 号点通往 $n+2$ 号点的边，流量为 $x$，就正好处理了这种特殊情况。

---

Code:

```cpp
#include<bits/stdc++.h>
#define mp make_pair
#define pii pair<int,int>
using namespace std;
const int mxv=5005;
const int mxn=50005;
const int inf=1000000007;
struct edge{int to,cap,cost,rev;};
int V,m,s,t;
vector<edge>g[mxv],tmpg[mxv];
int h[mxv],dist[mxv],prevv[mxv],preve[mxv];
inline void add_edge(int from,int to,int cap,int cost){
	g[from].push_back((edge){to,cap,cost,g[to].size()});
	g[to].push_back((edge){from,0,-cost,g[from].size()-1});
}
inline int min_cost_flow(int f){
	int res=0;
	fill(h,h+V+1,0);
	while(f>0){
		priority_queue<pii,vector<pii>,greater<pii> >que;
		fill(dist,dist+V+1,inf);
		dist[s]=0;
		que.push(mp(0,s));
		for(;!que.empty();){
			pii p=que.top();
			que.pop();
			int v=p.second;
			if(dist[v]<p.first)continue;
			for(int i=0;i<g[v].size();++i){
				edge&e=g[v][i];
				if(e.cap>0 and dist[e.to]>dist[v]+e.cost+h[v]-h[e.to]){
					dist[e.to]=dist[v]+e.cost+h[v]-h[e.to];
					prevv[e.to]=v;
					preve[e.to]=i;
					que.push(mp(dist[e.to],e.to));
				}
			}
		}
		if(dist[t]==inf) return -1;
		for(int v=1;v<=V;++v) h[v]+=dist[v];
		int d=f;
		for(int v=t;v!=s;v=prevv[v]) d=min(d,g[prevv[v]][preve[v]].cap);
		f-=d;
		res+=d*h[t];
		for(int v=t;v!=s;v=prevv[v]){
			edge&e=g[prevv[v]][preve[v]];
			e.cap-=d;
			g[v][e.rev].cap+=d;
		}
	}
	return res;
}
int lev[mxn],iter[mxn];
inline void bfs(){
	memset(lev,-1,sizeof(lev));
	queue<int>q;
	lev[s]=0;
	q.push(s);
	for(;q.size();){
		int v=q.front();q.pop();
		for(int i=0;i<g[v].size();++i){
			edge&e=g[v][i];
			if(e.cap>0 and lev[e.to]<0){
				lev[e.to]=lev[v]+1;
				q.push(e.to);
			}
		}
	}
}
int dfs(int v,int t,int f){
	if(v==t)return f;
	for(int&i=iter[v];i<g[v].size();++i){
		edge&e=g[v][i];
		if(e.cap>0 and lev[v]<lev[e.to]){
			int d=dfs(e.to,t,min(f,e.cap));
			if(d>0){
				e.cap-=d;
				g[e.to][e.rev].cap+=d;
				return d;
			}
		}
	}
	return 0;
}
inline int max_flow(){
	int flow=0;
	for(;;){
		bfs();
		if(lev[t]==-1)return flow;
		memset(iter,0,sizeof(iter));
		int f=0;
		for(;;){
			f=dfs(s,t,inf);
			if(f==0) break;
			flow+=f;
		}
	}
	return flow;
}
inline void prep(){for(int i=1;i<=V;++i)tmpg[i]=g[i];}
inline void updg(){for(int i=1;i<=V;++i)g[i]=tmpg[i];}
int n,w,x;string ss;
inline void read(){
	cin>>n>>ss>>w;
	for(int i=1;i<=w;++i){
		string tt;int v;
		cin>>tt>>v;
		for(int j=0;j<ss.size()-tt.size()+1;++j){
			bool fit=1;
			for(int k=0;k<tt.size();++k){
				if(tt[k]!=ss[j+k]){
					fit=0;
					break;
				}
			}
			if(fit==1)add_edge(j+1,j+tt.size()+1,1,-v);//这是最小费用最大流的板子，要处理最大费用流的话，就要将边权取负，跑最小费用流，再将答案取负就可以了
		}
	}
	s=1,t=n+2;
	V=n+2;
	cin>>x;
	for(int i=1;i<=n+1;++i)add_edge(i,i+1,x,0);
	prep();
}
int main(){
	read();
	int MaxFlow=max_flow();
	updg();
	cout<<-min_cost_flow(MaxFlow)<<endl;
}
```
