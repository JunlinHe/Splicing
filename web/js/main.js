/**
 * Created by hejunlin on 2015/12/18.
 */

function SkyApp(){
    var self = this;

    // 选择debug模式不向服务器发送数据
    self.debug = true;
    //self.serverUrl = 'http://172.16.1.72:8088/p';
    self.serverUrl = 'p';
    // 事件
    self.evStar = 'click';
    self.evDbClick = 'doubletap';
    self.evPressOrRightClick = 'press contextmenu';// 长按或右键呼出菜单
    // 自定义dom属性
    self.gridAttr = 'data-cvs-grid';
    self.gridStepAttr = 'data-cvs-grid-step'
    self.winIdAttr = 'data-win-id';
    self.winSIdAttr = 'data-win-sid';
    self.winInfoAttr = 'data-win-info';
    self.signalIdAttr = 'data-signal-id';
    self.signalValidAttr = 'data-signal-valid';
    self.sceneIdAttr = 'data-scene-id';
    // 选择器
    self.dragBtnCls = '#input .item .drag';
    self.droppableCls = '.right .tab-pane .droppable';
    self.droppableClsActive = '.right .tab-pane.active .droppable';
    self.$editPanel = $('.col.right .panel-body .tab-content .tab-pane');
    // 存储表名
    self.dbName = 'skyDB';
    self.tblWinInfo = 'tbl_win_wall';
    self.tblSceneInfo = 'tbl_scene_wall';
    // 其他
    self.editPanelSize = {w:false, h:false};
    self.scale = 1;
    self.scaleX = 1;
    self.scaleY = 1;
    self.fullSingleScreen = false;// 是否在新建窗口时单屏最大化

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

    // 加载本地化配置
    self.handleI18n('Messages', 'assets/');

    // 将编辑区设置为16:9（必须在绘制网格前执行）

    self.editPanelSize = self.request16to9();

    // 绘制canvas网格背景
    self.handleDrawGrid();
    //$(self.droppableCls).on('myResize', function(ev){
    //    ev.stopPropagation();// 阻止冒泡
    //
    //    self.handleDrawGrid();
    //});

    // 读取信号源
    self.handleGetSignalList();
    // 读取预设模式
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

    // 初始化预设模式事件
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
 * 生成预设模式列表
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
        $dropable = $(self.droppableCls);

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
            //self.editPanelSize = self.request16to9();

            //self.handleDrawGrid();
            //$dropable.trigger("myResize")
        },700);
    });

    // 在窗体大小改变后重绘
    var idt;
    $(window).on('resize', function() {
        clearTimeout(idt);
        idt = setTimeout(function() {
            // 将编辑区宽高比置为16:9
            self.editPanelSize = self.request16to9();

            //self.handleDrawGrid();
            //$dropable.trigger("myResize")
        }, 700);
    });
}

/**
 * 控制屏幕墙与预设模式列表切换
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
 * 获取输入信号列表
 *
 */
SkyApp.prototype.handleGetSignalList = function(){
    var self = this,
        signalList,
        srcId,
        srcType,
        srcValid;

    //TODO 查询当前输入状态指令
    // <srcinf>
    var cmd = '<srcinf>';
    self.cmd(cmd, function(data){

        signalList = data ? data : '<The valid Input is : SRC TYPE SIGNAL SUB_VALID\r\n'+
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
    },function(){

    });

}

/**
 * 获取预设模式列表
 */
SkyApp.prototype.handleGetSceneList = function(){

    var self = this,
        $sceneList = $('#scene ul'),
        sceneList,resultArr, title, sceneInfo,
        flag = false;

    var sceneType = ['3x3', '2x2'];

    title = $.i18n.prop('index.left.scene.title');

    for (var wallID = 0; wallID < sceneType.length; wallID++){
        //TODO 读取已经存储的情景模式编号
        // <readsc,Wall_ID>
        var cmd = '<readsc,'+
            wallID+
            '>';
        self.cmd(cmd, function(data){

            sceneList = data ? data : '< The valid Scene ID is :\r\n'+
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
        },function(){

        })

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
        self.handleInitWindow($contaner, winInfo, self.fullSingleScreen, true);
    });

    $('#sky-wrapper .right .close-win').on(self.evStar,function(){
        $pep = $(self.droppableClsActive).find('.pep.active')
        self.handleCloseWin($pep, true)
    });

    $('#sky-wrapper .right .clear-win').on(self.evStar,function(){
        $pep = $(self.droppableClsActive).find('.pep')
        self.handleCloseWinAll($pep, true)

    });
}

