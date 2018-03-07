function g(s){
    var all = document.querySelectorAll(s);
    if(s.substr(0 , 1) == '#'){
        return all[0];
    }else{
        return all;
    }
}

function getStyle(obj, attr) {
    return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj, false)[attr];
}

function getPosition(node){
    var left = node.offsetLeft;
    var top = node.offsetTop;
    var parent = node.offsetParent();
    while(parent != null){
        left += parent.offsetLeft;
        top += parent.offsetTop;
        parent = parent.offsetParent;
    }
    return {"left":left,"top":top};//获取元素相对于屏幕左边距离
}

function startMove(obj,josn,fn){
    //obj.timer = typeof(obj.timer) == "undefined" ? null : obj.timer;
    //定义定时器
    clearInterval(obj.timer);
    //防止定时器叠加
    obj.timer = setInterval(function(){
        var flag = true;
        for(attr in josn) {
            getStyle = obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj, false)[attr];
            //动态获取样式
            icur = attr == 'opacity' ? Math.round(parseFloat(getStyle) * 100) : parseInt(getStyle);
            //需要四舍五入
            var speed = (josn[attr] - icur) / 8;
            //避免使用offset
            speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
            //ceil向上取整，floor向下取整
            if (icur != josn[attr]) {
                flag = false;
                //同时遍历，同时为真时才会真
            }
            obj.style[attr] = attr == 'opacity' ? (icur + speed) / 100 : icur + speed + 'px';

        }
        if(flag){
            clearInterval(obj.timer);
            if (fn) {
                fn();
            }
        }
    },30);
}

function scoll(obj){              //轮播图obj(box,img,li)
    this.len = obj.img.length;  //图片张数
    this.index = 0;
    this.k =0;
    //this.h = Math.round(parseFloat(obj.img.eq(0).height()));//var w = document.body.clientWidth;各浏览器可视宽度不一致
    //obj.box.height(this.h);          //动态修改box高度
    function isLeft(obj){
        var c = obj.css("left");
        return Math.round(parseFloat(c));
    }
    function getLeft(index,k){
        var r = k-index-1;
        if(r < -1){
            r = r+len;
        }
        return r*100+"%";
    }

    var timer;
    function startMove(){
        timer = setInterval(function(){
            index = index%len;
            for(i=0;i<len;i++){
                k = i;
                if(isLeft(obj.img.eq(k)) < 0){   //图片位置在左边时调用
                    obj.img.eq(k).css('left',100*(len-1)+"%");
                }
            }
            for(i=0;i<len;i++){
                k = i;
                obj.img.eq(k).animate({left:getLeft(index,k)})
            }
            index++;
            obj.li.removeClass('navHover');
            obj.li.eq(index%len).addClass('navHover');
        },5000)
    }

    startMove();  //初始调用

    obj.box.hover(function(){
        clearInterval(timer);//鼠标移动暂停
    },function(){
        startMove();
    })
    function lp(index,k){  //设置left坐标
        var left = (k-index)*100;
        if(left<0){
            var left = 100*len +left;  //如果坐标在左边则移到右边去
        }
        return left;
    }
    obj.li.hover(function(){
        index = obj.li.index(this);  //获取当前事件索引
        obj.li.removeClass('navHover');
        $(this).addClass('navHover');
        for(i=0;i<len;i++){
            k = i;
            obj.img.eq(k).css('left',lp(index,k)+"%");  //调用坐标函数
        }
    })
}

