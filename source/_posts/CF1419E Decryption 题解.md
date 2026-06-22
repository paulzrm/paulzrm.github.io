---
title: "CF1419E Decryption 题解"
date: 2020-09-20 19:55:50
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "ikr9a8ul"
source: "https://www.luogu.com.cn/article/ikr9a8ul"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/ikr9a8ul)。

人菜，只会打暴力

~~虽然是用小号，~~ 但还是div2里第一个AC的

由于每操作一次就相当于将两个不互质的数变得互质，所以我们的目标是找到一种排列使得相邻两个数不互质的数量尽可能的少。

考虑分解质因数。将由相同质因数的放在一起，留下一个做为连接这个质因数与下一个质因数的桥梁。

暴力即可。

```cpp
#include<bits/stdc++.h>
#define ll long long
#define reg register
#define mp make_pair
#define ri register int
#define ld long double
using namespace std;
const int mxn=2e5+5;
vector<int>g[mxn];
int n,m;
int a[mxn];
vector<int>ps;
inline void solve(){
	cin>>n;ps.clear();int tn=n;
	vector<int>v;v.clear();
	for(int i=2;i*i<=n;++i){
		if(n%i==0){
			v.push_back(i);
			if(i!=n/i)v.push_back(n/i);
		}
	}
	v.push_back(n);
	sort(v.begin(),v.end());
	for(int i=2;i*i<=tn;++i){
		if(tn%i==0){
			ps.push_back(i);
			for(;tn%i==0;)tn/=i;
		}
	}
	if(tn!=1)ps.push_back(tn);
	if(ps.size()==1){
		for(int i:v)cout<<i<<' ';
		cout<<'\n'<<0<<'\n';
		return;
	}
	if(ps.size()==2 and v.size()==3){
		cout<<v[0]<<' '<<v[1]<<' '<<v[2]<<'\n';
		cout<<1<<'\n';
		return;
	}
	if(ps.size()>2){
		for(int i=0;i<ps.size()-1;++i){
			if(i){
				for(int j=0;j<v.size();++j){
					if(v[j]%ps[i]==0 ){
						if(v[j]!=ps[i]*ps[i+1])cout<<v[j]<<' ';
						v.erase(v.begin()+j);
						--j;
					}
				}
				cout<<ps[i]*ps[i+1]<<' ';
			}else{
				cout<<ps[i]*ps[ps.size()-1]<<' ';
				for(int j=0;j<v.size();++j){
					if(v[j]%ps[i]==0 ){
						if(v[j]!=ps[i]*ps[i+1] and v[j]!=ps[i]*ps[ps.size()-1])cout<<v[j]<<' ';
						v.erase(v.begin()+j);
						--j;
					}
				}
				cout<<ps[i]*ps[i+1]<<' ';
			}
		}
		for(int i:v)cout<<i<<' ';cout<<"\n0\n";
	}else{//只有两个质因数的时候不用留桥梁，需要特判
		for(int i=0;i<ps.size()-1;++i){
			if(i){
				for(int j=0;j<v.size();++j){
					if(v[j]%ps[i]==0 ){
						if(v[j]!=ps[i]*ps[i+1])cout<<v[j]<<' ';
						v.erase(v.begin()+j);
						--j;
					}
				}
				cout<<ps[i]*ps[i+1]<<' ';
			}else{
				cout<<ps[i]*ps[ps.size()-1]<<' ';
				for(int j=0;j<v.size();++j){
					if(v[j]%ps[i]==0 ){
						if(v[j]!=ps[i]*ps[i+1] and v[j]!=ps[i]*ps[ps.size()-1])cout<<v[j]<<' ';
						v.erase(v.begin()+j);
						--j;
					}
				}
			}
		}
		for(int i:v)cout<<i<<' ';cout<<"\n0\n";
	}
}
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	int T=1;cin>>T;
	for(;T--;)solve();
}
```
