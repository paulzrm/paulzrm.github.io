---
title: "CF1383E Strange Operation 题解"
date: 2022-02-17 22:08:36
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "8yjuq5j1"
source: "https://www.luogu.com.cn/article/8yjuq5j1"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/8yjuq5j1)。

题目大意：

给你一个长度为 $n$ 的字符串 $s$。

每一次操作，可以选择一个位置（不为最后一位），然后删除它和它后面一位，在原来的位置上填上他们的或。每次操作会使 $n-1$。

问你执行最多 $n-1$ 次操作后能得到多少不同的串。

题解：

根据套路，就可以把相同的数分成一段一段的。又因为是或，所以我们可以认为 $1$ 永远比 $0$ 强，就统计相邻两个 $1$ 之间 $0$ 的个数。（记第 $i$ 段为 $cnt_i$，有 $m$段）

考虑操作过程：

如果选择的是两个 $1$，那么段数会 $-1$，但由于反正间隔都是 $0$ 个 $0$了，我们就可以不用管了。**（有问题，后面会提到）**

反之，删除的肯定是一个 $0$，就当那一段的 $0$ 个数 $-1$。

然后我们就相当于：统计数组 $a$ 的个数，满足 $a_i \le cnt_i$ 了

吗？

不，这题不会这么简单，因为很显然会重复计算。

所以，我们考虑怎么去重：

**前面推的时候，对于选择了两个 $1$ 的情况，很难自圆其说是不是？**

我们对这一块重新考虑下。

令 $dp_i$ 表示考虑到 $cnt_i$ 时的方案数。

为了去重，当 $dp_i$ 由 $dp_k$ 转移过来的时候，需要满足对于所有的 $k+1 \le j \le i-1,cnt_j<cnt_i$，这样就限制了多次转移的情况，而且不会使答案遗漏。

处理 $k$ 的话，打个标记就好了。

最后用前缀和优化把复杂度从 $O(n^2)$ 降到 $O(n)$

Code:

```cpp
string s;
const int mxn=1e6+6;
int cnt[mxn],m,n;
const ll md=1000000007;
ll sum[mxn],dp[mxn];
int pos[mxn];
inline void add(ll&x,ll y){
	x+=y;
	if(x>=md)x-=md;
	if(x<0)x+=md;
	if(x>=md)x-=md;
	if(x<0)x+=md;
}
inline void solve(){
	cin>>s;n=s.size();
	s=s+"1";
	for(int i=0,j=0;i<s.size();++i){
		for(;j<s.size() and s[j]=='0';)++j;
//		cerr<<"? "<<i<<' '<<j<<'\n';
		cnt[++m]=j-i;
		i=j;
		j=i+1;
	}
	if(m==1){
		cout<<n<<'\n';
		return;
	}
//	for(int i=1;i<=m;++i)cerr<<cnt[i]<<' ';cerr<<'\n';
	ll ans=(cnt[1]+1)*1ll*(cnt[m]+1)%md;
	sum[1]=1,dp[1]=1;
	for(int i=1;i<=n;++i)pos[i]=1;
	for(int i=2;i<m;++i){
		for(int j=0;j<=cnt[i];++j)add(dp[i],sum[i-1]-sum[pos[j]-1]);
		for(int j=0;j<=cnt[i];++j)pos[j]=i;
		add(sum[i],sum[i-1]+dp[i]);
	}
	cout<<(ans*1ll*sum[m-1])%md<<'\n';
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
