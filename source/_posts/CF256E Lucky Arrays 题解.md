---
title: "CF256E Lucky Arrays 题解"
date: 2021-01-24 22:58:51
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "carqxqk0"
source: "https://www.luogu.com.cn/article/carqxqk0"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/carqxqk0)。

这里是全网唯一一份分块的题解（也可能是唯一一份分块卡过去的做法）。

---

现将这 $n$ 个数分块。

令 $dp_{f,i,j}$ 表示考虑到某一块中，考虑到第 $i$ 个位置，上一个位置填的数是 $j$ 时，这一块的开头为 $f$ 的方案数对 $dp_{i,j}$ 的贡献的系数。注意，这里是系数，为了好带入到查询时的整合。可以发现，$f$ 对于转移无关。

处理更新的代码：

```cpp
	inline void go(){
		memset(dp,0,sizeof(dp));
		if(a[0]==0){
			for(ri f=1;f<=3;++f){   //不确定，枚举
				dp[f][0][f]=1;
				for(ri i=1;i<sz;++i){
					ri t=a[i];
					if(a[i]==0){    //分类转移
						for(t=1;t<=3;++t)
							for(ri p=1;p<=3;++p)if(c[p][t]==1)add(dp[f][i][t],dp[f][i-1][p]);
					}else{
						for(ri p=1;p<=3;++p)if(c[p][t]==1)add(dp[f][i][t],dp[f][i-1][p]);
					}
				}
			}
		}else{     //已经确定块头必须是多少
				ri f=a[0];
				dp[f][0][f]=1;
				for(ri i=1;i<sz;++i){
					ri t=a[i];
					if(a[i]==0){
						for(t=1;t<=3;++t)
							for(ri p=1;p<=3;++p)if(c[p][t]==1)add(dp[f][i][t],dp[f][i-1][p]);
					}else
						for(ri p=1;p<=3;++p)if(c[p][t]==1)add(dp[f][i][t],dp[f][i-1][p]);
				}
		}
	}
```

然后，查询时有些复杂：

首先，单独处理好整个数列的第一个块（因为 $dp$ 存的是系数，不好接入）。

然后，对于接下来的每个块，考虑与上一个块的末尾相接。

先处理好每个块的块首的答案，然后利用 $dp$ 直接计算得到块尾的答案。

注意要时时刻刻取模。

这样，分块的做法就写好了。

**不过，如果你只做到了这儿，你只会想绝大多数分块一样TLE 11**

---

一些优化：

+ 对于查询时的处理，将 $dp[3]$ 展开成 $x,y,z$ 来节省常数

+ 尽量的去掉大括号

+ register inline

+ 快读快输，火车头

+ 快的大小是信仰数 ~~srand('xhztxdy')~~

+ 使用 C++14 来替代 C++11

---

痛苦的心路历程(在 mashups 不断测试)：

