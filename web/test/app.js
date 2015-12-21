/**
 * Created by User on 2015/12/18.
 */

function templete(){
    try{

    }catch(e){
        log(e.name+':'+e.message);
    }
}

/**
 * 生成window控件
 * @param $drag 按钮对象
 * @param type 控件类型
 * @param genCtrl 控件字符串
 */
function handleDragBtn($drag, type, genCtrl){
    $drag.pep({
        droppable: '.droppable',
        constrainTo: 'window',
        revert: true,
        revertAfter: 'stop',
        revertIf: function () {
            return !this.activeDropRegions.length;
        },
        overlapFunction: false,
        useCSSTranslation: false,
        initiate: function(ev,obj){
            //生成控件，并跟随浮动
            obj.$el.find('.content').append(genCtrl);
        },
        drag: function (ev, obj) {
            //转换事件适配触摸
            ev = obj.normalizeEvent(ev);
            //记录鼠标或触目点的移动位置，写到全局中
            obj.customPosix = {'x':ev.pep.x, 'y':ev.pep.y};
        },
        stop: function (ev, obj) {
            //移除按钮中的控件
            //插入到编辑区鼠标停留位置
            var $ctrl = obj.$el.find('.content');
            console.log(this.activeDropRegions.length)
            if(this.activeDropRegions.length !== 0){

                var $contaner = this.activeDropRegions[0];
                $contaner.append(genCtrl);

                var startPos = { left:obj.customPosix.x, top: obj.customPosix.y};
                switch (type){
                    case 1:
                        handleWindowCtrl($('.droppable .pep'), startPos);
                        break;
                    case 2:
                        break;
                    default :
                        break;
                }

            }
            //删除拖拽按钮中的控件
            $ctrl.html('');
        },
        rest: function (ev, obj){
            obj.revert();
        }
    });
}

/**
 * 生成window控件
 * @param $pep 控件对象
 * @param startPos 起始位置
 */
function handleWindowCtrl($pep, startPos ){
    if(!startPos) startPos = { left: null, top: null };
    $pep.pep({
        debug: true,
        droppable: '.droppable',
        dragIcon: '.window .coor',//添加的拖拽缩放功能
        minSize:{'w':100,'h':80},
        maxSize:null,
        constrainTo: 'window',
        elementsWithInteraction: '.window .title,.window .close',//指定某部分不会触发拖动
        revert: true,
        revertAfter: 'ease',
        revertIf: function () {
            return !this.activeDropRegions.length;
        },
        overlapFunction: false,
        useCSSTranslation: false,
        initiate: function(ev,obj){

            var el = obj.$el;
            el.find('.button.close').off('click').on('click',function(){
                //el.find('.content').html('');
                //obj.revert();
                el.remove();
                obj.options.constrainTo = 'window';
            });
        },
        startPos: startPos,
        start: function (ev, obj) {
            obj.noCenter = false;
        },
        drag: function (ev, obj) {
            //var vel = obj.velocity();
            //var rot = (vel.x) / 5;
            //rotate(obj.$el, rot);
        },
        stop: function (ev, obj) {
            //rotate(obj.$el, 0);
        },
        rest: handleCentering
    });
}

/**
 * 显示日志
 * @param msg
 */
function log(msg){
    if(typeof msg == 'undefined'){
        msg = 'undefined';
    }else{
        msg = msg.toString();
    }
    $('.display .content').prepend('<hr>').prepend(msg);
}

/**
 * 滑块滑动动画结束后回调
 * @param ev
 * @param obj
 */
function handleCentering(ev, obj) {
    try{
        log(obj.activeDropRegions.length);

        if (obj.activeDropRegions.length > 0) {
            //centerWithin(obj);
            var pis = insideWithin(obj);
            log(pis);
            var info = 'x:'+pis[0]+'px <br>'+
                'y:'+pis[1]+'px <br>'+
                'height:'+pis[2]+'px <br>'+
                'width:'+pis[3]+'px <br>';
            obj.$el.find('.content').html(info);

            //发送位置信息
            //callServer(pis);
        }
    }catch(e){
        log(e.name+':'+e.message);
    }

}

/**
 * 将滑块置于编辑区中间
 * @param obj
 */
function centerWithin(obj) {
    try{
        var $parent = obj.activeDropRegions[0];
        var pTop = $parent.position().top;
        var pLeft = $parent.position().left;
        var pHeight = $parent.outerHeight();
        var pWidth = $parent.outerWidth();

        var oTop = obj.$el.position().top;
        var oLeft = obj.$el.position().left;
        var oHeight = obj.$el.outerHeight();
        var oWidth = obj.$el.outerWidth();

        var cTop = pTop + (pHeight / 2);
        var cLeft = pLeft + (pWidth / 2);

        if (!obj.noCenter) {
            if (!obj.shouldUseCSSTranslation()) {
                var moveTop = cTop - (oHeight / 2);
                var moveLeft = cLeft - (oWidth / 2);
                obj.$el.animate({top: moveTop, left: moveLeft}, 50);
            } else {
                var moveTop = (cTop - oTop) - oHeight / 2;
                var moveLeft = (cLeft - oLeft) - oWidth / 2;
                obj.moveToUsingTransforms(moveTop, moveLeft);
            }

            obj.noCenter = true;

            //将移动块约束在编辑区内 [top, right, bottom, left]
            obj.$el.data('plugin_pep').options.constrainTo = [pTop,pLeft+pWidth-oWidth,pTop+pHeight-oHeight,pLeft];
            return;
        }

        obj.noCenter = false;
    }catch(e){
        log(e.name+':'+e.message);
    }

}

