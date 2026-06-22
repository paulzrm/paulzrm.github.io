---
title: "CF903D Almost Difference 题解"
date: 2019-11-06 16:27:36
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "va2v9dsy"
source: "https://www.luogu.com.cn/article/va2v9dsy"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/va2v9dsy)。

这是什么题目啊，竟然回爆long long.....

这里介绍一个不用压位的方法

---

思路：

分类讨论即可

1.直接加上所有的y-x

2.单独处理所有的|x-y|$\le$1的情况

复杂度:O(n)

map是O(n log n)

注意:对于爆long long 的情况，可以用long double

只不过会慢一点，而且精度只比long long 大一点

---

```cpp
#include<bits/stdc++.h>
#define ld long double
#define ll long long
using namespace std;
const int mxn=200005;
map<ld,ld>cnt_m;
ld l_cnt[mxn],h_cnt[mxn],sum[mxn],ans,n,a[mxn];
int main(){
	cin>>n;
	for(ll i=1;i<=n;++i)cin>>a[i];
	for(ll i=n;i;--i){            //从后往前统计，就不用二分了
		++cnt_m[a[i]];
		l_cnt[i]=cnt_m[a[i]-1];
		h_cnt[i]=cnt_m[a[i]+1];
		sum[i]=sum[i+1]+a[i];
	}
	for(ll i=1;i<=n;++i)ans+=sum[i]-a[i]*(n-i+1)+l_cnt[i]-h_cnt[i];
	cout<<fixed<<setprecision(0)<<ans<<endl;  //一定要控制输出的小数位为0！否则会输出类似于1e9+09之类的东西
}
```
