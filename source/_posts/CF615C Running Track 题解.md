---
title: "CF615C Running Track 题解"
date: 2021-06-22 19:02:08
categories:
  - 题解
tags:
  - 题解
  - 洛谷
luogu_article: "kofqj4gf"
source: "https://www.luogu.com.cn/article/kofqj4gf"
---

> 本文迁移自[洛谷原文](https://www.luogu.com.cn/article/kofqj4gf)。

首先我们可以先贪心的想：

假设我们已经匹配到了 $t$ 串的第 $i$ 位，那么有一个结论，就是如果 $t$ 的子串 $t_{i\dots j}$ 是 $s$ 的子串，而 $t_{i\dots j+1}$ 不是，那么最优方案一定是将 $t_{i\dots j}$ 整个截下来。

可以感性证明：如果不用 $t_{i\dots j}$，用 $t_{i\dots j-1}$，那么  $t_{i\dots j-1}$ 肯定是在 $s$ 中的；但如果第 $j$ 个字符加到了后面，就不能确定原来的那一段加上它后是否还在 $s$ 中，就可能不是最优了。

如果暴力地枚举复杂度会达到 $O(n^3)$；

但如果对于 $i$ 二分最远可以匹配到的地方就可以优化到 $O(n^2log_2n)$。

ps. 我写的这个字符串匹配实质上是 $O(n^2)$ 的，但由于题目的要求跑起来实质上跟 $O(n)$ 的差不多。如果总时限要稳在 $O(n^2log_2n)$ 就可以写个  kmp 处理，但会变得更复杂。

code:

---

```cpp
using namespace std;
const int mxn=2e5+5;
string a,b,ta;
int n,m;
vector<pair<int,int> >ans;
inline bool check(int bg,int ed){           //正反都匹配
	if(ed-bg+1>a.size())return 0;
	string t=b.substr(bg,ed-bg+1);
	for(int i=0;i<a.size()-t.size()+1;++i){
		bool ok=1;
		for(int j=0;j<t.size();++j){
			if(a[i+j]!=t[j]){
				ok=0;
				break;
			}
		}
		if(ok)return 1;
	}
	for(int i=0;i<ta.size()-t.size()+1;++i){
		bool ok=1;
		for(int j=0;j<t.size();++j){
			if(ta[i+j]!=t[j]){
				ok=0;
				break;
			}
		}
		if(ok)return 2;
	}
	return 0;
}
inline pair<int,int> getp(int bg,int ed){       //找到位置
	string t=b.substr(bg,ed-bg+1);
	for(int i=0;i<a.size()-t.size()+1;++i){
		bool ok=1;
		for(int j=0;j<t.size();++j){
			if(a[i+j]!=t[j]){
				ok=0;
				break;
			}
		}
		if(ok)return mp(i,i+t.size()-1);
	}
	for(int i=0;i<ta.size()-t.size()+1;++i){
		bool ok=1;
		for(int j=0;j<t.size();++j){
			if(ta[i+j]!=t[j]){
				ok=0;
				break;
			}
		}
		if(ok)return mp(a.size()-i-1,a.size()-i-t.size());
	}
}
inline string E(int bg,int ed){
	return b.substr(bg,ed-bg+1);
}
inline void solve(){
	cin>>a>>b;ta=a;reverse(ta.begin(),ta.end());
	n=a.size(),m=b.size();
	int b=0;
	for(;b<m;++b){    //b是当前处理到的字符串的开头位置
		int l=b,r=m,md;
		for(;l<r-1;){   //二分
			md=l+r>>1;
			if(check(b,md))l=md;
			else r=md;
		}
		if(l==b and !check(b,l)){  //可能是无法匹配
			cout<<"-1\n";
			return;
		}
		if(check(b,l)==1)ans.push_back(getp(b,l));  //贪心过头了，最后一小截没法匹配，与上一个串合并
		b=l;
	}
	cout<<ans.size()<<'\n';
	for(int i=0;i<ans.size();++i)cout<<ans[i].first+1<<' '<<ans[i].second+1<<'\n';
	return;
}
int main(){
	ios_base::sync_with_stdio(false);
	cin.tie(0),cout.tie(0);
	int T=1;//cin>>T;
	for(;T--;)solve();
}
```
