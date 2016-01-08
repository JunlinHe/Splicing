/**
 * Created by hejunlin on 2015/12/18.
 */

function SkyApp(){
    var self = this;

    self.dragBtnCls = '#input .item .drag',
    self.droppableCls = '.right .tab-pane .droppable',
    self.droppableClsActive = '.right .tab-pane.active .droppable',
    self.$drag = $(self.dragBtnCls),
    self.windowCtrl = '<div class="pep window">'+
        '<div class="title">'+
        '1.1-DVI'+
        '<div class="button close"><i class="fa fa-close"></i></div>'+
        '<div class="button fullscreen"><i class="fa fa-arrows-alt"></i></div>'+
        '<div class="button full-single-screen"><i class="fa fa-expand"></i></div>'+
        '</div>'+
        '<div class="content"></div>'+
        '<div class="coor"></div>'+
        '</div>';

    //self.serverUrl = 'http://172.16.1.72:8088/p';
    self.serverUrl = 'p';
    self.evStar = 'click';
    self.evDbClick = 'doubletap';
    self.evPress = 'press';
    self.editPanelSize = {w:false, h:false};
    self.scaleX = 1;
    self.scaleY = 1;
    self.gridAttr = 'data-cvs-grid';
    self.gridStepAttr = 'data-cvs-grid-step'

    // 将编辑区设置为16:9（必须在绘制网格前执行）
    self.$editPanel = $('.col.right .panel-body');
    self.editPanelSize = self.request16to9(self.$editPanel);

    // 加载本地化配置
    self.handleI18n('Messages', 'assets/');

    // 绘制canvas网格背景
    self.handleDrawGrid(self.droppableCls);
    $(self.droppableCls).on('resize', function(){

        self.handleDrawGrid(self.droppableCls);
    });

    // 初始化拖拽按钮
    self.handleDragBtn(self.$drag, self.droppableClsActive, 1, self.windowCtrl);
    // 控制屏幕区缩放
    self.handleDroppablePanelScale(self.droppableClsActive);
    // 初始化窗口控制事件
    self.handleWindowAction(self.droppableClsActive, self.windowCtrl);
    // 控制面板左右切换
    self.handlePanelSlide();

    // 默认查询1号墙体窗口信息
    //self.handleWall(1);

    $('.navbar-brand.toc.item').on(self.evStar, function(){
        html2canvas($(self.droppableClsActive).get(0), {
            allowTaint: true,
            taintTest: false,
            onrendered: function (canvas) {
                canvas.id = "html-shoot";
                //document.body.appendChild(canvas);
                //生成base64图片数据
                var dataUrl = canvas.toDataURL();
                console.log(dataUrl)
                $('#profiles').find('img.grid3x3').attr('src',dataUrl);
            }
        });
    })

    return self;
}


/**
 * 加载消息框
 */
SkyApp.prototype.log = function(msg, type){
    if(typeof msg == 'undefined'){
        msg = 'undefined';
    }else{
        msg = msg.toString();
    }

    Messenger.options = {
        //parentLocations: [],
        extraClasses: 'messenger-fixed messenger-on-top messenger-on-right',
        theme: 'flat',
        messageDefaults: 'hello!'
    }
    return Messenger().post({
        message: msg,
        type : type ? type : 'success',// info success error
        showCloseButton: true,
        hideAfter: 5,
        closeButtonText: '-'
    });
}

/**
 * 加载本地化文件，替换html中的字符串，用于服务器没有本地化的情况
 * @param name
 * @param path
 * @param lang
 */
SkyApp.prototype.handleI18n = function(name, path, lang){
    var lang = lang || navigator.language;
    $.i18n.properties({
        cache: true, // 缓存配置文件
        name: name,
        path: path,
        mode: 'both',
        language: lang,
        callback: function() {
            $("[data-localize]").each(function() {
                var elem = $(this),
                    localizedValue = $.i18n.prop(elem.data("localize"));
                if (elem.is("input[type=text]") || elem.is("input[type=password]") || elem.is("input[type=email]")) {
                    elem.attr("placeholder", localizedValue);
                } else if (elem.is("input[type=button]") || elem.is("input[type=submit]")) {
                    elem.attr("value", localizedValue);
                } else if (elem.is("[data-replace=left]")){
                    elem.html(localizedValue + elem.html());
                } else if (elem.is("[data-replace=right]")){
                    elem.html(elem.html() + localizedValue);
                } else {
                    elem.html(localizedValue);
                }
            });
        }
    });
}

