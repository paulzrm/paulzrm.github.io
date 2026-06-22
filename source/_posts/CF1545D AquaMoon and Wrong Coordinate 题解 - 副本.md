---
title: CF1545D AquaMoon and Wrong Coordinate 题解
date: '2022-03-22T00:00:00+08:00'
tags:
- 题解
---

赛时看到“误差修复”就一直往随机化方面想了

---

假设对于时刻 $j$， 第 $i$ 个人的位置为 $a_{i,j}$。 **本文统一用 $i$ 表示人，用$j$ 表示时刻**

那么我们令 $sum_j = \sum_{i=1}^{n}a_{i,j}$，$squsum_j=\sum_{i=1}^{n}a_{i,j}^2$

再令$deltasum_{j}=sum_{j+1}-sum_j$，$deltasqusum_j=squsum_{j+1}-squsum_{j}$

<!-- more -->

令$sumv=\sum_{i=1}^nv_i$

观察发现，由于在求和后，顺序就变得无关紧要了，故在没有改动数据的情况下，$deltasum_j$ 就等于 $sumv$。同样，可以发现，如果第 $j, j+2$ 个时刻都没有被改动，那么，$deltasum_{j+2}-deltasum_j=2sumv$ 。

根据这个性质，我们就可以求出哪一个时刻进行了更改。令更改的时刻为 $err$。

如果第 $err$ 个时刻进行了更改，那么就会有$deltasum_{err-1} \neq sumv,deltasum_{err} \neq sumv$；但是又因为有 $sum_{err+1}-sum_{err-1}=2sumv$，故有 $deltasum_{err-1}+deletasum_{err}=2sumv$，更进一步的，有其中一个小于 $sumv$，另一个大于 $sumv$。

所以，我们可以求出所有的 $deltasum_j$，并对它们进行排序。在没有改动数据的情况下，$deltasum_j$ 都等于 $sumv$。故经过排序后，$deltasum_{err-1}$ 与 $deltasum_{err}$ 就自然的排到了头和尾。

现在，我们求出了那个时刻进行了更改。然后我们需要求出哪个数值需要更改。

观察 $deltasqusum_j$。

由于累加后顺序不重要，故可以展开，得到

$deltasqusum_j$

$=\sum_{i=1}^{n}(a_{i,j+1}^2-a_{i,j}^2)$

$=\sum_{i=1}^n{(a_{i,j+1}+a_{i.j})(a_{i,j+1}-a_{i,j})}$

在没有改动数据的情况下，又

$=\sum_{i=1}^{n}v_i(a_{i,j+1}+a_{i,j})$

看到这里可能没有什么发现

但是如果我们再进一步，令 $deltasqusumchange_{j}=deltasqusum_{j+1}-deltasqusum_{j}$

就有

$deltasqusumchange_j$

$=\sum_{i=1}^nv_i((a_{i,j+2}+a_{i,j+1})-(a_{i,j+1}+a_{i,j}))$

$=\sum_{i=1}^{n}v_i(a_{i,j+2}-a_{i,j})$

$=\sum_{i=1}^{n}{v_i}\times(2v_i)$

$=\sum_{i=1}^{n}2v_i^2$

所以，在不改动数据的情况下，$deltasqusumchange_j$ 都是相等的。也就是说，$deltasqusum_j$ 是一个等差数列！

根据这个性质，我们就可以轻易推断出，在更改数据前，$squsum_{err}$的值。

最后我们就可以求出那个值了。

令更改数据前的 $sum_{err}=orgsum$，$squsum_{err}=orgsqusum$

令$sumchange=orgsum-sum_{err}$，$squsumchange=orgsqusum-squsum_{err}$。

观察更改前后 $squsum$ 的变化。没有更改的那些值是不会带来贡献的，带来贡献的只有更改的那个值。

令更改后那个值为$x$。

$squsumchange=(x+sumchange)^2-x^2$

$=x^2+sumchange^2+2\times x \times sumchange -x^2$

$=sumchange^2+2\times x\times sumchange$

故 $x=\frac{squsumchange-sumchange^2}{2\times sumchange}$

答案就是 $x+sumchange$

完结~~~

---

Code:

```cpp
#include<bits/stdc++.h>
#define ll long long
#define mp make_pair
using namespace std;
const int mxn=1e3+3;
ll a[mxn][mxn],n,m;
ll sum[mxn],squsum[mxn];
pair<int,int> delta[mxn];
int err;
ll sumdelta,squsumdelta;
ll orgsum,orgsqusum;
ll sumchange,squsumchange;
ll deltasqusumchange,basesqusumchange;
ll ans;
inline void solve(){
	cin>>n>>m;
	for(int i=1;i<=m;++i)for(int j=1;j<=n;++j)cin>>a[i][j],sum[i]+=a[i][j],squsum[i]+=a[i][j]*a[i][j];
	for(int i=1;i<m;++i)delta[i].first=sum[i+1]-sum[i],delta[i].second=i;
	sort(delta+1,delta+m);
	sumdelta=delta[2].first;
	if(delta[1].second<delta[m-1].second)err=delta[m-1].second;
	else err=delta[1].second;
	if(err==2){
		deltasqusumchange=((squsum[5]-squsum[4])-(squsum[4]-squsum[3]));
		basesqusumchange=(squsum[5]-squsum[4])-deltasqusumchange*3;
	}else{
		basesqusumchange=squsum[2]-squsum[1];
		if(err==3)deltasqusumchange=((squsum[5]-squsum[4])-(squsum[2]-squsum[1]))/3;
		else deltasqusumchange=((squsum[3]-squsum[2])-(squsum[2]-squsum[1]));
	}
	orgsum=sum[err-1]+sumdelta;
	sumchange=orgsum-sum[err];
	orgsqusum=squsum[err-1]+basesqusumchange+deltasqusumchange*(err-2);
	squsumchange=orgsqusum-squsum[err];
	ans=(squsumchange-sumchange*sumchange)/2/sumchange;
	cout<<err-1<<' '<<ans+sumchange<<'\n';//至于为什么err要-1：我时刻是从1开始算的
}
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	int T;T=1;
//	cin>>T;
	for(;T--;)solve();
}
```
