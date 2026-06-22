---
title: "CF254E Dormitory 题解"
date: 2022-02-19 23:27:36
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "92h7feca"
source: "https://www.luogu.com.cn/article/92h7feca"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/92h7feca)。

题目大意：

有 $n$ 天，第 $i$ 天你会收到 $a_i$ 份食物。食物有保质期，第 $i$ 天收到的食物只能在第 $i$ 天和第 $i+1$ 天食用。

你还有 $m$ 个朋友。第 $i$ 个朋友会在第 $l_i$ 至 $r_i$ 天拜访你，食量是 $c_i$ 份食物。

你每天可以选择一些朋友供应食物（必须供给正好 $c_i$ 份食物，一个朋友一天只能供给一次），每贡献一人次你的人气值就会 $+1$。

同时，你每天必须吃 $v$ 份食物。

问你 $n$ 天后你的人气值最大是多少。

题解：

令 $dp_{i,j}$ 表示考虑到第 $i$ 天，昨天剩下了 $j$ 份食物时你最大的人气值。

转移：

很显然，我们每一天肯定会先吃昨天的剩饭，不够了再吃今天的饭。

然后选择朋友的话，我们可以贪心的选：按照朋友的饭量从小到大排序，选最小的前 $k$ 个。

具体可以参考代码

Code:
```cpp
const int mxn=444;
int n,v,m;
int a[mxn];
vector<pair<int,int> >c[mxn];
int dp[mxn][mxn*2],pre[mxn][mxn*2],preg[mxn][mxn*2]; //pre[][]记录剩饭由哪儿转移过来，preg记录了当天请了饭量前多少小的朋友吃饭
inline void solve(){
	cin>>n>>v;
	for(int i=1;i<=n;++i)cin>>a[i];
	cin>>m;
	for(int i=1;i<=m;++i){
		int l,r,t;cin>>l>>r>>t;
		for(int j=l;j<=r;++j)c[j].push_back(mp(t,i));
	}
	for(int i=1;i<=n;++i)sort(c[i].begin(),c[i].end());
	for(int i=0;i<mxn;++i)for(int j=0;j<mxn*2;++j)dp[i][j]=-1145141;
	dp[1][0]=0;
	for(int i=1;i<=n;++i){
		for(int j=0;j<=800;++j){//dp[i][j]表示考虑到第i天，昨天剩下了j的食物所能得到的最大值
			if(dp[i][j]<0)continue;
			int yes=j,tod=a[i];    //分别代表昨天的剩饭和今天新增的饭
			if(yes>=v)yes-=v;
			else tod-=(v-yes),yes=0;  //先处理今天自己吃的饭
			int x=tod+yes;
			if(dp[i][j]>dp[i+1][tod]){
				dp[i+1][tod]=dp[i][j];
				pre[i+1][tod]=j;
				preg[i+1][tod]=0;
			}
			int sum=0;
			for(int k=0;k<c[i].size();++k){
				sum+=c[i][k].first;
				if(sum>x)break;
				int rem=min(tod,x-sum);  //还是先吃剩饭，然后处理昨天不能保留到明天的饭
				if(dp[i][j]+k+1>dp[i+1][rem]){
					dp[i+1][rem]=dp[i][j]+k+1;
					pre[i+1][rem]=j;
					preg[i+1][rem]=k+1;
				}
			}
		}
	}
	int pos=0;
	for(int i=1;i<=800;++i)if(dp[n+1][i]>dp[n+1][pos])pos=i;
	cout<<dp[n+1][pos]<<'\n';
	vector<int>bk;
	bk.clear();
	int lst=pos;
	for(int i=n+1;i>1;--i){
		bk.push_back(preg[i][lst]);
		lst=pre[i][lst];
	}
	for(int i=bk.size()-1;~i;--i){
		cout<<bk[i]<<' ';
		for(int j=0;j<bk[i];++j)cout<<c[bk.size()-i][j].second<<' ';
		cout<<'\n';
	}
}
int main(){
	freopen("input.txt","r",stdin);
	freopen("output.txt","w",stdout);
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	int T=1;
	//cin>>T;
	for(;T--;)solve();
	return 0;
}
```