/**
 * 面板滑动
 */
SkyApp.prototype.handlePanelSlide = function(){

    var self = this,
        $panel = $('#sky-wrapper'),
        $editPanel = $panel.find('.right .panel-body'),
        $dropable = $editPanel.find(":first-child");

    $panel.off(self.evStar, '.collapse-btn').on(self.evStar, '.collapse-btn', function(){
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
            // 将编辑区宽高比置为16:9
            self.editPanelSize = self.request16to9($editPanel);

            $dropable.trigger("resize")
        },700);
    });

    // 在窗体大小改变后重绘
    var rt;
    $(window).on('resize', function(){

        clearTimeout(rt);
        rt = setTimeout(function(){
            // 将编辑区宽高比置为16:9
            self.editPanelSize = self.request16to9($editPanel);

            $dropable.trigger("resize")
        },500);
    })
}


/**
 * 控制屏幕区缩放
 * @param droppableCls
 */
SkyApp.prototype.handleDroppablePanelScale = function(droppableCls){
    var self = this;

    //$droppable.pep({
    //});

    $('.sky-btn.dropdown').off(self.evStar).on(self.evStar,'li', function(){
        var $this = $(this),
            val = $this.find('a').html(),
            $droppable = $(droppableCls);

        $this.parent().siblings('a.dropdown-toggle').html(val+' <span class="caret"></span>');
        var scale = parseInt(val)*0.01;

        $droppable.css({
            'transform': 'scale(' + scale + ')'
        });

        //var $pepOoj = $droppable.data('plugin_pep')
        //$pepOoj.setScale(scale);
        //$pepOoj.setMultiplier(scale);
    });
}

/**
 * 编辑区操作
 * @param windowCtrl
 */
SkyApp.prototype.handleWindowAction = function(droppableCls, windowCtrl){
    var self = this,
        $contaner = null;

    // 同步当前屏幕墙
    $('#synchronize').on(self.evStar,function(){
        var activeWallIndex = $(droppableCls).parent().index()+1;
        self.handleWall(activeWallIndex)
    });

    $('#sky-wrapper .right .new-win').on(self.evStar,function(){
        $contaner = $(droppableCls)
        $contaner.append(windowCtrl);

        self.handleWindowCtrl($contaner.find('.pep:last'), droppableCls, null);
    });

    $('#sky-wrapper .right .close-win').on(self.evStar,function(){
        self.handleCloseWindow(droppableCls, '.pep.active')
    });

    $('#sky-wrapper .right .clear-win').on(self.evStar,function(){
        self.handleCloseWindow(droppableCls, '.pep')
    });
}

/**
 * 关闭窗口控件
 * @param droppableCls
 * @param pepCls
 */
SkyApp.prototype.handleCloseWindow = function(droppableCls, pepCls){
    var $contaner = $(droppableCls);
    var active = $contaner.find(pepCls);
    $.pep.unbind(active);
    active.remove();
}

CanvasRenderingContext2D.prototype.dashedLineTo = function (fromX, fromY, toX, toY, pattern) {
    // default interval distance -> 5px
    if (typeof pattern === "undefined") {
        pattern = 5;
    }

    // calculate the delta x and delta y
    var dx = (toX - fromX);
    var dy = (toY - fromY);
    var distance = Math.floor(Math.sqrt(dx*dx + dy*dy));
    var dashlineInteveral = (pattern <= 0) ? distance : (distance/pattern);
    var deltay = (dy/distance) * pattern;
    var deltax = (dx/distance) * pattern;

    // draw dash line
    this.beginPath();
    for(var dl=0; dl<dashlineInteveral; dl++) {
        if(dl%2) {
            this.lineTo(fromX + dl*deltax, fromY + dl*deltay);
        } else {
            this.moveTo(fromX + dl*deltax, fromY + dl*deltay);
        }
    }
    this.stroke();
};
/**
 * 绘制网格背景，需要在指定元素上添加属性“data-cvs-grid”，格式为x_y_x0_y0
 * 网格由 水平方向上的x个 和 垂直方向的y个 实线网格组成，每个实线网格又由水平方向上的x0个 和 垂直方向的y0个 虚线网格组成
 * 绘制网格后将网格间距填写到“data-cvs-grid-step”中
 * @param droppableCls
 */
