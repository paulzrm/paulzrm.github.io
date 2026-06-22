---
title: "CF903F Clear The Matrix 题解"
date: 2022-02-19 17:24:03
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "sbtaedbl"
source: "https://www.luogu.com.cn/article/sbtaedbl"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/sbtaedbl)。

题目大意：

有一个 $4\times n$ 的 $01$ 矩阵。你每次可以选择一个 $k \times k (1 \le k \le 4)$ 大小的子矩阵，将其中的值都赋为 $0$，代价为 $a_k$。问你最小的代价使得整个矩阵的值都为 $0$。

题解：

萌萌题。

看到只有 $4$ 行就想到可以状压 $dp$。

令 $dp_{i,mask}$ 表示考虑到底 $i$ 列，当前第 $i-3$ 至 $i-1$ 列的状态为 $msk$。

我们考虑从前往后赋值。$dp_i$ 能够转移到 $dp_{i+1}$ 当且仅当第 $i-3$ 列已经全部赋值为 $0$了，因为到后面就再也不可能赋值它了。

但这个转移有点恶心，具体的可以参照代码里的注释。

```cpp
using namespace std;
char c[5][1005];
int n,p,q,r,s;
bool a[5][1005];
int dp[1005][5555];
int tmp[5][5];     //tmp是当前考虑的第 i-3 列至第 i 列的矩阵的值
inline int get(){   //解压
	int rt=0,cnt=0;
	for(int i=1;i<=4;++i){
		for(int j=2;j<=4;++j){
			rt+=tmp[i][j]<<cnt;
			++cnt;
		}
	}
	return rt;
}
inline void rget(int msk){ //对这三列进行压缩
	for(int i=1;i<=4;++i){
		for(int j=1;j<=3;++j){
			tmp[i][j]=msk&1;
			msk>>=1;
		}
	}
}
inline void Min(int&x,int y){if(x>y)x=y;}
int tmpc[555][5][5],sta;//这个tmpc是在转移的时候存储tmp，应为我们要模拟赋值对tmp更改 前面还要开一维是应为它是递归，如果不开会覆盖上一层存储的东西
inline void cpy(){++sta;for(int i=1;i<=4;++i)for(int j=1;j<=4;++j)tmpc[sta][i][j]=tmp[i][j];}//存储
inline void rcpy(){for(int i=1;i<=4;++i)for(int j=1;j<=4;++j)tmp[i][j]=tmpc[sta][i][j];--sta;}//还原
inline void go(int i,int j,int msk,int cur=0){//考虑如何把最前面那一列全部赋为 0
	if(j==5){//到头了
		Min(dp[i+1][get()],dp[i][msk]+cur);
		return;
	}
	if(j==1)Min(dp[i+1][0],dp[i][msk]+s);//覆盖 4*4 的
	if(j<=2){ //3*3
		cpy();
		for(int e=0;e<3;++e)for(int f=0;f<3;++f)tmp[j+f][e+1]=0;
		go(i,j+1,msk,cur+r);
		rcpy();
	}
	if(j<=3){ //2*2
		cpy();
		for(int e=0;e<2;++e)for(int f=0;f<2;++f)tmp[j+f][e+1]=0;
		go(i,j+1,msk,cur+q);
		rcpy();
	}
	{//1*1
		cpy();
		tmp[j][1]=0;
		go(i,j+1,msk,cur+p);
		rcpy();
	}
	if(tmp[j][1]==0)go(i,j+1,msk,cur);//因为不用覆盖，可以考虑直接跳到下一行
}
inline void solve(){
	cin>>n>>p>>q>>r>>s;
	for(int i=1;i<=4;++i){
		for(int j=1;j<=n;++j)cin>>c[i][j];
		for(int j=n+1;j<=n+3;++j)c[i][j]='.';
	}
	n+=3;//我们从第4列开始考虑的，而且转移的时候是要求第 i-3 列全部清空，如果不 +3 的话第 n-2 列至第 n 列就会没有被考虑进去
	for(int i=1;i<=4;++i){
		for(int j=1;j<=n;++j){
			if(c[i][j]=='.')a[i][j]=0;
			else a[i][j]=1;
		}
	}
	memset(dp,63,sizeof(dp));
	int inf=dp[0][0];
	for(int i=1;i<=4;++i)for(int j=1;j<=3;++j)tmp[i][j+1]=a[i][j];
	dp[4][get()]=0;
	for(int i=4;i<=n;++i){
		for(int msk=0;msk<(1<<12);++msk){
			if(dp[i][msk]>=inf)continue;
			rget(msk);
			for(int j=1;j<=4;++j)tmp[j][4]=a[j][i];
			go(i,1,msk);
		}
	}
	cout<<dp[n+1][0]<<'\n';
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
