/**
 * Created by hejunlin on 2015/12/18.
 */

var evStar = 'tap click';

function templete(){
    try{

    }catch(e){
        log(e.name+':'+e.message);
    }
}

/**
 * 初始化拖拽控件
 * @param dragBtnCls
 * @param droppableCls
 */
function init(dragBtnCls, droppableCls){
    var $drag = $(dragBtnCls);
    var windowCtrl = '<div class="pep window">'+
        '<div class="title">'+
        '按住标题拖动,点X关闭'+
        '<div class="button close"><i class="fa fa-close"></i></div>'+
        '<div class="button fullscreen"><i class="fa fa-arrows-alt"></i></div>'+
        '</div>'+
        '<div class="content"></div>'+
        '<div class="coor"></div>'+
        '</div>';

    // 初始化拖拽按钮
    handleDragBtn($drag, droppableCls, 1, windowCtrl);
    //handleDroppablePanel(droppableCls);
    // 初始化窗口控制事件
    handleWindowAction(windowCtrl, droppableCls);

    // 将编辑区设置为16:9（必须在绘制网格前）
    request16to9($('.col.right .panel-body'));
    // 绘制canvas网格背景
    drawGrid(droppableCls, 3, 3);
    $(droppableCls).on('resize', function(){
        console.log('hahah')
        request16to9($('.col.right .panel-body'));
        drawGrid(droppableCls, 3, 3);
    });

    // 控制面板左右切换
    handlePanelSlide(droppableCls);
}

/**
 * 面板滑动
 * @param droppableCls
 */
function handlePanelSlide(droppableCls){

    var $panel = $('.sky-wrapper');
    $panel.off(evStar, '.collapse-btn').on(evStar, '.collapse-btn', function(){
        var $this = $(this);
        var index = $this.index();

        switch(index){
            case 1:
                $panel.addClass('off');
                break;
            case 2:
                $panel.removeClass('off');
                break;
            default:break;
        }
        // 重绘canvas
        setTimeout(function(){
            $(droppableCls).trigger("resize")
        },600);

    });
}

/**
 * 控制屏幕区缩放
 * @param droppableCls
 */
function handleDroppablePanel(droppableCls){
    var $droppable = $(droppableCls)
    $droppable.pep({
    });

    $('.sky-btn.dropdown').off('tap click').on('tap click','li', function(){
        var $this = $(this);
        var val = $this.find('a').html();

        $this.parent().siblings('a.dropdown-toggle').html(val+' <span class="caret"></span>');
        var scale = parseInt(val)*0.01;

        $droppable.css({
            'transform': 'scale(' + scale + ')'
        });

        var $pepOoj = $droppable.data('plugin_pep')
        $pepOoj.setScale(scale);
        $pepOoj.setMultiplier(scale);
    });
}

/**
 * 编辑区操作
 * @param windowCtrl
 * @param droppableCls
 */
function handleWindowAction(windowCtrl, droppableCls){
    var $contaner = $(droppableCls);

    $('#new-win').on('click',function(){

        $contaner.append(windowCtrl);

        handleWindowCtrl($contaner.find('.pep'), droppableCls, null);
    });

    $('#close-win').on('click',function(){
        handleCloseWindow(droppableCls, '.pep.active')
    });

    $('#clear-win').on('click',function(){
        handleCloseWindow(droppableCls, '.pep')
    });
}

/**
 * 关闭窗口控件
 * @param droppableCls
 * @param pepCls
 */
function handleCloseWindow(droppableCls, pepCls){
    var $contaner = $(droppableCls);
    var active = $contaner.find(pepCls);
    $.pep.unbind(active);
    active.remove();
}

function handleFullScreen($pep, droppableCls, pepCls){
    var $contaner = $(droppableCls);
    var active = $contaner.find(pepCls);
    $pep.options.constrainTo
}
/**
 * 绘制网格背景
 * @param droppableCls 填充位置
 * @param x
 * @param y
 */
function drawGrid(droppableCls, x, y) {
    var $droppable = $(droppableCls);

    var idObject = document.getElementById('cvs');
    if (idObject != null)
        idObject.parentNode.removeChild(idObject);

    var canvas = document.createElement("canvas");
    canvas.id = 'cvs';
    canvas.width = $droppable.innerWidth();
    canvas.height = $droppable.innerHeight();
    canvas.style.cssText = "margin:0 auto; position:absolute;";
    $droppable.append(canvas);
    var context = canvas.getContext("2d");

    context.save();

    context.strokeStyle = "#ffffff";
    context.fillStyle = "#ffffff";
    context.lineWidth = 0.6;

    //画横线
    var j = 0,stepX = canvas.width/x,stepY = canvas.height/y;
    //10个像素位为单位,6个像素画线，4个像素空出来，成为虚线
    for (var i = 1; i < y; i ++) {
        context.beginPath();
        for(j = 0;j < stepX;j++){
            context.moveTo(j*10, stepY*i);
            context.lineTo(j*10 + 6,  stepY*i);
        }
        context.stroke();
    }

    //画竖线
    for (var i = 1; i < x; i ++) {
        context.beginPath();
        for(j = 0;j < stepY;j++){
            context.moveTo(stepX*i, j*10 );
            context.lineTo(stepX*i, j*10+6);
        }
        context.stroke();
    }

    // 画网格索引
    var index = 0;
    var posiX, posiY;
    context.font="20px Georgia";

    // 逐行填充索引
    for(var k = 0; k < y; k ++){
        for(var l = 0; l < x; l ++){
            posiX = canvas.width * ((2*l+1)/(2*x));
            posiY = canvas.height * ((2*k+1)/(2*y));
            context.fillText( ++index + '', posiX-5, posiY+5);
        }
    }

    context.restore();
}
/**
 * 生成window控件
 * @param $drag 按钮对象
 * @param droppableCls 拖拽区class
 * @param type 控件类型
 * @param genCtrl 控件字符串
 */