/**
 * 将滑块置于编辑区内
 * @param obj
 */
function insideWithin(obj) {
    try{
        var $parent = obj.activeDropRegions[0];

        var pTop = $parent.position().top;
        var pLeft = $parent.position().left;
        var pHeight = $parent.height();
        var pWidth = $parent.width();

        var oTop = obj.$el.position().top;
        var oLeft = obj.$el.position().left;
        var oHeight = obj.$el.outerHeight();
        var oWidth = obj.$el.outerWidth();

        var moveTop = oTop,moveLeft = oLeft;

        if (!obj.shouldUseCSSTranslation()) {

            if(pTop > oTop){
                moveTop = pTop;
            }else if(pTop+pHeight-oHeight < oTop){
                moveTop = pTop + pHeight - oHeight;
            }
            if(pLeft > oLeft){
                moveLeft = pLeft;
            }else if(pLeft+pWidth-oWidth < oLeft){
                moveLeft = pLeft + pWidth - oWidth;
            }
            obj.$el.animate({top: moveTop, left: moveLeft}, 0);
        } else {

            if(pTop > oTop){
                moveTop = pTop;
            }else if(pTop+pHeight-oHeight < oTop){
                moveTop = pTop + pHeight - oHeight/2;
            }
            if(pLeft > oLeft){
                moveLeft = pLeft;
            }else if(pLeft+pWidth-oWidth < oLeft){
                moveLeft = pLeft + pWidth - oWidth/2;
            }
            obj.moveToUsingTransforms(moveTop, moveLeft);
        }

        //将移动块约束在编辑区内 [top, right, bottom, left]
        obj.$el.data('plugin_pep').options.constrainTo = [pTop, pLeft+pWidth-oWidth, pTop+pHeight-oHeight, pLeft];

        //计算滑块相对编辑区的位置
        var fTop,fRight,fBottom,fLeft;
        fTop = moveTop - pTop;
        fLeft = moveLeft - pLeft;
        fRight = pWidth - fLeft - oWidth;
        fBottom = pHeight - fTop - oHeight;
        //var pis = [fTop.toFixed(2), fRight.toFixed(2), fBottom.toFixed(2), fLeft.toFixed(2)];
        var pis = [fTop.toFixed(2), fLeft.toFixed(2), oHeight.toFixed(2), oWidth.toFixed(2)];
        return pis;
    }catch(e){
        log(e.name+':'+e.message);
    }

}

/**
 * 在滑块被拖动时晃动
 * @param $obj
 * @param deg
 */
function rotate($obj, deg) {
    try{
        $obj.css({
            "-webkit-transform": "rotate(" + deg + "deg)",
            "-moz-transform": "rotate(" + deg + "deg)",
            "-ms-transform": "rotate(" + deg + "deg)",
            "-o-transform": "rotate(" + deg + "deg)",
            "transform": "rotate(" + deg + "deg)"
        });
    }catch(e){
        log(e.name+':'+e.message);
    }

}

/**
 * 滑动鼠标放大缩小滑块
 * @param obj
 */
function mousewheelScale(obj) {
    try{
        var i = 1;
        obj.on("mousewheel", function (event, delta) {

            i += delta * 0.1;
            scale = Math.abs(i);

            obj.css({
                '-webkit-transform': 'scale(' + scale + ',' + scale + ')',
                '-moz-transform': 'scale(' + scale + ',' + scale + ')',
                '-ms-transform': 'scale(' + scale + ',' + scale + ')',
                '-o-transform': 'scale(' + scale + ',' + scale + ')',
                'transform': 'scale(' + scale + ',' + scale + ')'
            })

            //obj.data('plugin_pep').setScale(scale);
            return false;
        });
    }catch(e){
        log(e.name+':'+e.message);
    }


}

/**
 * 向显示器发送控件位置
 * @param param
 */
function callServer(param){
    try{
        var x = param[0];
        var y = param[1];
        var height = param[2];
        var width = param[3];
        $.ajax({
            url:'http://192.168.1.126:8088/p',
            data:'x='+x+'&y='+y+'&height='+height+'&width='+width,
            type:'get',
            contentType:'text/html;charset=UTF-8',
            success:function(data){
                log(data);
            },
            error:function(XMLHttpRequest, textStatus, errorThrown){
                log(XMLHttpRequest.status);
                log(XMLHttpRequest.readyState);
                log(textStatus);
            }
        });
    }catch(e){
        console.log(e.name+':'+e.message);
        log(e.name+':'+e.message);
    }

}
/**
 * 全屏显示网页
 */
function requestFullScreen() {
    var de = document.documentElement;
    if (de.requestFullscreen) {
        de.requestFullscreen();
    } else if (de.mozRequestFullScreen) {
        de.mozRequestFullScreen();
    } else if (de.webkitRequestFullScreen) {
        de.webkitRequestFullScreen();
    }
}
/**
 * 退出全屏
 */
function exitFullscreen() {
    var de = document;
    if (de.exitFullscreen) {
        de.exitFullscreen();
    } else if (de.mozCancelFullScreen) {
        de.mozCancelFullScreen();
    } else if (de.webkitCancelFullScreen) {
        de.webkitCancelFullScreen();
    }
}