SkyApp.prototype.handleDrawGrid = function(droppableCls) {
    var self = this,
        $droppable = $(droppableCls),
        x = 0,
        y = 0,
        x0 = 0,
        y0 = 0,
        grid,// 网格横纵数值
        gridArr,// 网格横纵间距数值
        $el,
        idObject,
        canvas,
        context,// canvas上下文
        stepX,// 水平实线间距
        stepY,// 垂直实线间距
        dashedStepX,// 水平虚线间距
        dashedStepY;// 垂直虚线间距

    $droppable.each(function(index,el){

        $el = $(el);

        grid = $el.attr(self.gridAttr);

        if(!grid){return false;}

        gridArr = grid.split('_');

        if(!(gridArr instanceof Array) && gridArr.length < 2){return false;}

        x = gridArr[0];
        y = gridArr[1];
        x0 = gridArr[2];
        y0 = gridArr[3];

        idObject = document.getElementById('cvs'+x+'-'+y);
        if (idObject != null)
            idObject.parentNode.removeChild(idObject);

        canvas = document.createElement("canvas");
        canvas.id = 'cvs'+x+'-'+y;

        // 由于jquery不能获取display:none元素的物理尺寸，故获取当前显示的第一个相近元素的尺寸
        canvas.width = self.editPanelSize.w;
        canvas.height = self.editPanelSize.h;
        //canvas.width = $droppable.innerWidth();
        //canvas.height = $droppable.innerHeight();

        canvas.style.cssText = "margin:0 auto; position:absolute;";
        $el.append(canvas);
        context = canvas.getContext("2d");

        context.save();

        context.strokeStyle = "#ffffff";
        context.fillStyle = "#ffffff";
        context.lineWidth = 0.6;

        stepX = canvas.width/x;
        stepY = canvas.height/y;
        dashedStepX = stepX/x0;
        dashedStepY = stepY/y0;


        // 画水平线
        // 10个像素位为单位,6个像素画线，4个像素空出来，成为虚线
        for (var a = 1; a < y*y0; a ++) {
            // 实线
            if(a % y0 === 0) {
                context.beginPath();
                context.moveTo(0, dashedStepY*a);
                context.lineTo(canvas.width,  dashedStepY*a);
                context.stroke();
                continue;
            }
            // 水平虚线
            context.beginPath();
            for(var b = 0;b < stepX; b++){
                context.moveTo(b*10, dashedStepY*a);
                context.lineTo(b*10 + 6,  dashedStepY*a);
            }
            context.stroke();
        }
        // 此虚线画法存在兼容性问题
        //for (var a = 1; a < y*y0; a ++) {
        //    context.beginPath();
        //    if(a % y0 != 0) {
        //        // 虚线
        //        context.setLineDash([5,2]);
        //
        //        //for(var b = 0;b < stepX; b++){
        //        //    context.moveTo(b*10, dashedStepY*a);
        //        //    context.lineTo(b*10 + 6,  dashedStepY*a);
        //        //}
        //    }
        //    // 实线
        //    context.moveTo(0, dashedStepY*a);
        //    context.lineTo(canvas.width,  dashedStepY*a);
        //
        //    context.stroke();
        //    context.setLineDash([]);
        //}
        // 画垂直线
        for (var c = 1; c < x*x0; c ++) {
            // 实线
            if(c % x0 === 0) {
                context.beginPath();
                context.moveTo(dashedStepX*c, 0);
                context.lineTo(dashedStepX*c,  canvas.height);
                context.stroke();
                continue;
            }
            // 垂直虚线
            context.beginPath();
            for(var d = 0;d < stepY; d++){
                context.moveTo(dashedStepX*c, d*10 );
                context.lineTo(dashedStepX*c, d*10+6);
            }
            context.stroke();
        }

        // 画网格索引
        var index = 0,
            posiX, posiY;
        context.font='bold 60px/100% "微软雅黑", "Lucida Grande", "Lucida Sans", Helvetica, Arial, Sans';
        context.strokeStyle="#fff";
        // 逐行填充索引
        for(var e = 0; e < y; e ++){
            for(var f = 0; f < x; f ++){
                posiX = canvas.width * ((2*f+1)/(2*x));
                posiY = canvas.height * ((2*e+1)/(2*y));
                context.strokeText( ++index + '', posiX-20, posiY+20);
            }
        }

        context.restore();

        // 记录canvas网格间距
        $el.attr(self.gridStepAttr, dashedStepX+'_'+dashedStepY);
    });


    // 计算线条交叉点
    //var gridPoint = [];
    //for(var m = 0; m <= y; m ++){
    //    for(var n = 0; n <= x; n ++){
    //        gridPoint.push([stepX*n, stepY*m])
    //    }
    //}
    //return [x, y, stepX, stepY];
}