/**
 * 关闭窗口控件
 * @param $pep
 * @param cleanCache {boolean} 是否清除缓存
 */
SkyApp.prototype.handleCloseWin = function($pep, cleanCache){
    var self = this,
        wallID, winID;

    wallID = $(self.droppableCls).index($(self.droppableClsActive))

    $pep.each(function(){
        var $this = $(this);

        if(cleanCache){

            winID = $this.attr(self.winIdAttr)
            //todo 发送删除窗口指令
            //<shut,Wall_ID,Window_ID>
            var cmd = '<shut,'+
                wallID+','+
                winID+
                '>';
            self.cmd(cmd, function(){

                // 删除本地数据
                self.delWinInfoById(wallID, winID);
            },function(){

            });
        }

        // 移除控件
        $.pep.unbind($this);
        $this.fadeOut(300, function(){
            $this.remove();
        });
    });

}
/**
 * 关闭当前屏幕墙上所有窗口控件
 * @param $pep
 * @param cleanCache {boolean} 是否清除缓存
 */
SkyApp.prototype.handleCloseWinAll = function($pep, cleanCache){
    var self = this,
        wallID;

    wallID = $(self.droppableCls).index($(self.droppableClsActive))

    // 移除控件
    $.pep.unbind($pep);
    $pep.fadeOut(300, function(){
        $pep.remove();

        if(cleanCache){

            //todo 发送关闭一个显示墙组的所有窗口指令
            //<reset,Wall_ID>
            var cmd = '<reset,'+
                wallID+
                '>';
            self.cmd(cmd, function(){

                // 删除本地数据
                self.delWinInfoByWallId(wallID);
            },function(){

            });
        }
    });

}

/**
 * 修改窗口属性
 * @param $obj
 */
SkyApp.prototype.handleUpdateWinAttr = function($obj){
    var self = this,
        $el = $obj.$el,
        posi = $el.attr(self.winInfoAttr).split(','),
        $droppable = $(self.droppableClsActive),
        dPosX = parseInt(posi[0]*self.scaleX/self.scale),
        dPosY = parseInt(posi[1]*self.scaleY/self.scale),
        dPosW = parseInt(posi[3]*self.scaleX),
        dPosH = parseInt(posi[2]*self.scaleY);

    $('#win-id').val($el.attr(self.winIdAttr));
    $('#win-sid').val($el.attr(self.winSIdAttr));
    $('#win-x').val(dPosX);
    $('#win-y').val(dPosY);
    $('#win-w').val(dPosW);
    $('#win-h').val(dPosH);

    $('#modal-win-info').modal('show');

    $('#win-save').off(self.evStar).on(self.evStar, function(){
        var x0 = parseInt($('#win-x').val()/self.scale),
            y0 = parseInt($('#win-y').val()/self.scale),
            w0 = parseInt($('#win-w').val()),
            h0 = parseInt($('#win-h').val()),
            x = x0/self.scaleX*self.scale,
            y = y0/self.scaleY*self.scale,
            w = w0/self.scaleX,
            h = h0/self.scaleY;

        console.log(x+'_'+y+'_'+w+'_'+h)
        $el.outerWidth(w);
        $el.outerHeight(h);
        $obj.moveTo(x, y);

        // 保存窗口信息到本地
        var winInfo = {
            id: 0,
            level: parseInt($el.css('z-index')),
            src_ch: 0,
            src_hstart: 0,
            src_vstart: 0,
            src_hsize: 0,
            src_vsize: 0,
            title: '',
            color: $el.css('background-color'),
            win_x0: x,
            win_y0: y,
            win_width: w,
            win_height: h
        };
        // 将窗口信息存到控件上
        $el.attr(self.winInfoAttr, posi)
        // 获取窗口静态信息
        winInfo = self.getStaticWinInfo($el, $droppable, winInfo);

        // 保存窗口信息到本地
        var wallID = $(self.droppableCls).index($droppable)
        self.insertOrUpdateWinInfo(wallID, winInfo);
        //TODO 发送位置信息
        //self.cmd(pis);

        var info = '窗口标识:'+winInfo.id+'<br>'+
            '窗口序号:'+winInfo.level+'<br>'+
            'x,y:'+x0+','+y0+'<br>'+
            'h,w:'+h0+','+w0;
        $el.find('.content').html(info);
    });
}

