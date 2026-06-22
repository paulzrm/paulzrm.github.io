---
title: 手写常用C++ STL 模板
date: '2022-05-01T00:00:00+08:00'
tags:
- 技巧
---

栈，pair，队列，分数类，vector

<!-- more -->

```cpp
#include<bits/stdc++.h>
#define ll long long
using namespace std;

const int MaxSn=1e6+6;
struct Stack{
	int sta[MaxSn],Top;
	inline void init(){
		memset(sta,0,sizeof(sta));
		Top=0;
	}
	inline void push(int x){sta[++Top]=x;}
	inline int top(){return sta[Top];}
	inline void pop(){--Top;}
};

struct Pair{
	int x,y;
	inline bool operator <(const Pair a)const{
		if(x!=a.x)return x<a.x;
		return y<a.y;
	}
	inline bool operator ==(const Pair a)const{
		return x==a.x and y==a.y;
	}
	inline bool operator >(const Pair a)const{
		if(x!=a.x)return x>a.x;
		return y>a.y;
	}
	inline bool operator !=(const Pair a)const{
		return x!=a.x or y!=a.y;
	}
};
inline Pair MakePair(int x,int y){Pair tmp;tmp.x=x,tmp.y=y;return tmp;}

const int MaxQn=262144;
const int Mod=262143;
struct Queue{
	int q[MaxQn],head,tail;
	inline void init(){
		head=262141,tail=262141;
		memset(q,0,sizeof(q));
	}
	inline bool empty(){return head==tail;}
	inline int getNext(int x){return (x+1)&Mod;}
	inline void push(int x){
		q[tail]=x;
		tail=getNext(tail);
	}
	inline int front(){return q[head];}
	inline void pop(){head=getNext(head);}
};

struct frac{
	ll num,den;
	frac(ll num=0,ll den=1){
		if(den<0){
			num=-num;
			den=-den;
		}
		assert(den!=0);
		ll g=__gcd(abs(num),den);
		this->num=num/g;
		this->den=den/g;
	}

	frac init(int _n,int _d){num=_n,den=_d;}
	frac init0(){num=0,den=1;}
	frac init1(){num=1,den=1;}

	frac operator +(const frac &o)const{return frac(num*o.den+den*o.num,den*o.den);}
	frac operator -(const frac &o)const{return frac(num*o.den-den*o.num,den*o.den);}
	frac operator *(const frac &o)const{return frac(num*o.num,den*o.den);}
	frac operator /(const frac &o)const{return frac(num*o.den,den*o.num);}

	bool operator <(const frac &o)const{return num*o.den<den*o.num;}
	bool operator >(const frac &o)const{return num*o.den>den*o.num;}
	bool operator ==(const frac &o)const{return num*o.den==den*o.num;}
	bool operator !=(const frac &o)const{return num*o.den!=den*o.num;}
	bool operator =(const frac &o){den=o.den,num=o.num;return 1;}

	void print(){printf("%d/%d",num,den);}
	void println(){printf("%d/%d\n",num,den);}
	void printspace(){printf("%d/%d ",num,den);}

	void read(){scanf("%I64d/%I64d",&num,&den);}
};

template<class T>
class Vector{
    private:
        T* data;
        int len;
        int size;
    public:
        Vector(){
            data=NULL;
            len=size=0;
        }
        void clear(){
            data=NULL;
            len=size=0;
		}
        Vector(int _len){
            data=new T[_len];
            len=_len;
            size=0;
        }
        T& operator[](int index){return data[index];}
        const Vector& push_back(const T tmp){
            if(size>=len){
                T* newData=new T[len*2+1];
                memcpy(newData,data,len*sizeof(T));
                delete []data;
                data=newData;
                len=2*len+1;
            }
            data[size++]=tmp;
            return *this;
        }
        int getSize(){return size;}
};
```