function handleDragBtn($drag, droppableCls, type, genCtrl){

    var $droppable = $(droppableCls)
    $drag.pep({
        droppable: droppableCls,
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
            if(obj.activeDropRegions.length !== 0 ){
                var $relative = $droppable.parents().filter(function() {
                    var $this = $(this);
                    return $this.is('body') || $this.css('position') === 'relative'|| $this.css('position') === 'absolute';
                })
                if($relative.length>1){
                    //当拖拽区的父容器存在position == relative||absolute时
                    var relativeOffsetLeft = $relative.offset().left;
                    var relativeOffsetTop = $relative.offset().top;
                    obj.customPosix = {'x':ev.pep.x-relativeOffsetLeft, 'y':ev.pep.y-relativeOffsetTop};
                }else{
                    obj.customPosix = {'x':ev.pep.x, 'y':ev.pep.y};
                }
            }

        },
        stop: function (ev, obj) {
            //移除按钮中的控件
            //插入到编辑区鼠标停留位置
            var $ctrl = obj.$el.find('.content');
            if(this.activeDropRegions.length !== 0){

                var $contaner = this.activeDropRegions[0];
                $contaner.append(genCtrl);

                var startPos = { left:obj.customPosix.x, top: obj.customPosix.y};
                switch (type){
                    case 1:
                        handleWindowCtrl($(droppableCls).find('.pep'), droppableCls, startPos);
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
 * @param droppableCls 拖拽区class
 * @param startPos 起始位置
 */
function handleWindowCtrl($pep, droppableCls, startPos ){
    if(!startPos) startPos = { left: null, top: null };
    $pep.pep({
        //debug: true,
        droppable: droppableCls,
        dragIcon: '.coor',//添加的拖拽缩放功能
        selectFloat: true,//选中元素上浮
        allowDragEventPropagation: false,//禁止DOM冒泡
        minSize:{'w':100,'h':80},
        maxSize:null,
        constrainTo: 'window',
        elementsWithInteraction: '.title, .close',//指定某部分不会触发拖动
        revert: true,
        revertAfter: 'ease',
        revertIf: function () {
            return !this.activeDropRegions.length;
        },
        useCSSTranslation: false,
        initiate: function(ev,obj){

            var el = obj.$el;
            el.find('.button.close').off('click').on('click',function(){
                //el.find('.content').html('');
                //obj.revert();
                $.pep.unbind(el);
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
        var pis = [fLeft.toFixed(2), fTop.toFixed(2), oHeight.toFixed(2), oWidth.toFixed(2)];//x y h w
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

function fitElement(inner, container) {
    $(inner).off("load").on("load", function() {
        var $this = $(this);
        var oWidth = $this.outerWidth();
        var oHeight = $this.outerHeight();
        var style;
        var cWidth = $(container).innerWidth();
        var cHeight = $(container).innerHeight();
        if (oWidth / oHeight > cWidth / cHeight) {
            var nWidth = Math.round(oWidth / (oHeight / cHeight));
            var offsetLeft = (cWidth - nWidth) / 2;
            style = "height:" + cHeight + "px;width:" + nWidth + "px;margin-left:" + offsetLeft + "px;";
        } else {
            if (oWidth / oHeight < cWidth / cHeight) {
                var nHeight = Math.round(oHeight / (oWidth / cWidth));
                var offsetTop = (cHeight - nHeight) / 2;
                style = "width:100%;margin-top:" + offsetTop + "px;"
            } else {
                style = "width:100%";
            }
        }
        $this.attr("style", style)
    })
}

function request16to9($element){

    var pW, pH, padding;

    pW = $element.innerWidth();
    pH = $element.innerHeight();

    if(pW/pH > 16/9){
        padding = (pW - pH*16/9)/2;
        $element.css({
            //'height':pH,
            //'width':pH*16/9,
            'padding-left':padding,
            'padding-right':padding
        })
    }else{
        padding = (pH - pW*9/16)/2
        $element.css({
            //height:pW*9/16,
            //width:pW,
            'padding-top':padding,
            'padding-bottom':padding
        })
    }
}