---
title: "CF1634D Finding Zero 题解"
date: 2022-02-11 13:57:55
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "2etsnoml"
source: "https://www.luogu.com.cn/article/2etsnoml"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/2etsnoml)。

**Warning：可能比官方题解复杂的多，思维难度估计要上紫，但推出来了能有很好的训练效果**

$\color{white}\text{~~然后你们知道为啥 div2 rank1 的 YuezhengLing 最后才过D了吧~~}$

---

令 $x$ 为隐藏的数组。

这个方法的大体思路就是，通过两次全数组的询问，得到两个数的位置（$0$  和最大的数），然后上传这两个位置。

我们考虑这么询问:

固定前两个数 $(1,2)$ 不动，询问 $(1,2,i)$，记得到的序列为 $a$。询问 $n-2$ 次。记最大的 $a_i$ 的下标 $i$ 为 $pos_1$。

然后固定 $(1,pos_1)$ 不动，询问 $(1,pos_1,i)$，记得到的序列为 $b$。询问 $n-2$ 次。记最大的 $b_i$ 的下标 $i$ 为 $pos_2$。

显然，$pos_1 \neq pos_2$，因为我们 $b$ 询问不会询问 $(1,pos_1,pos_1)$

然后我们来想，如何利用 $a$ 数组和 $b$ 数组，来推断出答案。

我赛时的注释：

```
//now if both x[1] and x[2] isn't 0 this is okay
//if x[2] is 0? what will happen?
//a[i] will be x[i]. How to ensure it?
//we can ask(2,pos1,pos2) to check
//if x[1] is 0: it is smaller than either a[pos1] or a[pos2] we can return [1,1]
//if x[2] is 0: this returns a[pos1 or pos2] then we can return [2,pos1 or pos2]
//otherwise we can return [pos1,pos2]
//oops,there still can be x[1] is max and pos1 is zero

```

我们要分类讨论（如何判断是哪一类待会儿讲）：

+  $0$ 和最大的数都不在 $1$ 和 $2$ 两个位置上

显然，对于这种情况，我们求得的 $pos_1$ 和 $pos_2$ 就可以做为答案上传。因为，如果 $x_1$ 和 $x_2$ 都不是 $0$ 或最大值的话，第一遍求得的 $pos_1$ 肯定是 $0$ 或 最大值。（如果想不明白的话，画个数轴看看就知道了）

然后第二遍询问，因为询问的东西带上了 $pos_1$，故得到的 $pos_2$ 一定是另外一个极值。（因为这样的话 $max-min$ 才会最大）

+ $b_i$ 的值全相同

我们的 $pos_1$ 肯定是一个极值（排除 $x_1,x_2$ 均为极值的情况），然后就可以肯定 $(1,pos_1)$ 为两个极值，上传。

+ $a_i$ 的值全相同

有可能 $x_1$ 是极值，所以我们需要用一次询问来特判这种情况。

询问$(1,pos_1,pos_2)$，返回值记为 $tmp$。

如果说，$tmp$ 大于任意 $a_i$ 的话，我们可以直接返回 $(1,2)$，感性理解容易。

+ Otherwise

通过不断的尝试，我发现此时询问 $(2,pos_1,pos_2)$ 可以有很大的用处：

我们令这次询问的返回值为 $rt$。

+ （$rt < a_{pos_1}$ 且 $rt \le a_{pos_2}$）或（$rt \le a_{pos_2}$ 且  $rt < a_{pos_1}$）

注意，一个是严格小于，另一个是小于等于。

这种情况对应了 $x_1$ 或 $x_2$ 为 $0$，因为：

$a_{pos_2}$ 查询的是 $(1,2,pos_2)$，$rt$ 查询的是 $(2,pos_1,pos_2)$

两者的区别就在于，一个是 $1$，一个是 $pos_1$。

然而，此时的 $rt$ 小于 $a_{pos_1}$，就说明，$x_1$ 会更往极端走一些。