/**
 * 绘制网格背景，需要在指定元素上添加属性“data-cvs-grid”，格式为x_y_x0_y0
 * 网格由 水平方向上的x个 和 垂直方向的y个 实线网格组成，每个实线网格又由水平方向上的x0个 和 垂直方向的y0个 虚线网格组成
 * 绘制网格后将网格间距填写到“data-cvs-grid-step”中
 */
SkyApp.prototype.handleDrawGrid = function() {
    var self = this,
        $droppable = $(self.droppableCls),
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

        //canvas.style.cssText = "margin:0 auto; position:absolute;background: #000;";
        canvas.style.cssText = "background: #000;";
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
    winInfo.color = winInfo.color ? winInfo.color : $pep.css('background-color');
    //winInfo.win_x0 = (oLeft-pLeft)*self.scaleX;
    //winInfo.win_y0 = (oTop-pTop)*self.scaleY;
    //winInfo.win_width = oWidth*self.scaleX;
    //winInfo.win_height = oHeight*self.scaleY;
    winInfo.win_x0 = (oLeft-pLeft);
    winInfo.win_y0 = (oTop-pTop);
    winInfo.win_width = oWidth;
    winInfo.win_height = oHeight;

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

        var wallID = $(self.droppableCls).index($droppable)

        // 保存窗口信息到本地
        //self.insertOrUpdateWinInfo(wallID, winInfo)

        //TODO 发送开窗口指令
        //<open,Wall_ID,Window_ID,Src_Ch,src_hstart,src_vstart,src_hsize,src_vsize,win_x0,win_y0,win_width,win_height>
        var cmd = '<open,'+
            wallID+','+
            winInfo.id+','+
            winInfo.src_ch+','+
            winInfo.src_hstart+','+
            winInfo.src_vstart+','+
            winInfo.src_hsize+','+
            winInfo.src_vsize+','+
            parseInt(winInfo.win_x0*self.scaleX)+','+
            parseInt(winInfo.win_y0*self.scaleY)+','+
            parseInt(winInfo.win_width*self.scaleX)+','+
            parseInt(winInfo.win_height*self.scaleY)+
            '>';
        self.cmd(cmd, function(){
            // 保存窗口信息到本地
            self.insertOrUpdateWinInfo(wallID, winInfo)
        },function(){

        });
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
    $el.hammer().on(self.evPressOrRightClick,function(ev){
        ev.preventDefault();

        $popMenu.fadeIn(300);
        $popMenu.on(self.evStar,function(){
            $(this).fadeOut(300);
        })

        // 绑定菜单事件
        self.handleContentPopMenuAction($obj, $popMenu);
    });


    // 移除控件
    $el.find('.close').on(self.evStar, function(){

        self.handleCloseWin($el, true)

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

        console.log(grid)
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
                //$popMenu.fadeOut(300,function(){
                //    $el.find('.close').trigger(self.evStar);
                //});
                self.handleCloseWin($el, true)
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
                $obj.revert();
                break;
            case 'win-info':
                //todo
                self.handleUpdateWinAttr($obj);
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
    // 保存控件变化前的坐标尺寸
    //$obj.reverPosix = {
    //    x:oLeft,
    //    y:oTop,
    //    w:oWidth,
    //    h:oHeight
    //};
    //全屏最大化
    if(!single){

        if(oTop+pTop === pTop && oLeft+pLeft === pLeft && oWidth === pWidth && oHeight === pHeight){

            if($obj.reverPosix){
                $el.outerWidth($obj.reverPosix.w);
                $el.outerHeight($obj.reverPosix.h);
                $obj.moveTo($obj.reverPosix.x + pLeft, $obj.reverPosix.y + pTop);
            }else{
                $el.outerWidth(oWidth);
                $el.outerHeight(oHeight);
                $obj.moveTo(oLeft, oTop);
            }

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

            if($obj.reverPosix){
                $el.outerWidth($obj.reverPosix.w);
                $el.outerHeight($obj.reverPosix.h);
                $obj.moveTo($obj.reverPosix.x + pLeft, $obj.reverPosix.y + pTop);
            }else{
                $el.outerWidth(oWidth);
                $el.outerHeight(oHeight);
                $obj.moveTo(oLeft, oTop);
            }
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

        var pos = self.insideWithin(obj),
            dPosX = parseInt(pos[0]*self.scaleX/self.scale),
            dPosY = parseInt(pos[1]*self.scaleY/self.scale),
            dPosW = parseInt(pos[3]*self.scaleX),
            dPosH = parseInt(pos[2]*self.scaleY);

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
            win_x0: pos[0]/self.scale,
            win_y0: pos[1]/self.scale,
            win_width: pos[3],
            win_height: pos[2]
        };
        // 将窗口信息存到控件上
        $pep.attr(self.winInfoAttr, pos)
        // 获取窗口静态信息
        winInfo = self.getStaticWinInfo($pep, $droppable, winInfo);


        var wallID = $(self.droppableCls).index($droppable)
        // 保存窗口信息到本地
        //self.insertOrUpdateWinInfo(wallID, winInfo);

        // 控件显示记录
        var info = '窗口标识:'+winInfo.id+'<br>'+
            '窗口序号:'+winInfo.level+'<br>'+
            'x,y:'+dPosX+','+dPosY+'<br>'+
            'h,w:'+dPosH+','+dPosW;
        $pep.find('.content').html(info);

        //TODO 发送移动窗口指令
        //<move,Wall_ID,Window_ID,Src_Ch,src_hstart,src_vstart,src_hsize,src_vsize,win_x0,win_y0,win_width,win_height>
        var cmd = '<move,'+
            wallID+','+
            winInfo.id+','+
            winInfo.src_ch+','+
            winInfo.src_hstart+','+
            winInfo.src_vstart+','+
            winInfo.src_hsize+','+
            winInfo.src_vsize+','+
            dPosX+','+
            dPosY+','+
            dPosW+','+
            dPosH+
            '>';
        self.cmd(cmd, function(){
            // 保存窗口信息到本地
            self.insertOrUpdateWinInfo(wallID, winInfo);
        },function(){

        });
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

    console.log(pTop, pLeft, pWidth, pHeight)
    console.log(oTop, oLeft, oWidth, oHeight)

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
        //$el.animate({top: moveTop, left: moveLeft}, 0);
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
    var pis = [fLeft, fTop, oHeight, oWidth];
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
        self.scale = parseInt(val)*0.01;

        $droppable.css({
            'transform': 'scale(' + self.scale + ')',
            'transform-origin': self.scale>1 ? '0 0 0' : 'center'
        });

        $droppable.find('.pep').each(function(){
            var $this = $(this),
                $pep = $this.data('plugin_pep');
            $pep.setScale(self.scale);
            //$pep.setMultiplier(self.scale);
        })

    });

    self.mousewheelScale();
}
/**
 * 滑动鼠标放大缩小滑块
 */
SkyApp.prototype.mousewheelScale = function() {
    var self = this,
        i = 1,
        $obj = $(self.droppableCls);
    $obj.on("mousewheel", function (event, delta) {

        i += delta * 0.1;

        if(i < 0.5) {
            i = 0.6;
            return false;
        }
        if(i > 2) {
            i = 1.9;
            return false;
        }

        self.scale = Math.abs(i);

        $('.sky-btn.dropdown').find('a.dropdown-toggle').html( Math.round(self.scale*100).toFixed(0) +'% <span class="caret"></span>');

        $obj.css({
            'transform': 'scale(' + self.scale + ')',
            'transform-origin': self.scale>1 ? '0 0 0' : 'center'
        })

        $obj.find('.pep').each(function(){
            var $this = $(this);
            $this.data('plugin_pep').setScale(self.scale)
        });
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

    if(self.debug){
        success();
        return false;
    }
    $.ajax({
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

///**
// * 将编辑区宽高比置为16:9
// * @param $element
// */
//SkyApp.prototype.request16to9 = function($element){
//
//    var self = this,
//        oW, oH, inW, inH, padding;
//
//    inW = $element.innerWidth();
//    inH = $element.innerHeight();
//
//    if(inW/inH >= 16/9){
//        padding = (inW - inH*16/9)/2;
//        $element.css({
//            //'height':pH,
//            //'width':pH*16/9,
//            'padding-top': 15,
//            'padding-bottom': 15,
//            'padding-left': padding,
//            'padding-right': padding
//        })
//    }else{
//        padding = (inH - inW*9/16)/2
//        $element.css({
//            //height:oW*9/16,
//            //width:oW,
//            'padding-left': 15,
//            'padding-right': 15,
//            'padding-top': padding,
//            'padding-bottom': padding
//        })
//    }
//
//    oW = $element.width();
//    oH = $element.height();
//
//    // 计算编辑区尺寸比例
//    var grid = $element.find('.tab-pane.active .droppable').attr(self.gridAttr).split('_'),
//        gridX = grid[0],
//        gridY = grid[1];
//    self.scaleX = 1920 * gridX / oW;
//    self.scaleY = 1080 * gridY / oH;
//
//    return {
//        w: oW,
//        h: oH
//    }
//}

/**
 * 将编辑区宽高比置为16:9
 */
SkyApp.prototype.request16to9 = function(){

    var self = this,
        $element = self.$editPanel,
        oW, oH, pWidth, pHeight, margin;

    pWidth = $element.parent().innerWidth();
    pHeight = $element.parent().innerHeight();

    console.log(pWidth, pHeight)
    if(pWidth/pHeight >= 16/9){
        oW = pHeight*16/9;
        oH = pHeight - 20;
        $element.css({
            'margin': '10px auto',
            'width': oW,
            'height': oH,
            'top': 'calc((100% - '+oH+'px)/2)'
        })
    }else{
        margin = (pHeight - (pWidth)*9/16)/2;
        oW = pWidth - 20;
        oH = pWidth*9/16;
        $element.css({
            'margin': margin + 'px auto',
            'width': oW,
            'height': oH,
            'left': 'calc((100% - '+oW+'px)/2)'
        })
    }

    oW = $element.width();
    oH = $element.height();

    // 计算编辑区尺寸比例
    var grid = $element.find('.droppable').attr(self.gridAttr).split('_'),
        gridX = grid[0],
        gridY = grid[1];
    self.scaleX = 1920 * gridX / oW;
    self.scaleY = 1080 * gridY / oH;

    return {
        w: oW,
        h: oH
    }
}

/**
 * 将编辑区设置在屏幕中间
 * @returns {{w: *, h: *}}
 */
SkyApp.prototype.requestCenter = function(){

    var self = this,
        $element = self.$editPanel,
        oW, oH, pWidth, pHeight, margin;


}
/**
 * 鼠标绘制窗口
 */
SkyApp.prototype.handleMouseDraw = function(){
    var self = this,
        $droppable = $(self.droppableCls),
        //$canvas = $droppable.find('canvas'),
        winInfo = {};

    // startX, startY 为鼠标点击时初始坐标
    var startX, startY, dX, dY;

    document.oncontextmenu=new Function("event.returnValue=false;");
    document.onselectstart=new Function("event.returnValue=false;");

    // 鼠标按下
    $droppable.on('mousedown',function(e) {

        if(e.button !== 0 || e.target.className === "content"){
            return false;
        }

        startX = e.pageX;
        startY = e.pageY;
        var $this = $(this),
            oTop = $this.offset().top,
            oLeft = $this.offset().left;

        console.log(oTop, oLeft)
        // 在页面创建 box
        var active_box = document.createElement("div");
        active_box.id = "active-box";
        active_box.className = "draw-box";
        active_box.style.top = (startY - oTop)/self.scale + 'px';
        active_box.style.left = (startX - oLeft)/self.scale + 'px';
        $this.append(active_box);

    });

    // 鼠标移动
    $droppable.on('mousemove',function(e) {

        // 更新 box 尺寸
        var $active_box = $('#active-box')
        if(typeof $active_box !== 'undefined') {
            $active_box.width((e.pageX - startX)/self.scale);
            $active_box.height((e.pageY - startY)/self.scale);
        }

        var $this = $(this),
            pTop = $this.offset().top,
            pLeft = $this.offset().left;

        dX = (e.pageX - pLeft)/self.scale;
        dY = (e.pageY - pTop)/self.scale;

        $('#mouse-pos').html('x:'+ Math.round(dX*self.scaleX) +',y:'+ Math.round(dY*self.scaleY));
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

                dX = (startX - pLeft)/self.scale;
                dY = (startY - pTop)/self.scale;

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

                self.handleInitWindow($this, winInfo, self.fullSingleScreen, true);
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
    self.handleCloseWin($(self.droppableClsActive).find('.pep'), true)

    for(var i = 1; i < resultArr.length - 1; i++){

        var arr = resultArr[i].split(','),
            id = parseInt(arr[0]),
            level_num = parseInt(arr[1]),
            src_ch = arr[2],
            src_hstart = parseInt(arr[3]),
            src_vstart = parseInt(arr[4]),
            src_hsize = parseInt(arr[5]),
            src_vsize = parseInt(arr[6]),
            win_x0 = arr[7],
            win_y0 = arr[8],
            win_width = arr[9],
            win_height = arr[10];

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
 * 根据屏幕墙ID删除本地窗口
 * @param wallID
 */
SkyApp.prototype.delWinInfoByWallId = function(wallID){
    var self = this,
        tbl = self.tblWinInfo + wallID;

    self.delCache(tbl);
}
/**
 * 保存预设模式信息
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
SkyApp.prototype.delSceneByWallId = function(wallID){
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
SkyApp.prototype.delSceneById = function(wallID, sceneID){
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

    //TODO 查询窗口信息指令
    // <winf,Wall_ID>
    var cmd = '<winf,'+
        wallID+
        '>';
    self.cmd(cmd, function(data){

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
                    win_x0: Number(winInfo.win_x0),
                    win_y0: Number(winInfo.win_y0),
                    win_width: Number(winInfo.win_width),
                    win_height: Number(winInfo.win_height)
                }

                // 向指定屏幕墙添加窗口
                self.handleInitWindow($droppable, winInfo, false, false);
            }
        }
    },function(){

    });

}

/**
 * 初始化保存预设模式事件
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

    // 双击保存当前屏幕预设模式
    $('#scene .item').hammer().on(self.evDbClick, function(){

        var $this = $(this),
            $activeList = $('#scene ul.active .item');

        $activeList.removeClass('active')
        $this.addClass('active')

        self.handleSaveScene($this);
    });
}

/**
 * 预设模式编辑菜单事件
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
            case 'sce-del':
                $.confirm({
                    title: $.i18n.prop('index.modal.title.prompt'),
                    message: $.i18n.prop('index.modal.msg.del'),
                    btn: [$.i18n.prop('index.modal.btn.cancel'),$.i18n.prop('index.modal.btn.confirm')],
                    onSuccess:function(){
                        self.handleDelScene($activeItem)
                    }
                });
                break;
            case 'sce-clear':
                $.confirm({
                    title: $.i18n.prop('index.modal.title.prompt'),
                    message: $.i18n.prop('index.modal.msg.del.all'),
                    btn: [$.i18n.prop('index.modal.btn.cancel'),$.i18n.prop('index.modal.btn.confirm')],
                    onSuccess:function(){
                        self.handleDelSceneAll($('#scene ul.active .item'))
                    }
                });
                break;
            default:
                break;
        }
    });
}

/**
 * 保存预设模式
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

    //TODO 新建情景模式指令
    //<creat,Wall_ID,Scene_Mode>
    //var cmd = '<creat,' +
    //    wallID +','+
    //    0+
    //    '>';
    //self.cmd(cmd, function(data){
    //
    //},function(){
    //
    //})

    //TODO 保存情景模式指令
    //<save,Wall_ID,Scene_id>
    var cmd = '<save,' +
        wallID +','+
        index +
        '>';
    self.cmd(cmd, function(data){

        // 获取编辑区中的窗口信息
        winInfo = self.getWinInfoByWallID(wallID);

        // 获取编辑区截图 保存预设模式
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
                // 将预设模式保存到本地
                self.insertOrUpdateSceneInfo(wallID, sceneInfo)
            }
        });
    },function(){

    })
}

/**
 * 加载当前预设模式
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

    // 清除现有窗口
    self.handleCloseWin($droppable.find('.pep'), true)
    // 获取编辑区中的窗口信息
    sceneInfo = self.getSceneInfoById(wallID, index);

    if(sceneInfo){
        winInfo = sceneInfo.winInfo;

        for (var i = 0; i < winInfo.length; i++){

            //winInfo[i].win_x0 = winInfo[i].win_x0;
            //winInfo[i].win_y0 = winInfo[i].win_y0;
            //winInfo[i].win_width = winInfo[i].win_width;
            //winInfo[i].win_height = winInfo[i].win_height;
            // 向指定屏幕墙添加窗口
            self.handleInitWindow($droppable, winInfo[i], false, true);
        }

        //TODO 调用情景模式指令
        //<call,Wall_ID,Scene_id>
        var cmd = '<call,'+
            wallID+','+
            index+
            '>';
        self.cmd(cmd, function(){

        },function(){

        });
    }

}

/**
 * 删除指定预设模式
 * @param $item
 */
SkyApp.prototype.handleDelScene = function($item){

    var self = this,
        $activeList = $('#scene ul.active .item'),
        index = $activeList.index($item) + 1,
        $droppable,wallID;

    $droppable = $(self.droppableClsActive);
    wallID = $(self.droppableCls).index($droppable);

    //todo 发送删除预设模式指令
    //<delete,Wall_ID,Scene_id>
    var cmd = '<delete,'+
        wallID+','+
        index+
        '>';
    self.cmd(cmd, function(data){

        $item.find('img').css({'background-image':''})
        $item.removeClass('active');

        // 清除现有窗口
        //self.handleCloseWin($droppable.find('.pep'), true)

        // 清除本地数据
        self.delSceneById(wallID, index);
    },function(){

    });


}

/**
 * 删除当前屏幕墙下的预设模式
 * @param $item
 */
SkyApp.prototype.handleDelSceneAll = function($item){

    var self = this,
        //$activeList = $('#scene ul.active .item'),
        $droppable, wallID, sceneList;

    $droppable = $(self.droppableClsActive);
    wallID = $(self.droppableCls).index($droppable);


    $item.find('img').css({'background-image':''})
    $item.removeClass('active');

    // 清除现有窗口
    //self.handleCloseWin($droppable.find('.pep'), true)

    // 清除本地数据
    self.delSceneByWallId(wallID);

    //TODO 查询已存在的预设模式
    // <readsc,Wall_ID>
    var cmd = '<readsc,'+
        wallID+
        '>';
    self.cmd(cmd, function(data) {

        sceneList = data ? data : '< The valid Scene ID is :\r\n' +
        '1,2,3,4\r\n' +
        '>';

        var resultArr = sceneList.split('\r\n');

        for (var i = 1; i < resultArr.length - 1; i++) {
            var arr = resultArr[i].split(',')
            //TODO 发送删除预设模式指令
            //<delete,Wall_ID,Scene_id>
            var cmd = '<delete,'+
                wallID+','+
                arr+
                '>';
            self.cmd(cmd, function(data){

            },function(){

            });
        }
    }, function(){})
}
