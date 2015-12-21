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
 * ����window�ؼ�
 * @param $drag ��ť����
 * @param type �ؼ�����
 * @param genCtrl �ؼ��ַ���
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
            //���ɿؼ��������渡��
            obj.$el.find('.content').append(genCtrl);
        },
        drag: function (ev, obj) {
            //ת���¼����䴥��
            ev = obj.normalizeEvent(ev);
            //��¼����Ŀ����ƶ�λ�ã�д��ȫ����
            obj.customPosix = {'x':ev.pep.x, 'y':ev.pep.y};
        },
        stop: function (ev, obj) {
            //�Ƴ���ť�еĿؼ�
            //���뵽�༭�����ͣ��λ��
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
            //ɾ����ק��ť�еĿؼ�
            $ctrl.html('');
        },
        rest: function (ev, obj){
            obj.revert();
        }
    });
}

/**
 * ����window�ؼ�
 * @param $pep �ؼ�����
 * @param startPos ��ʼλ��
 */
function handleWindowCtrl($pep, startPos ){
    if(!startPos) startPos = { left: null, top: null };
    $pep.pep({
        debug: true,
        droppable: '.droppable',
        dragIcon: '.window .coor',//��ӵ���ק���Ź���
        minSize:{'w':100,'h':80},
        maxSize:null,
        constrainTo: 'window',
        elementsWithInteraction: '.window .title,.window .close',//ָ��ĳ���ֲ��ᴥ���϶�
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
 * ��ʾ��־
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
 * ���黬������������ص�
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

            //����λ����Ϣ
            //callServer(pis);
        }
    }catch(e){
        log(e.name+':'+e.message);
    }

}

/**
 * ���������ڱ༭���м�
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

            //���ƶ���Լ���ڱ༭���� [top, right, bottom, left]
            obj.$el.data('plugin_pep').options.constrainTo = [pTop,pLeft+pWidth-oWidth,pTop+pHeight-oHeight,pLeft];
            return;
        }

        obj.noCenter = false;
    }catch(e){
        log(e.name+':'+e.message);
    }

}

/**
 * ���������ڱ༭����
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

        //���ƶ���Լ���ڱ༭���� [top, right, bottom, left]
        obj.$el.data('plugin_pep').options.constrainTo = [pTop, pLeft+pWidth-oWidth, pTop+pHeight-oHeight, pLeft];

        //���㻬����Ա༭����λ��
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
 * �ڻ��鱻�϶�ʱ�ζ�
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
 * �������Ŵ���С����
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
 * ����ʾ�����Ϳؼ�λ��
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
 * ȫ����ʾ��ҳ
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
 * �˳�ȫ��
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