![](https://cdn.luogu.com.cn/upload/image_hosting/xaysi6hy.png)

---

整体代码：

```cpp

#include<bits/stdc++.h>
#define ll long long
#define reg register
#define mp make_pair
#define ri register int
#define ld long double
using namespace std;
const int maxn=70007;
char buffer[maxn],*S,*T;
inline char Get_Char(){
    if(S==T){
        T=(S=buffer)+fread(buffer,1,maxn,stdin);
        if(S==T)return EOF;
    }
    return *S++;
}

inline int read(){
    char c;
    int re=0,f=0;
    for(c=Get_Char();c<'0' or c>'9';c=Get_Char())if(c=='-')f=1;
    for(;c>='0' and c<='9';)re=(re<<1)+(re<<3)+(c-'0'),c=Get_Char();
    if(f)return -re;
    return re;
}

inline void read(int&x){
    char c;
    int re=0,f=0;
    for(c=Get_Char();c<'0' or c>'9';c=Get_Char())if(c=='-')f=1;
    for(;c>='0' and c<='9';)re=(re<<1)+(re<<3)+(c-'0'),c=Get_Char();
    if(f)x=-re;
    else x=re;
}
const int mxn=78787;
vector<int>g[mxn];
int n,q;
int a[mxn];
int c[4][4];
const int siz=225;
const int md=777777777;
inline void add(int&x,int y){
	x+=y;
	if(x>=md)x-=md;
}
struct tmp{
	ll x,y,z;
	inline void G(){
		x%=md;
		y%=md;
		z%=md;
	}
};
struct ttmp{tmp x,y,z;};
struct kuai{
	int dp[4][siz][4],a[siz],sz;
	inline void init(){
		sz=0;memset(a,0,sizeof(a));
	}
	inline void go(){                //更新
    memset(dp,0,sizeof(dp));
		if(a[0]==0){
			for(ri f=1;f<=3;++f){
				dp[f][0][f]=1;
				for(ri i=1;i<sz;++i){
					ri t=a[i];
					if(a[i]==0){
						for(t=1;t<=3;++t)
							for(ri p=1;p<=3;++p)if(c[p][t]==1)add(dp[f][i][t],dp[f][i-1][p]);
					}else{
						for(ri p=1;p<=3;++p)if(c[p][t]==1)add(dp[f][i][t],dp[f][i-1][p]);
					}
				}
			}
		}else{
				ri f=a[0];
				dp[f][0][f]=1;
				for(ri i=1;i<sz;++i){
					ri t=a[i];
					if(a[i]==0){
						for(t=1;t<=3;++t)
							for(ri p=1;p<=3;++p)if(c[p][t]==1)add(dp[f][i][t],dp[f][i-1][p]);
					}else
						for(ri p=1;p<=3;++p)if(c[p][t]==1)add(dp[f][i][t],dp[f][i-1][p]);
				}
		}
	}
	inline ttmp ret(){return (ttmp){(tmp){dp[1][sz-1][1],dp[1][sz-1][2],dp[1][sz-1][3]},(tmp){dp[2][sz-1][1],dp[2][sz-1][2],dp[2][sz-1][3]},(tmp){dp[3][sz-1][1],dp[3][sz-1][2],dp[3][sz-1][3]}};}
}k[mxn/siz+3];
inline void solve(){
	read(n),read(q);
	for(ri i=1;i<=3;++i)for(int j=1;j<=3;++j)read(c[i][j]);
	for(ri i=0;i<mxn/siz+3;++i)k[i].init();
	for(ri i=0;i<n;++i)++k[i/siz].sz;
	int num=(n+siz-1)/siz;
	for(ri i=0;i<=num;++i)k[i].go();
	for(;q--;){
		ri x,t;read(x),read(t);--x;
		k[x/siz].a[x%siz]=t;
		k[x/siz].go();
		reg tmp cur;
		ri ta=k[0].a[0];
		if(!ta)cur.x=1,cur.y=1,cur.z=1;    //处理第一块
		else{
			cur.x=0,cur.y=0,cur.z=0;
			if(ta==1)cur.x=1;
			if(ta==2)cur.y=1;
			if(ta==3)cur.z=1;
		}
		{
			ttmp tt=k[0].ret();
			reg tmp x=tt.x,y=tt.y,z=tt.z;
			tmp nw;
				nw.x=x.x*cur.x+y.x*cur.y+z.x*cur.z;
				nw.y=x.y*cur.x+y.y*cur.y+z.y*cur.z;
				nw.z=x.z*cur.x+y.z*cur.y+z.z*cur.z;
			nw.G();
			cur=nw;
		}
		for(ri i=1;i<num;++i){
			ri ta=k[i].a[0];
			reg tmp ne;ne.x=0,ne.y=0,ne.z=0;
			if(ta==0){                   //处理块首
					if(c[1][1])ne.x+=cur.x;
					if(c[2][1])ne.x+=cur.y;
					if(c[3][1])ne.x+=cur.z;
					if(c[1][2])ne.y+=cur.x;
					if(c[2][2])ne.y+=cur.y;
					if(c[3][2])ne.y+=cur.z;
					if(c[1][3])ne.z+=cur.x;
					if(c[2][3])ne.z+=cur.y;
					if(c[3][3])ne.z+=cur.z;
			}
			if(ta==1){
					if(c[1][1])ne.x+=cur.x;
					if(c[2][1])ne.x+=cur.y;
					if(c[3][1])ne.x+=cur.z;
			}
			if(ta==2){
					if(c[1][2])ne.y+=cur.x;
					if(c[2][2])ne.y+=cur.y;
					if(c[3][2])ne.y+=cur.z;
			}
			if(ta==3){
					if(c[1][3])ne.z+=cur.x;
					if(c[2][3])ne.z+=cur.y;
					if(c[3][3])ne.z+=cur.z;
			}
			cur=ne;                       //得到块尾
			reg ttmp tt=k[i].ret();
			reg tmp x=tt.x,y=tt.y,z=tt.z;
			reg tmp nw;
				nw.x=x.x*cur.x+y.x*cur.y+z.x*cur.z;
				nw.y=x.y*cur.x+y.y*cur.y+z.y*cur.z;
				nw.z=x.z*cur.x+y.z*cur.y+z.z*cur.z;
				nw.G();
			cur=nw;
			cur.G();
		}
		ri ans=cur.x;add(ans,cur.y);add(ans,cur.z);
		printf("%d\n",ans);
	}
}
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	int T=1;//cin>>T;
	for(;T--;)solve();
}
```

---

加上信仰火车头是6kb

~~所以6kb干了2kb的活~~