然后到了这里，我们似乎发现了一个漏洞：$x_1$ 也许是最大值呀？

但这里我们之前已经排除这种情况了（$a$ 数组全部相同的情况），故排除。

但上述讨论都是基于 $x_2$ 不为 $0$ 的情况。保险起见，我们上传 $(1,2)$ 做为可能的答案。

+ $rt=a_{pos_1}$

通过比较 $a_pos1$ 和 $rt$ 查询的内容可以发现，在这种情况下，$x_2$ 和 $x_{pos_1}$ 中必然有一个是 $0$。应为此时的 $pos_2$ 也应该是向着极值发展的，然而改变后并没有使 $rt$ 和 $a_{pos_1}$ 变得不同，故 $x_2$ 和 $x_{pos_1}$ 为两个极值，上传 $(2,pos_1)$

+ $rt=a_{pos_2}$

同理，上传 $(2,pos_2)$

+ Otherwise


平凡情况，上传 $(pos_1,pos_2)$

---

次数：

询问次数为 $2n-3$ 或 $2n-2$ 次，符合要求。

---

code:

```cpp
#include<bits/stdc++.h>
using namespace std;
#define ll long long
#define mp make_pair
#define reg register
const int mxn=1e3+3;
int n;
int a[mxn],b[mxn];
inline int ask(int x,int y,int z){
	cout<<"? "<<x<<' '<<y<<' '<<z<<endl;
	fflush(stdout);
	int rt;cin>>rt;
	return rt;
}
inline void print(int x,int y){
	cout<<"! "<<x<<' '<<y<<endl;
	fflush(stdout);
	return;
}
inline void solve(){
	cin>>n;
	memset(a,0,sizeof(a));
	memset(b,0,sizeof(b));
	int pos1=1;
	int allsame=1;
	int lst=-1;
	for(int i=3;i<=n;++i){
		a[i]=ask(1,2,i);
		if(a[i]>a[pos1])pos1=i;
		if(lst==-1)lst=a[i];
		else{
			if(a[i]!=lst){
				lst=a[i];
				allsame=0;
			}
		}
	}
	int allsame2=1,lst2=-1;
	int pos2=1;
	for(int i=2;i<=n;++i){
		if(i==pos1)continue;
		b[i]=ask(1,i,pos1);
		if(b[i]>=b[pos2])pos2=i;
		if(lst2==-1)lst2=b[i];
		else if(lst2!=b[i])allsame2=0;
	}
	if(pos2==2)++pos2;   //当n较小的时候可能会出现pos2=2的阴间情况，需手动更改
	if(pos2==pos1)++pos2;

	if(allsame==1){//this can all be x[1]-x[2]
		int t=ask(1,pos1,pos2);
		if(t<lst){
			print(1,2);
			return;
		}
	}
	//now if both x[1] and x[2] isn't 0 this is okay
	//if x[2] is 0? what will happen?
	//a[i] will be x[i]. How to ensure it?
	//we can ask(2,pos1,pos2) to check
	//if x[1] is 0: it is smaller than either a[pos1] or a[pos2] we can return [1,1]
	//if x[2] is 0: this returns a[pos1 or pos2] then we can return [2,pos1 or pos2]
	//otherwise we can return [pos1,pos2]
	//oops,there still can be x[1] is max and pos1 is zero
	if(allsame2==1){
		print(1,pos1);
		return;
	}
	int t=ask(2,pos1,pos2);
	if((t<a[pos1] and t<=a[pos2]) or (t<=a[pos1] and t<a[pos2])){
		print(1,2);
		return;
	}
	if(t==a[pos1]){
		print(2,pos1);
		return;
	}
	if(t==a[pos2]){
		print(2,pos2);
		return;
	}

	print(pos1,pos2);
	return;
}
int main(){
	int T=1;
	cin>>T;
	for(;T--;)solve();
	return 0;
}
```