/**
 * 拖拽生成window控件
 * @param $drag 按钮对象
 * @param type 控件类型
 * @param genCtrl 控件字符串
 */
SkyApp.prototype.handleDragBtn = function($drag, droppableCls, type, genCtrl){

    var self = this;

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

                var $relative = obj.activeDropRegions[0].parents().filter(function() {
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
                //var $contaner = $(droppableCls);
                $contaner.append(genCtrl);

                var startPos = { left:obj.customPosix.x, top: obj.customPosix.y};
                switch (type){
                    case 1:
                        self.handleWindowCtrl($contaner.find('.pep:last'), droppableCls, startPos);
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
 * @param startPos {left,top} 起始位置
 * @param defaultSize {w,h} 初始大小
 */
SkyApp.prototype.handleWindowCtrl = function($pep, droppableCls, startPos, defaultSize){
    if(!startPos) startPos = { left: null, top: null };

    if(defaultSize)
        $pep.css({
            width:defaultSize.w,
            height:defaultSize.h
        });

    var self = this;
    $pep.pep({
        //debug: true,
        droppable: droppableCls,
        dragIcon: '.coor',//添加的拖拽缩放功能
        selectFloat: true,//选中元素上浮
        allowDragEventPropagation: false,//禁止DOM冒泡
        minSize:{'w':100,'h':80},
        maxSize:null,
        constrainTo: 'window',
        elementsWithInteraction: '.close',//指定某部分不会触发拖动
        revert: true,
        revertAfter: 'ease',
        cssEaseDuration: 300,//滑动时间
        revertIf: function () {
            return !this.activeDropRegions.length;
        },
        useCSSTranslation: false,
        initiate: function(ev,obj){
            //console.log(0);
            //handleInitWinCtrlAction(obj);
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
        rest: function (ev, obj){
            self.handleCentering(ev, obj);
        }

    });

    //self.handleInitWinCtrlAction($(droppableCls).find('.pep:last').data('plugin_pep'));
    self.handleInitWinCtrlAction($pep.data('plugin_pep'));
}

/**
 * 窗口控件操作事件
 * @param $obj
 */
SkyApp.prototype.handleInitWinCtrlAction = function($obj){
    var self = this,
        $el = $obj.$el,
        $elParent = $el.parent();

    // 长按呼出菜单
    $el.find('.content').hammer().on(self.evPress,function(){
        self.handlePopMenuAction($obj);
    });

    // 移除控件
    $el.find('.close').on(self.evStar, function(){
        //$el.find('.content').html('');
        //$obj.revert();
        $el.fadeOut(500, function(){
            $.pep.unbind($el);
            $el.remove();
            $obj.options.constrainTo = 'window';
        });
    });

    // 双击 单屏最大化
    $el.find('.content').hammer().on(self.evDbClick, function(){
        var x_y = $elParent.attr(self.gridAttr).split('_'),
            stepXY = $elParent.attr(self.gridStepAttr).split('_'),
            grid = [x_y[0] * x_y[2], x_y[1] * x_y[3], stepXY[0], stepXY[1]];

        self.requestFullSingleScreen($obj, grid, true)

    });

    // 按钮 单屏最大化
    $el.find('.full-single-screen').on(self.evStar, function(ev){
        var x_y = $elParent.attr(self.gridAttr).split('_'),
            stepXY = $elParent.attr(self.gridStepAttr).split('_'),
            grid = [x_y[0] * x_y[2], x_y[1] * x_y[3], stepXY[0], stepXY[1]];

        self.requestFullSingleScreen($obj, grid, true);
    });
    // 按钮 全屏最大化
    $el.find('.fullscreen').on(self.evStar, function(){
        var x_y = $elParent.attr(self.gridAttr).split('_'),
            stepXY = $elParent.attr(self.gridStepAttr).split('_'),
            grid = [x_y[0] * x_y[2], x_y[1] * x_y[3], stepXY[0], stepXY[1]];

        self.requestFullSingleScreen($obj, grid, false)
    });
}

/**
 * 弹出菜单点击事件
 * @param $obj
 */
SkyApp.prototype.handlePopMenuAction = function ($obj){
    var self = this,
        $el = $obj.$el,
        $elParent = $el.parent(),
        $popMenu = $('#pop-menu');

    $popMenu.fadeIn(500);
    $popMenu.on(self.evStar,function(){
        $(this).fadeOut(500);
    })

    $popMenu.off(self.evStar, 'a').on(self.evStar, 'a',function(ev){
        ev.stopPropagation();// 阻止冒泡触发父元素事件
        var $this = $(this),
            x_y, stepXY, grid;

        switch ($this.attr('class')){
            case 'single-screen':
                x_y = $elParent.attr(self.gridAttr).split('_');
                stepXY = $elParent.attr(self.gridStepAttr).split('_');
                grid = [x_y[0] * x_y[2], x_y[1] * x_y[3], stepXY[0], stepXY[1]];

                self.requestFullSingleScreen($obj, grid, true);
                setTimeout(function(){
                    self.handleCentering(null, $obj);
                },300)
                break;
            case 'full-screen':
                x_y = $elParent.attr(self.gridAttr).split('_');
                stepXY = $elParent.attr(self.gridStepAttr).split('_');
                grid = [x_y[0] * x_y[2], x_y[1] * x_y[3], stepXY[0], stepXY[1]];

                self.requestFullSingleScreen($obj, grid, false);
                setTimeout(function(){
                    self.handleCentering(null, $obj);
                },300)
                break;
            case 'up-level':

                break;
            case 'down-level':
                break;
            case 'win-close':
                $popMenu.fadeOut(300,function(){
                    $el.find('.close').trigger(self.evStar);
                });
                break;
            case 'go-top':
                break;
            case 'go-bottom':
                break;
            case 'win-lock':
                $obj.toggle(false)
                $popMenu.find("a:not(.win-unlock,.win-info)").addClass('disable')
                break;
            case 'win-unlock':
                $obj.toggle(true)
                $popMenu.find("a").removeClass('disable')
                break;
            case 'win-restore':
                break;
            case 'win-info':
                $('#modal-win-info').modal('show');
                break;
            default:
                break;
        }
    })
}

/**
 * 控件单屏最大化
 * @param $obj
 * @param grid
 * @param single
 * @returns {boolean}
 */
SkyApp.prototype.requestFullSingleScreen = function($obj, grid, single){

    var self = this,
        len = grid.length,
        $el = $obj.$el,
        $elParent = $el.parent();

    if(len === 0 || !grid instanceof Array)
        return false;
    var x, y, stepX, stepY,
        oTop, oLeft, oWidth, oHeight,
        pTop, pLeft, pWidth, pHeight,
        dTop, dLeft, dWidth, dHeight;

    x = grid[0];
    y = grid[1];
    stepX = grid[2];
    stepY = grid[3];

    pTop = Math.round($elParent.position().top);
    pLeft = Math.round($elParent.position().left);
    pWidth = Math.round($elParent.innerWidth());
    pHeight = Math.round($elParent.innerHeight());

    oTop = Math.round($el.position().top - pTop);
    oLeft = Math.round($el.position().left - pLeft);
    oWidth = Math.round($el.outerWidth());
    oHeight = Math.round($el.outerHeight());

    //全屏最大化
    if(!single){

        if(oTop+pTop === pTop && oLeft+pLeft === pLeft && oWidth === pWidth && oHeight === pHeight){

            $el.outerWidth($obj.reverPosix.w);
            $el.outerHeight($obj.reverPosix.h);
            $obj.moveTo($obj.reverPosix.x + pLeft, $obj.reverPosix.y + pTop);
        }else{

            $el.outerWidth(pWidth);
            $el.outerHeight(pHeight);
            $obj.moveTo(pLeft, pTop);
            // 保存控件变化前的坐标尺寸
            $obj.reverPosix = {
                x:oLeft,
                y:oTop,
                w:oWidth,
                h:oHeight
            };
        }

    }else{//单屏最大化
        for(var i = 0; i < x; i ++){
            if(stepX*i <= oLeft && oLeft < stepX*(i+1)){
                dLeft = Math.round(stepX*i);
                break;
            }
        }
        for(var j = 0; j < y; j ++){
            if(stepY*j <= oTop && oTop < stepY*(j+1)){
                dTop = Math.round(stepY*j);
                break;
            }
        }
        for(var k = 0; k < x; k ++){
            var w = oLeft+oWidth;
            if(stepX*k < w && w <= stepX*(k+1)){
                dWidth = Math.round(stepX*(k+1) - dLeft);
                break;
            }
        }
        for(var l = 0; l < y; l ++){
            var h = oTop+oHeight;
            if(stepY*l < h && h <= stepY*(l+1)){
                dHeight = Math.round(stepY*(l+1) - dTop);
                break;
            }
        }

        //console.log([oTop, oLeft, oWidth, oHeight])
        //
        //console.log([pTop, pLeft, pWidth, pHeight])
        //console.log([dTop, dLeft, dWidth, dHeight])
        //尺寸不变则缩小
        if(oTop === dTop && oLeft === dLeft && oWidth === dWidth && oHeight === dHeight){
            //console.log([$obj.reverPosix.y + pTop, $obj.reverPosix.x + pLeft, $obj.reverPosix.w, $obj.reverPosix.h])
            $el.outerWidth($obj.reverPosix.w);
            $el.outerHeight($obj.reverPosix.h);
            $obj.moveTo($obj.reverPosix.x + pLeft, $obj.reverPosix.y + pTop)
        }else{

            $el.outerWidth(dWidth);
            $el.outerHeight(dHeight);
            $obj.moveTo(dLeft + pLeft, dTop + pTop)
            //console.log([oTop, oLeft, oWidth, oHeight])
            //console.log('-----------------------------')
            // 保存控件变化前的坐标尺寸
            $obj.reverPosix = {
                x:oLeft,
                y:oTop,
                w:oWidth,
                h:oHeight
            };
        }
    }

}


///**
// * 显示日志
// * @param msg
// */
//SkyApp.prototype.log = function(msg){
//    if(typeof msg == 'undefined'){
//        msg = 'undefined';
//    }else{
//        msg = msg.toString();
//    }
//    //$('.display .content').prepend('<hr>').prepend(msg);
//    console.log(msg)
//}

/**
 * 滑块滑动动画结束后回调
 * @param ev
 * @param obj
 */
SkyApp.prototype.handleCentering = function(ev, obj) {
    var self = this;

    if (obj.activeDropRegions.length > 0) {
        //centerWithin(obj);
        var pis = self.insideWithin(obj);

        var info = 'x,y:'+pis[0]+','+pis[1]+'<br>'+
            'h,w:'+pis[2]+','+pis[3];
        obj.$el.find('.content').html(info);

        var winInfo = {
            id: 0,
            level: l,
            src_ch: 0,
            src_hstart: 1,
            src_vstart: 1,
            src_hsize: 1,
            src_vsize:1,
            win_x0:1,
            win_y0:1,
            win_width:1,
            win_height:1
        };

        //发送位置信息
        //self.cmd(pis);
    }
}

/**
 * 将滑块置于编辑区中间
 * @param obj
 */
SkyApp.prototype.centerWithin = function(obj) {
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
            obj.options.constrainTo = [pTop,pLeft+pWidth-oWidth,pTop+pHeight-oHeight,pLeft];
            return;
        }

        obj.noCenter = false;
    }catch(e){
        this.log(e.name+':'+e.message);
    }

}

/**
 * 将滑块置于编辑区内
 * @param obj
 */
SkyApp.prototype.insideWithin = function(obj) {
    var self = this,
        $el = obj.$el,
        $parent = obj.activeDropRegions[0],

        pTop = $parent.position().top,
        pLeft = $parent.position().left,
        pHeight = $parent.height(),
        pWidth = $parent.width(),

        oTop = $el.position().top,
        oLeft = $el.position().left,
        oHeight = $el.outerHeight(),
        oWidth = $el.outerWidth(),

        moveTop = oTop,moveLeft = oLeft;

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
        $el.animate({top: moveTop, left: moveLeft}, 0);
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
    obj.options.constrainTo = [pTop, pLeft+pWidth-oWidth, pTop+pHeight-oHeight, pLeft];

    //计算滑块相对编辑区的位置
    var fTop,fRight,fBottom,fLeft;
    fTop = moveTop - pTop;
    fLeft = moveLeft - pLeft;
    fRight = pWidth - fLeft - oWidth;
    fBottom = pHeight - fTop - oHeight;

    //var pis = [fLeft.toFixed(2), fTop.toFixed(2), oHeight.toFixed(2), oWidth.toFixed(2)];//x y h w
    // 根据编辑区尺寸比例转换显示数值
    var pis = [
        parseInt(fLeft*self.scaleX),
        parseInt(fTop*self.scaleY),
        parseInt(oHeight*self.scaleY),
        parseInt(oWidth*self.scaleX)
    ];//x y h w
    return pis;
}

/**
 * 在滑块被拖动时晃动
 * @param $obj
 * @param deg
 */
SkyApp.prototype.rotate = function($obj, deg) {
    $obj.css({
        "transform": "rotate(" + deg + "deg)"
    });
}

/**
 * 滑动鼠标放大缩小滑块
 * @param obj
 */
SkyApp.prototype.mousewheelScale = function(obj) {
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
}

/**
 * 向服务器发送指令
 * @param param string 指令参数 <cmd, param1, param2, ...>
 * @param success function 成功回调函数
 * @param fail function 失败回调函数
 */
SkyApp.prototype.cmd = function(param, success, fail){
    var self = this;

    $.ajax({
        cache: false, // 不缓存配置
        url: self.serverUrl,
        data: 'cmd=' + param,
        type: 'GET',
        //dataType:"JSONP",
        //crossDomain: true,
        contentType: 'text/html;charset=UTF-8',
        success: function(data){
            self.log(data);
            if(success)
                success(data);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown){
            if(fail) {
                fail(XMLHttpRequest, textStatus, errorThrown);
                return false;
            }
            console.log(XMLHttpRequest)
            console.log(textStatus)
            console.log(errorThrown)
            self.log(XMLHttpRequest.status, 'error');
            self.log(XMLHttpRequest.readyState, 'error');
            self.log(textStatus, 'error');
            if(errorThrown) self.log(errorThrown, 'error');
        }
    });
}
/**
 * 网页全屏显示
 */
SkyApp.prototype.requestDocFullScreen = function() {
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
 * 网页退出全屏
 */
SkyApp.prototype.exitDocFullscreen = function() {
    var de = document;
    if (de.exitFullscreen) {
        de.exitFullscreen();
    } else if (de.mozCancelFullScreen) {
        de.mozCancelFullScreen();
    } else if (de.webkitCancelFullScreen) {
        de.webkitCancelFullScreen();
    }
}

SkyApp.prototype.fitElement = function(inner, container) {
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

/**
 * 将编辑区宽高比置为16:9
 * @param $element
 */
SkyApp.prototype.request16to9 = function($element){

    var self = this,
        oW, oH, padding;

    oW = $element.innerWidth();
    oH = $element.innerHeight();

    if(oW/oH > 16/9){
        padding = (oW - oH*16/9)/2;
        $element.css({
            //'height':pH,
            //'width':pH*16/9,
            'padding-top': 15,
            'padding-bottom': 15,
            'padding-left': padding,
            'padding-right': padding
        })
    }else{
        padding = (oH - oW*9/16)/2
        $element.css({
            //height:oW*9/16,
            //width:oW,
            'padding-left': 15,
            'padding-right': 15,
            'padding-top': padding,
            'padding-bottom': padding
        })
    }

    // 计算编辑区尺寸比例
    var grid = $element.find('.tab-pane.active .droppable').attr(self.gridAttr).split('_'),
        gridX = grid[0],
        gridY = grid[1];
    self.scaleX = 1920*gridX / $element.width();
    self.scaleY = 1080*gridY / $element.height();

    return {
        w:$element.width(),
        h:$element.height()
    }
}

/**
 * 查询窗口信息指令
 * @param win number 获取指定屏幕墙的窗口信息
 */
SkyApp.prototype.handleWall = function(win){
    var self = this,
        $droppable = $(self.droppableCls).eq(win-1);

    self.log($.i18n.prop('index.msg.synchronizing'))

    //self.cmd('<winf,'+win+'>', function(data){
    //
    //},function(XMLHttpRequest, textStatus, errorThrown){
    //
    //});

    var demo = '<The valid window ID is : id levelnum Src_Ch src_hstart src_vstart src_hsize src_vsize win_x0 win_y0 win_width win_height\r\n'+
    '0,1,2,0,0,0,0,0,0,1919,1079\r\n'+
        '1,2,3,0,0,0,0,300,200,480,270\r\n'+
        '2,3,2,0,0,0,0,200,200,1919,1079\r\n'+
        '3,4,3,0,0,0,0,700,600,480,270\r\n'+
        '4,5,2,0,0,0,0,1000,1500,1919,1079\r\n'+
        '5,6,3,0,0,0,0,300,200,480,270\r\n'+
        '>';

    var resultArr = demo.split('\r\n');

    $droppable.find('.pep').remove();

    for(var i = 1; i < resultArr.length - 1; i++){

        var arr = resultArr[i].split(','),
            id = parseInt(arr[0]),
            level_num = parseInt(arr[1]),
            src_Ch = parseInt(arr[2]),
            src_hstart = parseInt(arr[3]),
            src_vstart = parseInt(arr[4]),
            src_hsize = parseInt(arr[5]),
            src_vsize = parseInt(arr[6]),
            win_x0 = parseInt(arr[7]/self.scaleX),
            win_y0 = parseInt(arr[8]/self.scaleY),
            win_width = parseInt(arr[9]/self.scaleX),
            win_height = parseInt(arr[10]/self.scaleY);

        // 向指定屏幕墙添加窗口

        $droppable.append(self.windowCtrl);

        self.handleWindowCtrl(
            $droppable.find('.pep').eq(i-1),
            self.droppableClsActive,
            {left: win_x0, top: win_y0},
            {w: win_width, h: win_height}
        )
    }

    self.log($.i18n.prop('index.msg.synchronized'))
}

/**
 * 查询本地数据
 * @param key string
 * @param isJson boolean
 * @returns {*}
 */
SkyApp.prototype.getCache = function(key, isJson){
    return isJson ? JSON.parse(localStorage.getItem(key)) : localStorage.getItem(key);
}

/**
 * 保存字符串或json到本地
 * @param key string
 * @param val string or json
 * @param isJson boolean
 */
SkyApp.prototype.setCache = function(key, val, isJson){
    localStorage.setItem(key, isJson ? JSON.stringify(val) : val);
}