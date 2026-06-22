---
title: CF1801F Another n-dimensional chocolate bar 题解
date: '2022-03-10T00:00:00+08:00'
tags:
- 题解
---

考虑到最多只会有一个 $b_i \ge \sqrt{k}$。

- 没有任何一个 $b_i \geq \sqrt{k}$。

那么我们可以考虑类似 meet-in-the-middle 的做法。

<!-- more -->

令 $f_{i,j}$ 表示考虑了前 $i$ 个数，此时乘积为 $j$，$\lfloor\frac{a_1}{b_1}\rfloor\lfloor\frac{a_2}{b_2}\rfloor\dots\lfloor\frac{a_i}{b_i}\rfloor\frac{1}{a_1a_2\dots a_i}$ 的最大值，$g_{i,j}$ 的定义类似，不过是从 $n$ 开始倒着的。dp 的时候枚举 $i$，枚举 $j$，再枚举满足 $j\times k \le$ 第二维大小的所有 $k$ 即可。

则我们这种情况下的最好答案就是枚举一个中间断点 $i$，和 $i$ 左边的部分的乘积 $j$，$f_{i,j}\times g_{i+1,\lceil\frac{k}{j}\rceil}$ 的最小值了。

此时我们需要证明，在所有选择的 $b_i$ 都 $\le \sqrt{k}$ 的情况下，$f$ 和 $g$ 的第二维都只要开到 $k^{\frac{3}{4}}$ 即可。

不妨设一个 $x$，初始为 $b_i$ 最大的位置，令 $p$ 为 $x$ 左边所有 $b_i$ 的乘积，$q$ 为 $x$ 右边所有 $b_i$ 的乘积。

我们贪心的考虑，如果 $b_x^2\times p <q$，就让 $x+1$；如果 $b_x^2\times q < p$，就让 $x-1$。在移动 $x$ 的同时维护 $p$ 和 $q$ 的值。

此时第二维就需要开到一个 $\min(p,q)\times b_x$ 的大小。因为 $p \times q \times b_x$ 是 $O(k)$ 级别的，所以 $\min(p,q)\le \sqrt{\frac{k}{b_x}}$，故第二维只需要开到 $\sqrt{\frac{k}{b_x}}\times b_x=\sqrt{k\times b_x}$ 即可。因为 $b_x\le \sqrt{k}$，所以 $\sqrt{\frac{k}{b_x}}\times b_x \le k^{\frac{3}{4}}$，得证。

综上，该部分复杂度为 $O(n\times k^{\frac{3}{4}}\times\log(k^{\frac{3}{4}}))$。

- 存在恰好一个 $b_i \geq \sqrt{k}$。

那么我们可以直接枚举这个 $i$，发现 $i$ 左侧和右侧 $b_j$ 的乘积均 $\le \sqrt{k}$。令 $h_j$ 表示现暂时不选 $b_i$，其他所有位置都选之后乘积为 $j$ 时的最大值。这个可以利用 $f_{i-1}$ 和 $g_{i+1}$ 快速处理。

然后我们枚举除了 $b_i$ 的所有 $b_j$ 的乘积 $t$，推出 $b_i$ 的值最小是多少，计算出 $\lfloor\frac{a_i}{b_i}\rfloor\frac{1}{a_i}$ 即第 $i$ 个数的贡献，乘上 $h_t$ 即可。

该部分复杂度为 $O(n\sqrt{k})$。

综上，总复杂度为 $O(n\times k^{\frac{3}{4}}\times\log(k^{\frac{3}{4}}))$，可以~~不知道为什么但只跑了1.5s~~通过此题。

```cpp
#include<bits/stdc++.h>
using namespace std;
const int B=177830;
const int B2=6600;
int n,w,a[103];
double f[103][B+3],g[103][B+3],ans;
vector<int>v;
double h[B2+3];
int main(){
	cin>>n>>w;
	for(int i=1;i<=n;i++)
		cin>>a[i];
	f[0][1]=1;
	for(int i=1;i<=n;i++){
		for(int j=1;j<=B;j++)
			for(int k=1;k<=B/j;k++)
				f[i][j*k]=max(f[i][j*k],f[i-1][j]*(1.0*(a[i]/k)/a[i]));
		for(int j=B;j>0;j--)
			f[i][j]=max(f[i][j],f[i][j+1]);
	}
	g[n+1][1]=1;
	for(int i=n;i;i--){
		for(int j=1;j<=B;j++)
			for(int k=1;j*k<=B;k++)
				g[i][j*k]=max(g[i][j*k],g[i+1][j]*(1.0*(a[i]/k))/a[i]);
		for(int j=B;j>0;j--)
			g[i][j]=max(g[i][j],g[i][j+1]);
	}
	for(int i=0;i<=n;++i)for(int j=1;j<=B;++j)
	    if((w+j-1)/j<=B)ans=max(ans,f[i][j]*g[i+1][(w+j-1)/j]);
	for(int i=1;i<=n;++i){
		if(1){
			for(int j=1;j<=B2;++j)h[j]=0;
			for(int j=1;j<=B2;++j)
				for(int k=1;k*j<=B2;++k)
					h[j*k]=max(h[j*k],f[i-1][j]*g[i+1][k]);
			for(int j=B2;j;--j)h[j]=max(h[j],h[j+1]);
			for(int j=1;j<=B2;++j){
				int ee=(w+j-1)/j;ee=max(ee,1);
				if(ee>a[i])continue;
				int e2=a[i]/ee;
				ans=max(ans,1.0*e2/(1.0*a[i])*h[j]);
			}
		}
	}
	cout<<fixed<<setprecision(15)<<ans*w<<'\n';
}
```
