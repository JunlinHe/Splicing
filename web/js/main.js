/**
 * Created by hejunlin on 2015/12/18.
 */

function SkyApp(){
    var self = this;

    //self.serverUrl = 'http://172.16.1.72:8088/p';
    self.serverUrl = 'p';
    // 事件
    self.evStar = 'click';
    self.evDbClick = 'doubletap';
    self.evPressOrRightClick = 'press contextmenu';// 长按或右键呼出菜单
    // 自定义dom属性
    self.gridAttr = 'data-cvs-grid';
    self.gridStepAttr = 'data-cvs-grid-step'
    self.winIdAttr = 'data-id';
    self.winSIdAttr = 'data-sid';
    self.signalIdAttr = 'data-signal-id';
    self.signalValidAttr = 'data-signal-valid';
    self.sceneIdAttr = 'data-scene-id';
    // 选择器
    self.dragBtnCls = '#input .item .drag';
    self.droppableCls = '.right .tab-pane .droppable';
    self.droppableClsActive = '.right .tab-pane.active .droppable';
    // 存储表名
    self.tblWinInfo = 'tbl_wininfo_wall';
    self.tblSceneInfo = 'tbl_scence_wall';
    // 其他
    self.editPanelSize = {w:false, h:false};
    self.scaleX = 1;
    self.scaleY = 1;

    self.sceneInfo = {
        id: 1,
        screenshot: '',
        winInfo: ''
    };

    self.winInfo = {
        id: 0,
        level: 0,
        src_ch: 0,
        src_hstart: 0,
        src_vstart: 0,
        src_hsize: 0,
        src_vsize: 0,
        title: '',
        color: '',
        win_x0: 0,
        win_y0: 0,
        win_width: 0,
        win_height: 0
    };// 窗体信息

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

    // 读取信号源
    self.handleGetSignalList();
    // 读取情景模式
    self.handleGetSceneList();
    //todo 读取上次退出时的编辑状态
    self.handleLoadWall(0, $(self.droppableClsActive));

    // 初始化拖拽按钮
    //self.handleDragBtn($(self.dragBtnCls), self.droppableClsActive, 1, self.windowCtrl);
    // 控制屏幕区缩放
    self.handleDroppablePanelScale();
    // 初始化窗口控制事件
    self.handleWindowAction();
    // 控制面板左右切换
    self.handlePanelSlide();
    // 初始化屏幕墙切换
    self.handleWallToggle();
    // 鼠标绘制窗体
    self.handleMouseDraw();



    // 默认同步1号墙体窗口信息
    //self.handleSynchronizeWall(0);

    // 初始化情景模式事件
    self.handleSceneAction();

    $('.loader').fadeOut(300, function(){

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
 * 获取window控件
 * @param title
 * @param dataId
 * @param dataSid
 * @returns {string}
 */
SkyApp.prototype.getWinCtrl = function(title, dataId, dataSid){
    var self = this;
    title = typeof title === 'undefined' ? '' : title;
    dataId = typeof dataId === 'undefined' ? '' : dataId;
    dataSid = typeof dataSid === 'undefined' ? '' : dataSid;

    return '<div class="pep window" '+self.winIdAttr+'="'+dataId+'" '+self.winSIdAttr+'="'+dataSid+'">'+
                '<div class="title">'+
                    '<span>'+title+'</span>'+
                    '<div class="button close"><i class="fa fa-close"></i></div>'+
                    '<div class="button fullscreen"><i class="fa fa-arrows-alt"></i></div>'+
                    '<div class="button full-single-screen"><i class="fa fa-expand"></i></div>'+
                '</div>'+
                '<div class="content"></div>'+
                '<div class="coor nw"></div>'+
                '<div class="coor ne"></div>'+
                '<div class="coor sw"></div>'+
                '<div class="coor se"></div>'+
                '<div class="coor e"></div>'+
                '<div class="coor s"></div>'+
                '<div class="coor n"></div>'+
                '<div class="coor w"></div>'+
            '</div>';
}

/**
 * 生成信号列表
 * @param id
 * @param name
 * @param valid
 * @returns {string}
 */
SkyApp.prototype.getSignalCtrl = function(id, name, valid){

    var self = this;
    id = typeof id === 'undefined' ? '' : id;
    name = typeof name === 'undefined' ? '' : name;
    valid = typeof valid === 'undefined' ? '' : valid;

    return '<li class="sky-btn item">'+
                '<i class="fa fa-desktop fa-lg"></i>'+
                '<div class="drag" '+self.signalIdAttr+'="'+id+'" '+self.signalValidAttr+'="'+valid+'">'+
                    '<a>'+id+'-'+name+'</a>'+
                    '<div class="content"></div>'+
                '</div>'+
            '</li>';
}

/**
 * 生成情景模式列表
 * @param id
 * @param title
 * @param grid
 * @param src
 * @returns {string}
 */
SkyApp.prototype.getSceneCtrl = function(id, title, grid, src){

    var self = this;
    id = typeof id === 'undefined' ? '' : id;
    title = typeof title === 'undefined' ? '' : title+id;
    grid = typeof grid === 'undefined' ? '3x3' : grid;
    src = typeof src === 'undefined' ? '' : 'style="background-image: url('+src+');"';

    return '<li class="sky-btn item" '+self.sceneIdAttr+'="'+id+'">'+
                '<i class="fa fa-bookmark-o fa-lg"></i>'+
                '<span>'+title+'</span>'+
                '<img class="grid'+grid+'" '+src+'>'+
            '</li>';
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
 * 控制屏幕墙与情景模式列表切换
 */
SkyApp.prototype.handleWallToggle = function(){
    var self = this,
        $toggleBtn = $('#wall-toggle a');

    $toggleBtn.on(self.evStar, function (e) {
        e.preventDefault();

        var $this = $(this),
            wallID = $toggleBtn.index($this),
            $sceneList = $('#scene ul');
        $this.tab('show');
        // 加载本地缓存
        self.handleLoadWall(wallID, $(self.droppableClsActive));

        $sceneList.removeClass('active')
        $sceneList.eq(wallID).addClass('active')
    });
}
/**
 * 控制屏幕区缩放
 * @param droppableCls
 */
SkyApp.prototype.handleDroppablePanelScale = function(){
    var self = this,
        droppableCls = self.droppableClsActive;
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
 * 获取输入信号列表
 *
 */
SkyApp.prototype.handleGetSignalList = function(){
    var self = this,
        signalList,
        srcId,
        srcType,
        srcValid;

    //todo 向服务器查询信号源列表
    signalList = '<The valid Input is : SRC TYPE SIGNAL SUB_VALID\r\n'+
    '01,VGA,1\r\n'+
    '02,VGA,0\r\n'+
    '03,HDMI,0\r\n'+
    '04,HDMI,1\r\n'+
    '05,BNCQ,3\r\n'+
    '06,BNCQ,5\r\n'+
    '07,4k,1\r\n'+
    '08,4k,1\r\n'+
    '09,4k,1\r\n'+
    '10,4k,1\r\n'+
    '11,DVI,0\r\n'+
    '12,DVI,0\r\n'+
    '13,DVI,0\r\n'+
    '14,DVI,0\r\n'+
    '>';

    var resultArr = signalList.split('\r\n'),
        $inputList = $('#input ul');
    $inputList.html('');

    for(var i = 1; i < resultArr.length - 1; i++){
        var arr = resultArr[i].split(',');
        srcId = parseInt(arr[0])
        srcType = arr[1]
        srcValid = parseInt(arr[2])

        $inputList.append(self.getSignalCtrl(srcId, srcType, srcValid));
    }
    $inputList.find('li:first').addClass('active')

    $inputList.on(self.evStar, 'li', function(){
        var $this = $(this);

        $inputList.find('li').removeClass('active')
        $this.addClass('active')
    })
}

/**
 * 获取情景模式列表
 */
SkyApp.prototype.handleGetSceneList = function(){

    var self = this,
        $sceneList = $('#scene ul'),
        sceneList,resultArr, title, sceneInfo,
        flag = false;

    var sceneType = ['3x3', '2x2'];

    title = $.i18n.prop('index.left.scene.title');

    for (var wallID = 0; wallID < sceneType.length; wallID++){
        //todo 向服务器查询情景模式列表
        sceneList = '< The valid Scene ID is :\r\n'+
            '1,2,3,4\r\n'+
            '>';

        resultArr = sceneList.split('\r\n');

        for(var i = 1; i < resultArr.length - 1; i++){

            var arr = resultArr[i].split(',');// 生效的预设模式
            for(var j = 1; j < 33; j++){

                flag = false;
                for(var k = 0; k < arr.length; k++){
                    if(parseInt(arr[k]) === j){
                        // 读取本地保存的预设模式缩略图
                        sceneInfo = self.getSceneInfoById(wallID, j);

                        if(sceneInfo){
                            $sceneList.eq(wallID).append(self.getSceneCtrl(arr[k], title, sceneType[wallID], sceneInfo.screenshot));
                            flag = true;
                            break;
                        }
                    }
                }
                if(flag) continue;
                $sceneList.eq(wallID).append(self.getSceneCtrl(j, title, sceneType[wallID]));
            }
        }
    }
}

/**
 * 编辑区操作
 */
SkyApp.prototype.handleWindowAction = function(){
    var self = this,
        $contaner = null,
        winInfo, $pep,
        droppableCls = self.droppableClsActive;

    // 同步当前屏幕墙
    $('#synchronize').on(self.evStar,function(){
        var activeWallIndex = $(droppableCls).parent().index();
        self.handleSynchronizeWall(activeWallIndex)
    });

    $('#sky-wrapper .right .new-win').on(self.evStar,function(){
        $contaner = $(droppableCls)
        //$contaner.append(windowCtrl);
        //
        //self.handleWindowCtrl($contaner.find('.pep:last'), droppableCls, null, false, true);
        winInfo = {
            id: 0,
            level: 0,
            src_ch: 0,
            src_hstart: 0,
            src_vstart: 0,
            src_hsize: 0,
            src_vsize: 0,
            title: '',
            color: false,
            win_x0: 0,
            win_y0: 0,
            win_width: false,
            win_height: false
        };
        self.handleInitWindow($contaner, winInfo, true, true);
    });

    $('#sky-wrapper .right .close-win').on(self.evStar,function(){
        $pep = $(self.droppableClsActive).find('.pep.active')
        self.handleCloseWindow($pep, true)
    });

    $('#sky-wrapper .right .clear-win').on(self.evStar,function(){
        $pep = $(self.droppableClsActive).find('.pep')
        self.handleCloseWindow($pep, true)
    });
}

/**
 * 关闭窗口控件
 * @param $pep
 * @param cleanCache {boolean} 是否清除缓存
 */
SkyApp.prototype.handleCloseWindow = function($pep, cleanCache){
    var self = this,
        wallID, winID;

    $pep.each(function(){
        var $this = $(this);

        if(cleanCache){
            //todo 发送删除窗口指令
            // 删除本地数据
            wallID = $(self.droppableCls).index($(self.droppableClsActive))
            winID = $this.attr(self.winIdAttr)
            self.delWinInfoById(wallID, winID);
        }

        // 移除控件
        $.pep.unbind($this);
        $this.fadeOut(300, function(){
            $this.remove();
        });
    });

}


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

        canvas.style.cssText = "margin:0 auto; position:absolute;background: #000;";
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

                //var startPos = { left:obj.customPosix.x, top: obj.customPosix.y};
                switch (type){
                    case 1:
                        //self.handleWindowCtrl($contaner.find('.pep:last'), droppableCls, startPos, false, true);
                        self.handleInitWindow($contaner, {x:obj.customPosix.x, y:obj.customPosix.y, w:null, h:null}, true, true);
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
 * @param winInfo {object} 窗口属性
 * @param fullSingleScreen {boolean} 是否触发单屏最大化
 */
SkyApp.prototype.handleWindowCtrl = function($pep, droppableCls, winInfo, fullSingleScreen){

    var self = this,
        $droppable = $(droppableCls);

    $pep.css({
        width: winInfo.win_width,
        height: winInfo.win_height,
        background: winInfo.color ? winInfo.color : winInfo.color = self.getRandomColor()// 随机背景颜色
    });

    $pep.pep({
        //debug: true,
        droppable: droppableCls,
        dragIcon: '.coor',//添加的拖拽缩放功能
        selectFloat: true,//选中元素上浮
        allowDragEventPropagation: false,//禁止DOM冒泡
        ignoreRightClick: false,// 允许右键移动
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
        startPos: { left: winInfo.win_x0, top: winInfo.win_y0 },
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
    var $obj = $pep.data('plugin_pep');
    self.handleInitWinCtrlAction($obj);

    // 开窗后单屏最大化
    if(fullSingleScreen){
        var $elParent = $obj.$el.parent(),
            x_y = $elParent.attr(self.gridAttr).split('_'),
            stepXY = $elParent.attr(self.gridStepAttr).split('_'),
            grid = [x_y[0] * x_y[2], x_y[1] * x_y[3], stepXY[0], stepXY[1]];

        self.requestFullSingleScreen($obj, grid, true)

        //winInfo = self.handleGetWinInfo($obj.$el, $droppable);
    }

    // 保存窗口信息到本地
    //var wallID = $(self.droppableCls).index($droppable)
    //self.insertOrUpdateWinInfo(wallID, winInfo);
}

/**
 * 获取窗口静态数据
 * @param $pep 获取指定窗口的的信息，此参数为null则自动分配
 * @param $droppable
 * @param defaultInfo
 * @returns {{}}
 */
SkyApp.prototype.getStaticWinInfo = function($pep, $droppable, defaultInfo){
    var self = this,
        winID = 0,
        winSID = 0,
        winTitle = '',
        $selectedSignal = $('#input .item.active .drag');

    var idArr = [];
    if($pep === null || typeof $pep === 'undefined'){
        $droppable.find('.pep').each(function(index, el){
            var $this = $(this)
            idArr.push(parseInt($this.attr(self.winIdAttr)))
        });
        winID = idArr.queue();// 获取队列中新的ID
    }else{
        winID = $pep.attr(self.winIdAttr);//获取自身的窗口ID
    }

    winSID = $selectedSignal.attr(self.signalIdAttr);

    winTitle = $selectedSignal.find('a').html()

    defaultInfo.id = parseInt(winID);
    defaultInfo.title = winTitle;
    defaultInfo.src_ch = parseInt(winSID);

    return defaultInfo;
}

/**
 * 获取窗口动态数据
 * @param $pep
 * @param $droppable
 * @returns {{}}
 */
SkyApp.prototype.getDynamicWinInfo = function($pep, $droppable, winInfo){
    var self = this,
        level,
        oTop, oLeft, oWidth, oHeight,
        pTop, pLeft, pWidth, pHeight;

    pTop = $droppable.position().top;
    pLeft = $droppable.position().left;
    pWidth = $droppable.innerWidth();
    pHeight = $droppable.innerHeight();

    oTop = $pep.position().top - pTop;
    oLeft = $pep.position().left - pLeft;
    oWidth = $pep.outerWidth();
    oHeight = $pep.outerHeight();

    //level = $pep.css('z-index');

    winInfo.level =  parseInt(winInfo.level ? winInfo.level : $pep.css('z-index'));
    winInfo.color= winInfo.color ? winInfo.color : $pep.css('background-color');
    winInfo.win_x0= parseInt((oLeft-pLeft)*self.scaleX);
    winInfo.win_y0= parseInt((oTop-pTop)*self.scaleY);
    winInfo.win_width= parseInt(oWidth*self.scaleX);
    winInfo.win_height= parseInt(oHeight*self.scaleY);

    return winInfo;
}

/**
 * 生成窗口的全部逻辑
 * @param $droppable
 * @param defaultInfo
 * @param fullSingleScreen
 * @param cache {boolean} 是否缓存数据
 */
SkyApp.prototype.handleInitWindow = function($droppable, defaultInfo, fullSingleScreen, cache){
    var self = this,
        winInfo,
        $pep;

    // 获取窗口id，信号源等静态数据
    if(defaultInfo.id === 0
        && defaultInfo.src_ch === 0
        && defaultInfo.level === 0){
        winInfo = self.getStaticWinInfo(null, $droppable, defaultInfo);
    }else{
        winInfo = defaultInfo
    }

    // 添加控件
    $droppable.append(self.getWinCtrl(winInfo.title, winInfo.id, winInfo.src_ch))
    $pep = $droppable.find('.pep:last');

    // 初始化
    self.handleWindowCtrl(
        $pep,
        $droppable,
        winInfo,
        fullSingleScreen
    )

    // 初始化完成获取完整信息
    winInfo = self.getDynamicWinInfo($pep, $droppable, winInfo);

    if(cache){
        // 保存窗口信息到本地
        var wallID = $(self.droppableCls).index($droppable)
        self.insertOrUpdateWinInfo(wallID, winInfo)
    }
}
/**
 * 生成随机16进制颜色代码
 * @returns {string}
 */
SkyApp.prototype.getRandomColor = function(){
    return '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).substr(-6);
}

/**
 * 窗口控件操作事件
 * @param $obj
 */
SkyApp.prototype.handleInitWinCtrlAction = function($obj){
    var self = this,
        $el = $obj.$el,
        $elParent = $el.parent(),
        $popMenu = $('#content-pop-menu');

    // 长按或右键呼出菜单
    $el.find('.content').hammer().on(self.evPressOrRightClick,function(ev){
        ev.preventDefault();

        $popMenu.fadeIn(300);
        $popMenu.on(self.evStar,function(){
            $(this).fadeOut(300);
        })
    });
    // 绑定菜单事件
    self.handleContentPopMenuAction($obj, $popMenu);

    // 移除控件
    $el.find('.close').on(self.evStar, function(){

        self.handleCloseWindow($el, true)

        $obj.options.constrainTo = 'window';
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
 * 编辑区弹出菜单点击事件
 * @param $obj
 * @param $popMenu
 */
SkyApp.prototype.handleContentPopMenuAction = function ($obj, $popMenu){
    var self = this,
        $el = $obj.$el,
        $elParent = $el.parent();

    //$popMenu.fadeIn(300);
    //$popMenu.on(self.evStar,function(){
    //    $(this).fadeOut(300);
    //})

    $popMenu.off(self.evStar, 'a').on(self.evStar, 'a',function(ev){
        //ev.stopPropagation();// 阻止冒泡触发父元素事件
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
                //todo
                var id = $('#win-id').val(),
                    sid = $('#win-sid').val();
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
    var self = this,
        $droppable, $pep, winInfo;

    if (obj.activeDropRegions.length > 0) {
        //centerWithin(obj);

        $droppable = obj.activeDropRegions[0];
        $pep = obj.$el;

        var pis = self.insideWithin(obj);

        // 保存窗口信息到本地
        winInfo = {
            id: 0,
            level: parseInt($pep.css('z-index')),
            src_ch: 0,
            src_hstart: 0,
            src_vstart: 0,
            src_hsize: 0,
            src_vsize: 0,
            title: '',
            color: $pep.css('background-color'),
            win_x0: pis[0],
            win_y0: pis[1],
            win_width: pis[3],
            win_height: pis[2]
        };
        // 获取窗口静态信息
        winInfo = self.getStaticWinInfo($pep, $droppable, winInfo);
        console.log(winInfo)
        // 保存窗口信息到本地
        var wallID = $(self.droppableCls).index($droppable)
        self.insertOrUpdateWinInfo(wallID, winInfo);
        //发送位置信息
        //self.cmd(pis);

        var info = '窗口标识:'+winInfo.id+'<br>'+
            '窗口序号:'+winInfo.level+'<br>'+
            'x,y:'+pis[0]+','+pis[1]+'<br>'+
            'h,w:'+pis[2]+','+pis[3];
        $pep.find('.content').html(info);
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
 * 鼠标绘制窗口
 */
SkyApp.prototype.handleMouseDraw = function(){
    var self = this,
        $droppable = $(self.droppableCls),
        $canvas = $droppable.find('canvas'),
        winInfo = {};

    // startX, startY 为鼠标点击时初始坐标
    var startX, startY, dX, dY;

    // 鼠标按下
    $droppable.on('mousedown',function(e) {

        if(e.target.className === "pep"){
            return false;
        }

        startX = e.pageX;
        startY = e.pageY;
        var $this = $(this),
            pTop = $this.offset().top,
            pLeft = $this.offset().left;

        // 在页面创建 box
        var active_box = document.createElement("div");
        active_box.id = "active-box";
        active_box.className = "draw-box";
        active_box.style.top = startY - pTop + 'px';
        active_box.style.left = startX - pLeft + 'px';
        $this.append(active_box);

    });

    // 鼠标移动
    $droppable.on('mousemove',function(e) {
        // 更新 box 尺寸
        var $active_box = $('#active-box')
        if(typeof $active_box !== 'undefined') {
            $active_box.width(e.pageX - startX);
            $active_box.height(e.pageY - startY);
        }

        var $this = $(this),
            pTop = $this.offset().top,
            pLeft = $this.offset().left;

        dX = parseInt((e.pageX - pLeft)*self.scaleX);
        dY = parseInt((e.pageY - pTop)*self.scaleY);

        $('#mouse-pos').html('x:'+ dX +',y:'+ dY);
    });

    // 鼠标抬起
    $droppable.on('mouseup',function(e) {

        var $active_box = $('#active-box')
        if($active_box.size() !== 0) {
            $active_box.removeAttr("id");
            if($active_box.width() > 10 && $active_box.height() > 10) {

                var $this = $(this),
                    pTop = $this.offset().top,
                    pLeft = $this.offset().left;

                dX = parseInt(startX - pLeft);
                dY = parseInt(startY - pTop);

                winInfo = {
                    id: 0,
                    level: 0,
                    src_ch: 0,
                    src_hstart: 0,
                    src_vstart: 0,
                    src_hsize: 0,
                    src_vsize: 0,
                    title: '',
                    color: false,
                    win_x0: dX,
                    win_y0: dY,
                    win_width: $active_box.width(),
                    win_height: $active_box.height()
                };

                self.handleInitWindow($this, winInfo, true, true);
            }
            $active_box.remove();
        }

    });

    // 鼠标离开
    $droppable.on('mouseout',function(e) {

        $('#mouse-pos').html('x:'+ 0 +',y:'+ 0);
    });
}

/**
 * 查询窗口信息指令
 * @param win number 获取指定屏幕墙的窗口信息，下标从0开始
 */
SkyApp.prototype.handleSynchronizeWall = function (win){
    var self = this,
        $droppable = $(self.droppableCls).eq(win);

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
        '7,6,3,0,0,0,0,400,200,480,700\r\n'+
        '>';

    var resultArr = demo.split('\r\n'),
        winInfo = {},
        winInfoArr = [];

    // 清除现有窗口
    //$droppable.find('.pep').remove();
    self.handleCloseWindow($(self.droppableClsActive).find('.pep'), true)

    for(var i = 1; i < resultArr.length - 1; i++){

        var arr = resultArr[i].split(','),
            id = parseInt(arr[0]),
            level_num = parseInt(arr[1]),
            src_ch = arr[2],
            src_hstart = parseInt(arr[3]),
            src_vstart = parseInt(arr[4]),
            src_hsize = parseInt(arr[5]),
            src_vsize = parseInt(arr[6]),
            win_x0 = parseInt(arr[7]/self.scaleX),
            win_y0 = parseInt(arr[8]/self.scaleY),
            win_width = parseInt(arr[9]/self.scaleX),
            win_height = parseInt(arr[10]/self.scaleY);

        winInfo = {
            id: id,
            level: level_num,
            src_ch: src_ch,
            src_hstart: src_hstart,
            src_vstart: src_vstart,
            src_hsize: src_hsize,
            src_vsize: src_vsize,
            title: $('#input ['+self.signalIdAttr+'='+src_ch+'] a').html(),
            win_x0: win_x0,
            win_y0: win_y0,
            win_width: win_width,
            win_height: win_height
        };
        // 向指定屏幕墙添加窗口

        self.handleInitWindow($droppable, winInfo, false, true);
    }

    // 保存窗口信息到本地(弃用，将保存方法放到添加窗口时)
    //self.setWinInfoBatch(win, winInfoArr)

    //console.log(self.getWinInfoById(win, 4))

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

/**
 * 删除本地数据
 * @param key
 */
SkyApp.prototype.delCache = function(key){
    localStorage.removeItem(key);
}

/**
 * 保存窗口信息
 * @param wallID
 * @param winInfo
 */
SkyApp.prototype.insertOrUpdateWinInfo = function(wallID, winInfo){
    var self = this,
        tbl = self.tblWinInfo + wallID,
        resultHandle = self.getCache(tbl, true),
        flag = false;

    if(resultHandle !== null){
        for(var i = 0; i < resultHandle.length; i ++){
            if(resultHandle[i].id === winInfo.id){
                resultHandle[i] = winInfo;
                flag = true;
            }
        }
        if(!flag)
            resultHandle.push(winInfo);
    }else{
        resultHandle = [winInfo];
    }

    self.setCache(tbl, resultHandle, true)
}
/**
 * 批量保存窗口信息
 * @param wallID
 * @param winInfoArr
 */
SkyApp.prototype.setWinInfoBatch = function(wallID, winInfoArr){
    var self = this,
        tbl = self.tblWinInfo + wallID,
        resultHandle = self.getCache(tbl, true);

    if(resultHandle !== null){
        for(var i = 0; i < resultHandle.length; i ++){

            for(var j = 0; j < winInfoArr.length; j++){
                //console.log(resultHandle[i].id +"_"+ winInfoArr[j].id)
                if(resultHandle[i].id === winInfoArr[j].id){
                    resultHandle[i] = winInfoArr[j];
                    winInfoArr.splice(j,1);
                }
            }
        }
        resultHandle = resultHandle.concat(winInfoArr)
    }else{
        resultHandle = winInfoArr;
    }

    self.setCache(tbl, resultHandle, true)
}
/**
 * 通过id获取窗口信息
 * @param wallID
 * @param winID
 */
SkyApp.prototype.getWinInfoById = function(wallID, winID){

    var self = this,
        tbl = self.tblWinInfo + wallID,
        resultHandle = self.getCache(tbl, true);
    if(resultHandle !== null){
        for(var i = 0; i < resultHandle.length; i ++){
            if(resultHandle[i].id === winID)
                return resultHandle[i];
        }
    }else{
        return null;
    }

}

/**
 * 通过屏幕墙获取窗口信息
 * @param wallID
 */
SkyApp.prototype.getWinInfoByWallID = function (wallID){

    var self = this,
        tbl = self.tblWinInfo + wallID,
        resultHandle = self.getCache(tbl, true);
    if(resultHandle !== null){
        return resultHandle;
    }else{
        return null;
    }

}

/**
 * 通过ID删除一条记录
 * @param wallID
 * @param winID
 * @returns {boolean}
 */
SkyApp.prototype.delWinInfoById = function(wallID, winID){
    var self = this,
        tbl = self.tblWinInfo + wallID,
        resultHandle = self.getCache(tbl, true);

    if(resultHandle !== null){
        for(var i = 0; i < resultHandle.length; i ++){
            if(resultHandle[i].id === Number(winID)){
                resultHandle.splice(i, 1);//删除一行

                self.setCache(tbl, resultHandle, true);// 保存原有数据
                return true;
            }
        }
    }else{
        return false;
    }
}

/**
 * 保存情景模式信息
 * @param wallID
 * @param sceneInfo
 */
SkyApp.prototype.insertOrUpdateSceneInfo = function(wallID, sceneInfo){
    var self = this,
        tbl = self.tblSceneInfo + wallID,
        resultHandle = self.getCache(tbl, true),
        flag;

    if(resultHandle !== null){
        for(var i = 0; i < resultHandle.length; i ++){
            if(resultHandle[i].id === sceneInfo.id){
                resultHandle[i] = sceneInfo;
                flag = true;
            }
        }
        if(!flag)
            resultHandle.push(sceneInfo);
    }else{
        resultHandle = [sceneInfo];
    }

    self.setCache(tbl, resultHandle, true)
}

/**
 * 通过预设模式ID获取信息
 * @param wallID
 * @param id
 * @returns {*}
 */
SkyApp.prototype.getSceneInfoById = function(wallID, id){
    var self = this,
        tbl = self.tblSceneInfo + wallID,
        resultHandle = self.getCache(tbl, true);
    if(resultHandle !== null){
        for(var i = 0; i < resultHandle.length; i ++){
            if(resultHandle[i].id === id)
                return resultHandle[i];
        }
    }else{
        return null;
    }
}

/**
 * 通过屏幕墙ID获取预设模式列表
 * @param wallID
 * @returns {*}
 */
SkyApp.prototype.getSceneInfoByWallId = function(wallID){
    var self = this,
        tbl = self.tblSceneInfo + wallID,
        resultHandle = self.getCache(tbl, true);
    if(resultHandle !== null){
        return resultHandle;
    }else{
        return null;
    }
}

/**
 * 根据屏幕墙ID删除本地预设模式
 * @param wallID
 */
SkyApp.prototype.delSceneInfoByWallId = function(wallID){
    var self = this,
        tbl = self.tblSceneInfo + wallID;

    self.delCache(tbl);
}

/**
 * 根据id删除指定预设模式
 * @param wallID
 * @param sceneID
 * @returns {*}
 */
SkyApp.prototype.delWinInfoById = function(wallID, sceneID){
    var self = this,
        tbl = self.tblSceneInfo + wallID,
        resultHandle = self.getCache(tbl, true);

    if(resultHandle !== null){
        for(var i = 0; i < resultHandle.length; i ++){
            if(resultHandle[i].id === Number(sceneID)){
                resultHandle.splice(i, 1);//删除一行

                self.setCache(tbl, resultHandle, true);// 保存原有数据
                return true;
            }
        }
    }else{
        return false;
    }
}

/**
 * 加载上次退出时的编辑状态
 * @param wallID
 * @param $droppable
 */
SkyApp.prototype.handleLoadWall = function (wallID, $droppable){
    var self = this,
        resultHandle = self.getWinInfoByWallID(wallID),
        winInfo;

    if($droppable.find('.pep').length > 0){
        return false;
    }

    if(resultHandle !== null){
        for(var i = 0; i < resultHandle.length; i ++){
            winInfo = resultHandle[i];
            winInfo = {
                id: parseInt(winInfo.id),
                level: parseInt(winInfo.level),
                src_ch: winInfo.src_ch,
                src_hstart: parseInt(winInfo.src_hstart),
                src_vstart: parseInt(winInfo.src_vstart),
                src_hsize: parseInt(winInfo.src_hsize),
                src_vsize: parseInt(winInfo.src_vsize),
                title: winInfo.title,
                color: winInfo.color,
                win_x0: parseInt(Number(winInfo.win_x0) / self.scaleX),
                win_y0: parseInt(Number(winInfo.win_y0) / self.scaleY),
                win_width: parseInt(Number(winInfo.win_width) / self.scaleX),
                win_height: parseInt(Number(winInfo.win_height) / self.scaleY)
            }

            // 向指定屏幕墙添加窗口
            self.handleInitWindow($droppable, winInfo, false, false);
        }
    }
}

/**
 * 初始化保存情景模式事件
 */
SkyApp.prototype.handleSceneAction = function (){

    var self = this,
        $popMenu = $('#scene-pop-menu');

    // 绑定菜单事件
    self.handleScenePopMenuAction($popMenu);

    // 长按或右键呼出菜单
    $('#scene .item').hammer().on(self.evPressOrRightClick, function(ev){
        ev.preventDefault();

        var $this = $(this),
            $activeList = $('#scene ul.active .item');

        $activeList.removeClass('active')
        $this.addClass('active')

        $popMenu.fadeIn(300);
        $popMenu.on(self.evStar,function(){
            $(this).fadeOut(300);
        })
    });

    // 双击保存当前屏幕情景模式
    $('#scene .item').hammer().on(self.evDbClick, function(){

        var $this = $(this),
            $activeList = $('#scene ul.active .item');

        $activeList.removeClass('active')
        $this.addClass('active')

        self.handleSaveScene($this);
    });
}

/**
 * 情景模式编辑菜单事件
 */
SkyApp.prototype.handleScenePopMenuAction = function($popMenu){
    var self = this;

    $popMenu.off(self.evStar, 'a').on(self.evStar, 'a',function(){
        var $this = $(this);

        var $activeItem = $('#scene ul.active .item.active');

        switch ($this.attr('class')) {
            case 'sce-open':
                self.handleLoadScene($activeItem);
                break;
            case 'sce-save':
                self.handleSaveScene($activeItem);
                break;
            case 'sce-edit':
                break;
            case 'sce-close':
                self.handleDelScene($activeItem)
                break;
            case 'sce-clear':
                break;
            default:
                break;
        }
    });
}

/**
 * 保存情景模式
 * @param $item
 */
SkyApp.prototype.handleSaveScene = function($item){

    var self = this,
        $activeList = $('#scene ul.active .item'),
        index = $activeList.index($item) + 1,
        $droppable,wallID,
        winInfo, sceneInfo, screenshot;

    $droppable = $(self.droppableClsActive);
    wallID = $(self.droppableCls).index($droppable);

    //TODO 发送命令保存情景模式
    //...

    // 获取编辑区中的窗口信息
    winInfo = self.getWinInfoByWallID(wallID);
    console.log(winInfo)
    // 获取编辑区截图 保存情景模式
    html2canvas($droppable.get(0), {
        allowTaint: true,
        taintTest: false,
        onrendered: function (canvas) {
            $('#html-shoot').remove();
            canvas.id = "html-shoot";
            //document.body.appendChild(canvas);
            //生成base64图片数据
            screenshot = canvas.toDataURL();
            //console.log(screenshot)
            //$this.find('img').attr('src',screenshot);
            $item.find('img').css('background-image', 'url('+screenshot+')');
            sceneInfo = {
                id: index,
                screenshot: screenshot,
                winInfo: winInfo
            };
            // 将情景模式保存到本地
            self.insertOrUpdateSceneInfo(wallID, sceneInfo)
        }
    });
}

/**
 * 加载当前情景模式
 * @param $item
 */
SkyApp.prototype.handleLoadScene = function($item){

    var self = this,
        $activeList = $('#scene ul.active .item'),
        index = $activeList.index($item) + 1,
        $droppable,wallID,
        winInfo, sceneInfo;

    $droppable = $(self.droppableClsActive);
    wallID = $(self.droppableCls).index($droppable);

    //TODO 发送命令获取情景模式信息
    //<syncsc,Wall_ID, Scene_id>

    // 清除现有窗口
    self.handleCloseWindow($droppable.find('.pep'), true)
    // 获取编辑区中的窗口信息
    sceneInfo = self.getSceneInfoById(wallID, index);

    if(sceneInfo){
        winInfo = sceneInfo.winInfo;

        for (var i = 0; i < winInfo.length; i++){

            winInfo[i].win_x0 = parseInt(winInfo[i].win_x0/self.scaleX);
            winInfo[i].win_y0 = parseInt(winInfo[i].win_y0/self.scaleY);
            winInfo[i].win_width = parseInt(winInfo[i].win_width/self.scaleX);
            winInfo[i].win_height = parseInt(winInfo[i].win_height/self.scaleY);
            // 向指定屏幕墙添加窗口
            self.handleInitWindow($droppable, winInfo[i], false, true);
        }

    }
}

SkyApp.prototype.handleDelScene = function($item){

    var self = this,
        $activeList = $('#scene ul.active .item'),
        index = $activeList.index($item) + 1,
        $droppable,wallID,
        winInfo, sceneInfo;

    $droppable = $(self.droppableClsActive);
    wallID = $(self.droppableCls).index($droppable);

    //todo 发送删除情景模式指令
    //<delete,Wall_ID,Scene_id>
    $activeList.removeClass('active');
    $activeList.find('img').css({'background-image':''})

    // 清除现有窗口
    self.handleCloseWindow($droppable.find('.pep'), true)

    // 清除本地数据
    //self.
}