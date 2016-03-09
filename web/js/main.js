/**
 * Created by hejunlin on 2015/12/18.
 */
function SkyApp(){
    var self = this;

    // cookie保存json格式
    $.cookie.json = true;

    self.version = '1.0';
    // 选择离线模式不向服务器发送数据
    self.offline = true;
    //if(!sessionStorage.authority){
    //    location.href = 'login.html';
    //    return ;
    //}
    self.serverUrl = 'p';
    // 事件
    self.evClick = 'click';
    self.evTap = 'tap'; //hammer单击事件
    self.evDbTap = 'doubletap';
    self.evPress = 'press';// 长按呼出菜单
    self.evRightClick = 'contextmenu';// 右键呼出菜单
    self.evStar = 'MSPointerStart pointerstart touchstart mousedown';
    self.evMove = 'MSPointerMove pointermove touchmove mousemove';
    self.evEnd = 'MSPointerUp pointerup touchend mouseup';
    self.evOut = 'MSPointerOut pointerout touchcancel mouseout';
    // 自定义dom属性
    self.attrGrid = 'data-cvs-grid'; // x_y_x0_y0 网格数x*y 单位网格中的虚线网格x0*y0
    self.attrGridStep = 'data-cvs-grid-step'
    self.attrWinId = 'data-win-id';
    self.attrWinSId = 'data-win-sid';
    self.attrWinLevel = 'data-win-level';
    self.attrWinInfo = 'data-win-info';//用于存放窗口坐标尺寸运算信息的变量
    self.attrSignalId = 'data-signal-id';
    self.attrSignalValid = 'data-signal-valid';
    self.attrSignalColor = 'data-signal-color';
    self.attrSceneId = 'data-scene-id';
    self.attrCommType = 'data-comm-type';
    // 选择器
    self.selWall = '#sky-wrapper > .tab-content > .tab-pane';
    self.selActiveWall = '#sky-wrapper > .tab-content > .tab-pane.active';
    self.selInputList = '#sky-wrapper .input ul';
    self.selActiveInputList = '#sky-wrapper > .tab-content > .tab-pane.active .input ul';
    self.selSceneList = '#sky-wrapper .scene ul';
    self.selActiveSceneList = '#sky-wrapper > .tab-content > .tab-pane.active .scene ul';
    self.selDragBtn = '.input .item .drag';
    self.selDroppable = '#sky-wrapper .placeholder>.droppable';
    self.selActiveDroppable = '#sky-wrapper > .tab-content > .tab-pane.active .placeholder>.droppable';
    //self.$editPanel = $('#sky-wrapper .right .placeholder');
    // 存储表名
    self.dbName = 'skyDB';
    self.tblWinInfo = 'tbl_win_wall';
    self.tblSceneInfo = 'tbl_scene_wall';
    self.tblSetting = 'tbl_setting';
    // 其他
    self.editPanelSize = {w:false, h:false};
    self.scale = [];// 编辑区缩放比例
    self.scaleX = [];//x轴缩放比例
    self.scaleY = [];//y轴缩放比例
    self.enableGesture = true; // 手势开窗
    self.settings = {
        commType: '0' ,//0 串口，1 网络
        commInfo: [
            {com_port: 3, com_baud_rate: 115200},
            {ip: '192.168.1.128', mac:'0,8,220,1,2,3', mask:'255,255,255,0', gate:'192,168,1,1', port:'5100'}
        ], //通信配置信息关联commType，com: ['串口号','波特率']; network: ['ip地址','mac地址','子网掩码','默认网关','端口']
        splice:[
            {phyRow:3,phyCol:3,logicRow:3,logicCol:2,resolution:4,screenWidth:1018,screenHeight:573,frameTop:4,frameBottom:2,frameLeft:4,frameRight:2,cpTop:0,cpBottom:0,cpLeft:0,cpRight:0},
            {phyRow:3,phyCol:2,logicRow:3,logicCol:2,resolution:4,screenWidth:1018,screenHeight:573,frameTop:4,frameBottom:2,frameLeft:4,frameRight:2,cpTop:0,cpBottom:0,cpLeft:0,cpRight:0},
            {phyRow:2,phyCol:2,logicRow:3,logicCol:2,resolution:4,screenWidth:680,screenHeight:380,frameTop:3,frameBottom:2,frameLeft:2,frameRight:3,cpTop:0,cpBottom:0,cpLeft:0,cpRight:0},
            {phyRow:2,phyCol:2,logicRow:3,logicCol:2,resolution:4,screenWidth:680,screenHeight:380,frameTop:3,frameBottom:2,frameLeft:2,frameRight:3,cpTop:0,cpBottom:0,cpLeft:0,cpRight:0}
        ],
        resolution:[
            {actHSize:1024,actVSize:768,hFront:24,vFront:3,hsWidth:136,vsWidth:6,hTotal:1344,vTotal:806,hSyncPol:1,vSyncPol:1,fps:60},
            {actHSize:1280,actVSize:720,hFront:110,vFront:5,hsWidth:40,vsWidth:5,hTotal:1650,vTotal:750,hSyncPol:1,vSyncPol:1,fps:60},
            {actHSize:1280,actVSize:1024,hFront:48,vFront:1,hsWidth:112,vsWidth:3,hTotal:1688,vTotal:1066,hSyncPol:1,vSyncPol:1,fps:60},
            {actHSize:1366,actVSize:768,hFront:70,vFront:3,hsWidth:143,vsWidth:3,hTotal:1792,vTotal:798,hSyncPol:1,vSyncPol:1,fps:60},
            {actHSize:1920,actVSize:1080,hFront:88,vFront:4,hsWidth:44,vsWidth:5,hTotal:2200,vTotal:1125,hSyncPol:0,vSyncPol:0,fps:60}
        ],
        resDef:[
            {actHSize:1920,actVSize:1080,hFront:88,vFront:4,hsWidth:44,vsWidth:5,hTotal:2200,vTotal:1125,hSyncPol:0,vSyncPol:0,fps:60},
            {actHSize:1920,actVSize:1080,hFront:88,vFront:4,hsWidth:44,vsWidth:5,hTotal:2200,vTotal:1125,hSyncPol:0,vSyncPol:0,fps:60},
            {actHSize:1920,actVSize:1080,hFront:88,vFront:4,hsWidth:44,vsWidth:5,hTotal:2200,vTotal:1125,hSyncPol:0,vSyncPol:0,fps:60},
            {actHSize:1920,actVSize:1080,hFront:88,vFront:4,hsWidth:44,vsWidth:5,hTotal:2200,vTotal:1125,hSyncPol:0,vSyncPol:0,fps:60}
        ],
        screenEnable:[true, true, false, false],
        software: {
            lang: 'zh-CN',// 简体中文
            logicFill: false,// 是否在新建窗口时单屏最大化
            menuPrompt: false,
            scenarioTip: false,
            logTip: false,// 显示控制指令
            ctrlInput: true,
            contentual: true,
            matrixInput: false,
            netVideoSource: false
        }
    };

    self.$scrollBar = '';

    // 加载系统设置
    self.handleGblSettings();

    // 将编辑区设置为指定分辨率（必须在绘制网格前执行）
    self.editPanelSize = self.requestResolution();

    // 绘制canvas网格背景
    self.handleDrawGrid();
    //$(self.selDroppable).on('myResize', function(ev){
    //    ev.stopPropagation();// 阻止冒泡
    //
    //    self.handleDrawGrid();
    //});

    // 读取信号源
    self.handleGetSignalList();
    // 读取预设模式
    self.handleGetSceneList();

    // 初始化拖拽按钮
    //self.handleDragBtn();
    // 控制屏幕区缩放
    self.handleDroppablePanelScale();
    // 初始化窗口控制事件
    self.handleWindowAction();
    // 控制面板左右切换
    self.handlePanelSlide();
    // 控制面板标题切换
    self.handleLeftPanelTitleToggle();
    // 初始化屏幕墙切换
    self.handleWallToggle();
    // 鼠标绘制窗口
    self.handleMouseDraw();

    // 默认同步1号墙体窗口信息
    //self.handleSynchronizeWall(0);

    // 初始化预设模式事件
    self.handleSceneAction();

    // 读取上次退出时的编辑状态（同步）
    self.handleSynWall(0);

    // 加载登录信息
    self.handleAuthority();

    $('.loader').fadeOut(300, function(){

    })

    // 滚动条
    //$("#sky-wrapper .left .tab-pane").mCustomScrollbar({
    //    theme:'dark'
    //});
    //self.$scrollBar = $('#sky-wrapper .left .tab-content').slimScroll({
    //    color: '#fff',
    //    size: '10px',
    //    height: 'auto',
    //    alwaysVisible: false,
    //    distance: '3px',
    //    railVisible: true
    //});

    //var color = [];
    //for (var i = 0; i<20;i++){
    //    color.push(self.getRandomColor());
    //}
    //console.log(color)
    return self;
}


/**
 * 加载消息框
 */
SkyApp.prototype.log = function(msg, type){
    if(typeof msg == 'undefined'){
        msg = 'undefined';
    }else if(msg.length <= 0){
        msg = 'empty string';
    }else{
        msg = msg.toString().replace(/(<|>)/gi, '');
    }

    msg = '<div class="msg-time">' + new Date().Format("yyyy-MM-dd hh:mm:ss") + '</div>' + msg;
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
        closeButtonText: '<i class="fa fa-trash-o"></i>'
    });
}

/**
 * 加载本地化文件，替换html中的字符串，用于服务器没有本地化的情况
 * @param name
 * @param path
 * @param lang
 */
SkyApp.prototype.handleI18n = function(name, path, lang){
    var self = this,
        lang = lang || self.settings.software.lang || navigator.language;

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
 * 登录信息
 */
SkyApp.prototype.handleAuthority = function(){
    var self = this,
        authority;

    authority = sessionStorage.authority ? JSON.parse(sessionStorage.authority) :
        ($.cookie('authority') ? $.cookie('authority') : false);

    if(authority){
        $('#user-name').html(authority.name);
    }

    $('#user-menu li a').on(self.evClick, function(ev){
        ev.preventDefault();

        var _this = $(this);

        if(_this.hasClass('exit')){
            $.confirm({
                title: $.i18n.prop('index.modal.title.prompt'),
                message: $.i18n.prop('index.msg.exit'),
                btn: [$.i18n.prop('index.btn.cancel'),$.i18n.prop('index.btn.ok')],
                onSuccess:function(){

                    //TODO 发送退出命令
                    $.get('logout', authority, function(data){
                        if(data === 'SUCCESS'){
                            sessionStorage.clear();
                            $.removeCookie('authority');
                            location.href = 'login.html'
                        }
                    });
                }
            });
        }

    });

    $('#ud-psw-form').bootstrapValidator({
        message: $.i18n.prop('user.authority.msg.invalid'),
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            old_psw: {
                message: $.i18n.prop('user.authority.msg.invalid'),
                validators: {
                    notEmpty: {
                        message: $.i18n.prop('user.authority.msg.psw_empty')
                    },
                    stringLength: {
                        min: 6,
                        max: 30,
                        message: $.i18n.prop('user.authority.msg.psw_length_less')
                    },
                    /*remote: {
                     url: 'remote.php',
                     message: 'The username is not available'
                     },*/
                    regexp: {
                        regexp: /^[a-zA-Z0-9_\.]+$/,
                        message: $.i18n.prop('user.authority.msg.type_err')
                    }
                }
            },
            new_psw: {
                validators: {
                    notEmpty: {
                        message: $.i18n.prop('user.authority.msg.psw_empty')
                    },
                    identical: {
                        field: 'confirm_psw',
                        message: $.i18n.prop('user.authority.msg.psw_same_confirm')
                    },
                    different: {
                        field: 'old_psw',
                        message: $.i18n.prop('user.authority.msg.psw_same_old')
                    },
                    stringLength: {
                        min: 6,
                        max: 30,
                        message: $.i18n.prop('user.authority.msg.psw_length_less')
                    },
                    regexp: {
                        regexp: /^[a-zA-Z0-9_\.]+$/,
                        message: $.i18n.prop('user.authority.msg.type_err')
                    }
                }
            },
            confirm_psw: {
                validators: {
                    notEmpty: {
                        message: $.i18n.prop('user.authority.msg.psw_empty')
                    },
                    identical: {
                        field: 'new_psw',
                        message: $.i18n.prop('user.authority.msg.psw_same_confirm')
                    },
                    different: {
                        field: 'old_psw',
                        message: $.i18n.prop('user.authority.msg.psw_same_old')
                    },
                    stringLength: {
                        min: 6,
                        max: 30,
                        message: $.i18n.prop('user.authority.msg.psw_length_less')
                    },
                    regexp: {
                        regexp: /^[a-zA-Z0-9_\.]+$/,
                        message: $.i18n.prop('user.authority.msg.type_err')
                    }
                }
            }
        }
    }).on('success.form.bv', function (e) {
        e.preventDefault();

        var json = $('#modal-ud-psw form').serializeJson(),
            getData = {};

        authority = sessionStorage.authority ? JSON.parse(sessionStorage.authority) :
            ($.cookie('authority') ? $.cookie('authority') : false);

        getData.name = authority.name;
        getData.password = json.old_psw;
        getData.new_password = json.new_psw;

        $.get('ud_psw', getData, function (data) {
            if(data === 'FAIL'){
                var msg = $.i18n.prop('user.authority.msg.psw_err')
                self.log(msg)
            }else{

                $('#modal-ud-psw').modal('hide');
                var msg = $.i18n.prop('user.authority.msg.psw_modified');
                self.log(msg);
            }
        });
    }).find('.reset').on(self.evClick, function(ev) {
        ev.preventDefault();

        $('#ud-psw-form').data('bootstrapValidator').resetForm(true);
    });
}

/**
 * 全局设置
 */
SkyApp.prototype.handleGblSettings = function(){
    var self = this,
        localSettings;

    // 读取设置
    localSettings = self.getCache(self.tblSetting, true);
    //console.log(localSettings)
    if(!localSettings){ //默认设置
        self.setCache(self.tblSetting, self.settings, true);
    }else{
        self.settings = localSettings;
    }

    // 加载本地化配置
    self.handleI18n('Messages', 'assets/', self.settings.software.lang);

    // 默认同步1号屏的设置
    self.handleSynScreeSettings(0);

    // 通信设置事件
    self.handleCommSettings();
    // 软件设置事件
    self.handleSoftwareSettings();
    // 拼接设置事件
    self.handleSplicingSettings();
    // 版本设置
    self.handleVersionSettings();
}


/**
 * 通信设置事件
 */
SkyApp.prototype.handleCommSettings = function(){
    var self = this;

    // 加载设置
    $('#comm_setting').on('shown.bs.modal', function () {
        var $this = $(this);

        // 读取设置
        self.settings = self.getCache(self.tblSetting, true);
        //TODO 加载配置到窗口上

        console.log(self.settings)
        $('#comm_tab li:eq(' + self.settings.commType + ') a').tab('show')

        $('#com_port').val(self.settings.commInfo[0].com_port);
        $('#com_baud_rate').val(self.settings.commInfo[0].com_baud_rate);

        $('#ip_addr').val(self.settings.commInfo[1].ip);
        $('#ip_port').val(self.settings.commInfo[1].port);

        $('.selectpicker').selectpicker('render');// 刷新选择控件
    });

    $('#comm_setting .yes').on(self.evClick, function(){

        var json = $('#comm_setting').find('.tab-pane.active form').serializeJson(),
            commType = $('#comm_setting').find('.tab-pane.active').attr(self.attrCommType);

        console.log(json)

        self.settings.commType = commType;

        if(commType === '0'){
            self.settings.commInfo[0] = json;
        }else{
            self.settings.commInfo[1].ip = json.ip;
            self.settings.commInfo[1].port = json.port;
        }

        self.setCache(self.tblSetting, self.settings, true);
    });
}

/**
 * 软件设置事件
 */
SkyApp.prototype.handleSoftwareSettings = function(){
    var self = this;

    // 加载设置
    $('#software_setting').on('shown.bs.modal', function () {
        var $this = $(this);

        //读取设置
        self.settings = self.getCache(self.tblSetting, true);

        var $langBtn = $this.find('#lang_btn [name=lang].' + self.settings.software.lang);

        $this.find('#lang_btn .btn').removeClass('active');
        $langBtn.parent().addClass('active');
        $langBtn.prop('checked', true);

        $this.find('#logic_fill input').prop('checked', self.settings.software.logicFill);
        $this.find('#menu_prompt input').prop('checked', self.settings.software.menuPrompt);
        $this.find('#scenario_tip input').prop('checked', self.settings.software.scenarioTip);
        $this.find('#log_tip input').prop('checked', self.settings.software.logTip);

        $this.find('#ctrl_input input').prop('checked', self.settings.software.ctrlInput);
        $this.find('#contentual input').prop('checked', self.settings.software.contentual);
        $this.find('#matrix_input input').prop('checked', self.settings.software.matrixInput);
        $this.find('#net_video_source input').prop('checked', self.settings.software.netVideoSource);
    })

    $('#software_setting #lang_switcher').off(self.evClick).on(self.evClick, function(){
        var lang = $('#software_setting [name=lang]:checked').val();

        self.settings.software.lang = lang;
        self.setCache(self.tblSetting, self.settings, true);
        location.reload();
        return false;
    });

    $('#software_setting input:checkbox').off(self.evClick).on(self.evClick, function(){
        var $this = $(this),
            name = $this.attr('name'),
            checked = $this.prop('checked'),
            cmd = 'self.settings.software.' + name + '=' + checked;

        eval(cmd);
        self.setCache(self.tblSetting, self.settings, true);
    });

}

/**
 * 拼接设置事件
 */
SkyApp.prototype.handleSplicingSettings = function(){
    var self = this;

    // 设置屏幕网格
    var splice = self.settings.splice;
    for(var i = 0; i < splice.length; i++){
        var json = splice[i];

        $(self.selDroppable).eq(i).attr(self.attrGrid, json.phyCol+'_'+json.phyRow+'_'+json.logicCol+'_'+json.logicRow)
    }

    // 加载设置
    $('#splice_setting').on('shown.bs.modal', function () {
        var $thisModal = $(this);

        // 读取设置
        self.settings = self.getCache(self.tblSetting, true);

        // 装载设置
        var splice = self.settings.splice;
        for(var i = 0; i < splice.length; i++){

            var $panel = $thisModal.find('.tab-pane:eq('+ i +')'),
                json = splice[i];

            // 将tab1的内容插入到2中再填充数据
            if(i !== 0 && $panel.html() === ''){
                $panel.html($thisModal.find('.tab-pane:eq(0)').html());
            }


            $panel.find('input').each(function(){
                var $input = $(this);

                if($input.attr('type') === 'radio'){

                    var screenID = parseInt($input.val());
                    if(screenID === parseInt(json[$input.attr('name')])){
                        console.log('find', $input.val())
                        $thisModal.find('.resolution_select .btn').eq(i).removeClass('active');
                        $input.parent().addClass('active');
                        $input.prop('checked', true);

                        $('#splice_setting .val_label').html(self.settings.resolution[screenID].actHSize + 'x' +self.settings.resolution[screenID].actVSize);
                    }
                }else{
                    $input.val(json[$input.attr('name')]);
                }
            });
        }

        // 加载屏幕使能
        $thisModal.find('#screen_enable input').each(function(i, el){
            var $input = $(this),
                enable = self.settings.screenEnable[i];

            $input.prop('checked', enable);

            if(!enable){
                var $disableLi = $thisModal.find('.nav.nav-tabs>li:eq('+ i +')');
                $disableLi.addClass('disabled');
                $disableLi.find('a').removeAttr('data-toggle');
            }
        })
    });

    // 分辨率选择
    $('#splice_setting .resolution_select label').on(self.evClick, function(){
        var $this = $(this),
            val = $this.find('input').val(),
            screenID = parseInt(val);

        $('#splice_setting .val_label').html(self.settings.resolution[screenID].actHSize + 'x' +self.settings.resolution[screenID].actVSize);
    });

    // 屏幕使能切换
    $('#splice_setting #screen_enable input[type=checkbox]').on(self.evClick, function(){
        var $this = $(this),
            name = $this.attr('name'),
            i = $('#splice_setting #screen_enable input[type=checkbox]').index($this),
            checked = $this.prop('checked'),
            $disableLi = $('#splice_setting .nav.nav-tabs>li:eq('+ i +')');

        if(checked){
            $disableLi.removeClass('disabled');
            $disableLi.find('a').attr('data-toggle','tab');
        }else {
            $disableLi.addClass('disabled');
            $disableLi.find('a').removeAttr('data-toggle');
        }

        self.settings.screenEnable[i] = checked;

        //self.setCache(self.tblSetting, self.settings, true);
    });


    // 按钮保存
    $('#splice_setting .modal-footer .btn').on(self.evClick, function(){
        var $this = $(this),
        //wallId = $(self.selDroppable).index($(self.selActiveDroppable)),
            $activeScreen = $('#splice_setting .tab-content>.tab-pane.active'),
            screenID = $activeScreen.prevAll().size();

        if($this.hasClass('sync')){

            self.handleSynScreeSettings(screenID);

            // 装载设置
            var splice = self.settings.splice;
            for(var i = 0; i < splice.length; i++){

                var $setting = $('#splice_setting'),
                    $panel = $setting.find('.tab-pane:eq('+ i +')'),
                    json = splice[i];

                $panel.find('input').each(function(){
                    var $input = $(this);

                    if($input.attr('type') === 'radio'){

                        var screenID = parseInt($input.val());
                        if(screenID === parseInt(json[$input.attr('name')])){
                            console.log('find', $input.val())
                            $setting.find('.resolution_select .btn').removeClass('active');
                            $input.parent().addClass('active');
                            $input.prop('checked', true);

                            $setting.find('.val_label').html(self.settings.resolution[screenID].actHSize + 'x' +self.settings.resolution[screenID].actVSize);
                        }
                    }else{
                        $input.val(json[$input.attr('name')]);
                    }
                });
            }
        }else if($this.hasClass('apply') || $this.hasClass('ok')){

            var json = $activeScreen.find('form').serializeJson();

            console.log(json)
            //TODO 发送设置命令
            // <wallmod,Wall_ID,Hnum,Vnum,PanelWidth,PanelHeight,HgapL,HgapR,VgapU,VgapD>
            //<wallmod cmd done>

            var cmd = '<wallmod,'+
                screenID + ','+
                json.phyRow + ','+
                json.phyCol + ','+
                json.screenWidth + ','+
                json.screenHeight + ','+
                json.frameLeft + ','+
                json.frameRight + ','+
                json.frameTop + ','+
                json.frameBottom + ','+
                '>';
            self.cmd(cmd, true, function(data){

                // 保存本地设置
                if(Number(json.resolution) !== Number(self.settings.splice[screenID].resolution)){
                    self.settings.resDef[screenID] = self.settings.resolution[Number(json.resolution)];
                }
                self.settings.splice[screenID] = json;

                self.setCache(self.tblSetting, self.settings, true);

                // 重绘canvas网格

                $(self.selDroppable).eq(screenID).attr(self.attrGrid, json.phyCol+'_'+json.phyRow+'_'+json.logicCol+'_'+json.logicRow)
                self.editPanelSize = self.requestResolution();
                self.handleDrawGrid();

                //清除该墙所有窗口
                var $pep = $(self.selDroppable).eq(screenID).find('.pep');
                if($pep.size() > 0){
                    self.handleCloseWinAll($pep, true, true);
                }

                // 清除情景模式
                self.handleDelSceneAll($(self.selActiveSceneList).find('li.item'));

            },function(){

            });

            $('#splice_setting').modal('toggle');
        }
    });

    // 加载高级分辨率设置
    $('#advance_resolution').on('shown.bs.modal', function () {
        var $this = $(this);

        // 读取设置
        self.settings = self.getCache(self.tblSetting, true);

        // 装载设置
        var $activeScreen = $('#splice_setting .tab-content>.tab-pane.active'),
            screenID = $activeScreen.prevAll().size(),
            resID = $activeScreen.find('input[name=resolution]:checked').val(),
            resolution = self.settings.resolution[resID];

        // 改变分辨率后读取新分辨率设置
        if(Number(resID) === Number(self.settings.splice[screenID].resolution) ){
            resolution = self.settings.resDef[screenID];
        }

        // 表单填充
        $this.find('input').each(function(){
            var $input = $(this);

            $input.val(resolution[$input.attr('name')]);
        });

    });

    // 高级分辨率设置按钮保存
    $('#advance_resolution .modal-footer .btn').on(self.evClick, function(){
        var $this = $(this),
            $form = $('#advance_resolution'),
            $activeScreen = $('#splice_setting .tab-content>.tab-pane.active'),
            screenID = $activeScreen.prevAll().size(),
            resID = $activeScreen.find('input[name=resolution]:checked').val(),
            resolution = self.settings.resolution[resID]

        if($this.hasClass('def')){

            // 表单填充
            $form.find('input').each(function(){
                var $input = $(this);

                $input.val(resolution[$input.attr('name')]);
            });
        }else if($this.hasClass('ok')){

            var json = $form.find('form').serializeJson();

            console.log(json)
            self.settings.resDef[screenID] = json;
            // 这里不保存，要等到拼接设置保存后再保存
            //self.setCache(self.tblSetting, self.settings, true);
        }
    });
}

/**
 * 版本控制
 */
SkyApp.prototype.handleVersionSettings = function(){
    var self = this;

    $('#version-name').html(self.version);
}

/**
 * 获取window控件
 * @param title
 * @param dataId
 * @param dataSid
 * @param dataLevel
 * @returns {string}
 */
SkyApp.prototype.getWinCtrl = function(title, dataId, dataSid, dataLevel){
    var self = this;
    title = typeof title === 'undefined' ? '' : title;
    dataId = typeof dataId === 'undefined' ? '' : dataId;
    dataSid = typeof dataSid === 'undefined' ? '' : dataSid;
    dataLevel = typeof dataLevel === 'undefined' ? '' : dataLevel;

    return '<div class="pep window" '+
        self.attrWinId+'="'+dataId+'" '+
        self.attrWinSId+'="'+dataSid+'" '+
        self.attrWinLevel+'="'+dataLevel+'">'+
        '<div class="title">'+
        '<span>'+title+'</span>'+
        '<div class="button close"><i class="fa fa-close"></i></div>'+
        '<div class="button fullscreen"><i class="fa fa-arrows-alt"></i></div>'+
        '<div class="button full-single-screen"><i class="fa fa-expand"></i></div>'+
        '<div class="button lock"><i class="fa fa-lock"></i></div>'+
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

    var self = this,
        icon, disable = '', draggable = '', color;
    id = typeof id === 'undefined' ? '' : id;
    name = typeof name === 'undefined' ? '' : name;
    valid = typeof valid === 'undefined' ? '' : valid;
    color = self.getColor(Number(id));

    if(valid === 0){
        icon = '<span class="fa-stack">'+
            '<i class="fa fa-plug fa-rotate-270 fa-stack-1x"></i>'+
            '<i class="fa fa-ban fa-stack-2x text-danger"></i>'+
            '</span>';
        disable = 'disable';
    }else {
        icon = '<i class="fa fa-plug fa-rotate-270 fa-lg"></i>';
        draggable = 'draggable = "true"';
    }
    return '<li class="sky-btn item '+disable+'" >'+
        icon+
        '<div class="drag" '+self.attrSignalId+'="'+id+'" '+self.attrSignalValid+'="'+valid+'" '+self.attrSignalColor+'="'+color+'" '+draggable+'>'+
        '<a>'+id+'-'+name+'</a>'+
        '<div class="content"></div>'+
        '</div>'+
        '</li>';
}

/**
 * 生成预设模式列表
 * @param id
 * @param title
 //* @param grid
 * @param src
 * @returns {string}
 */
SkyApp.prototype.getSceneCtrl = function(id, title, src){

    var self = this;
    id = typeof id === 'undefined' ? '' : id;
    title = typeof title === 'undefined' ? '' : title+id;
    //grid = typeof grid === 'undefined' ? '3x3' : grid;
    src = typeof src === 'undefined' ? '' : 'style="background-image: url('+src+');"';

    return '<li class="sky-btn item" '+self.attrSceneId+'="'+id+'">'+
        '<i class="fa fa-bookmark-o fa-lg"></i>'+
        '<span>'+title+'</span>'+
            //'<img class="grid'+grid+'" '+src+'>'+
        '<img '+src+'>'+
        '</li>';
}

/**
 * 标题切换
 */
SkyApp.prototype.handleLeftPanelTitleToggle = function(){
    var self = this;

    $('.left-footer-btn li a[data-toggle="tab"]').on('shown.bs.tab', function () {
        var $this = $(this),
            index = $($('.left-footer-btn li a[data-toggle="tab"]')).index($this);

        index = index % 2 === 0 ? 1 : 2;
        $this.closest('.panel-footer').siblings('.panel-heading').find('span').html($.i18n.prop('index.left.action.title' + index))
    })
}

/**
 * 面板滑动
 */
SkyApp.prototype.handlePanelSlide = function(){

    var self = this,
        $wall = $(self.selWall),
        $dropable = $(self.selDroppable);

    $wall.find('.collapse-btn').off(self.evClick).on(self.evClick, function(e){
        e.preventDefault();
        var $this = $(this),
            index = $this.index(),
            wallId = $wall.index($(self.selActiveWall));

        switch(index){
            case 1:
                $wall.eq(wallId).find('.row').addClass('off');
                break;
            case 2:
                $wall.eq(wallId).find('.row').removeClass('off');
                break;
            default:break;
        }

        // 重绘canvas
        //setTimeout(function(){
        //    // 将编辑区宽高比置为16:9
        //    self.editPanelSize = self.requestResolution();
        //
        //    self.handleDrawGrid();
        //    //$dropable.trigger("myResize")
        //},700);
    });

    // 在窗体大小改变后重绘
    var idt;
    $(window).on('resize', function() {
        clearTimeout(idt);
        idt = setTimeout(function() {

            // 滚动条重置
            //$('#sky-wrapper .left .tab-content').slimScroll({destroy:true}).slimScroll({
            //    color: '#fff',
            //    size: '10px',
            //    height: 'auto',
            //    alwaysVisible: false,
            //    distance: '3px',
            //    railVisible: true
            //});

            var $activeDroppable = $(self.selActiveDroppable),
                wallId = $dropable.index($activeDroppable)

            self.handleSynScreeSettings(wallId);

            // 将编辑区宽高比置为指定比例
            self.editPanelSize = self.requestResolution();

            self.handleDrawGrid();

            self.handleSynWall(wallId);
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

    $toggleBtn.on(self.evClick, function (e) {
        e.preventDefault();

        var $this = $(this),
            wallId = $toggleBtn.index($this);
        $this.tab('show');

        // 转场fade结束后再同步
        setTimeout(function(){
            self.handleSynScreeSettings(wallId);
            // 重绘canvas
            //self.editPanelSize = self.requestResolution();
            //self.handleDrawGrid();
            // 加载本地缓存
            self.handleSynWall(wallId);
        },300)
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
    self.cmd(cmd, false, function(data){

        if(data && data !== 'offline'){

            if(data && data.split(',').length > 2){
                signalList = data;
            }else{
                return false;
            }
        }else if(data === 'offline'){
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
        }

        var resultArr = signalList.split('\r\n'),
            $inputList = $( self.selInputList);
        $inputList.html('');

        for(var i = 1; i < resultArr.length - 1; i++){
            var arr = resultArr[i].split(',');
            srcId = parseInt(arr[0])
            srcType = arr[1]
            srcValid = parseInt(arr[2])

            $inputList.append(self.getSignalCtrl(srcId, srcType, srcValid));
        }

        $inputList.find('li:first').addClass('active')

        $inputList.find('li').hammer().off(self.evTap).on(self.evTap, function(e){
            //$inputList.on(self.evClick,'li', function(e){

            //e.preventDefault();

            var $this = $(this);

            if($this.find('.drag').attr(self.attrSignalValid) === '0'){
                self.log($.i18n.prop('index.msg.invalid.input_signal'));
            }else{
                $(self.selActiveInputList).find('li').removeClass('active')
                $this.addClass('active')
            }

        })

        // 拖拽信号生成窗口
        if (navigator.userAgent.match(/mobile/i)) {
            self.handleTouchSignalDrag();
        }else {
            self.handlePCSignalDrag();
        }
    },function(){

    });

}

/**
 * PC端拖拽信号生成窗口
 */
SkyApp.prototype.handlePCSignalDrag = function(){

    var self = this,
        $signal = $(self.selInputList).find('li .drag'),
        $droppable = $(self.selDroppable),
        startX, startY;

    $signal.off('dragstart').on('dragstart', function(e) {

        var $this = $(this),
            id = $this.attr(self.attrSignalId),
            valid = $this.attr(self.attrSignalValid),
            title = $this.find('a').html(),
            color = $this.attr(self.attrSignalColor),
            str = JSON.stringify({
                id: id,
                valid: valid,
                title: title,
                color: color
            });

        e.originalEvent.dataTransfer.setData("Text", str);
    });

    $(document).off('dragover').on('dragover', function(e) {
        e.preventDefault();
    });

    $droppable.off('dragover').on('dragover', function(e) {
        e.stopPropagation();
        e.preventDefault();
    });

    $droppable.off('drop').on('drop', function(e) {
        e.stopPropagation();
        e.preventDefault();

        var $this = $(this),
            className,
            data = eval('('+ e.originalEvent.dataTransfer.getData("Text") +')');

        className = e.target.className;

        // 切换信号通道
        if(className === 'content'){

            // 保存窗口信息到本地
            var $pep = $(e.target).parent(),
                wallId = $droppable.index($this),
                winInfo = self.getWinInfoById(wallId, parseInt($pep.attr(self.attrWinId)));

            $pep.find('.title span').html(data.title);

            winInfo.title = data.title;
            winInfo.src_ch = data.id;
            winInfo.color = data.color;

            $pep.attr(self.attrWinSId, winInfo.src_ch);
            $pep.css({'background':winInfo.color});

            //TODO 发送移动窗口指令
            //<switch,Wall_ID,Window_ID,Src_Ch,src_hstart,src_vstart,src_hsize,src_vsize>
            var cmd = '<switch,'+
                wallId+','+
                winInfo.id+','+
                winInfo.src_ch+','+
                winInfo.src_hstart+','+
                winInfo.src_vstart+','+
                winInfo.src_hsize+','+
                winInfo.src_vsize+','+
                '>';
            self.cmd(cmd, true, function(){

                // 保存窗口信息到本地
                self.insertOrUpdateWinInfo(wallId, winInfo);

            },function(){

            });
        }else{
            // 生成窗口

            var wallId = $droppable.index($this),
                pTop = $this.offset().top,
                pLeft = $this.offset().left,
                winID, winLevel, idArr = [], levelArr = [], winInfo;

            if(isTouch(e)){
                startX = e.originalEvent.touches[0].pageX;
                startY = e.originalEvent.touches[0].pageY;
            }else{
                startX = e.originalEvent.pageX;
                startY = e.originalEvent.pageY;
            }

            $this.find('.pep').each(function(){
                var _this = $(this)
                idArr.push(parseInt(_this.attr(self.attrWinId)));
                levelArr.push(parseInt(_this.attr(self.attrWinLevel)));
            });
            winID = idArr.queue();// 获取队列中新的ID
            winLevel = levelArr.queue();// 获取队列中新的ID

            winInfo = {
                id: winID,
                level: winLevel,
                src_ch: data.id,
                src_hstart: 0,
                src_vstart: 0,
                src_hsize: 0,
                src_vsize: 0,
                title: data.title,
                color: data.color,
                win_x0: (startX - pLeft) / self.scale[wallId],
                win_y0: (startY - pTop) / self.scale[wallId],
                win_width: false,
                win_height: false
            };

            self.handleInitWindow($this, winInfo, self.settings.software.logicFill, true, true);
        }

    });
}

/**
 * 移动端拖拽信号生成窗口
 */
SkyApp.prototype.handleTouchSignalDrag = function(){
    var self = this,
        $signal = $(self.selInputList).find('li .drag'),
        dataTransfer = {},
        dragFlag = false;

    $signal.hammer().on(self.evPress, function(ev){
        ev.preventDefault();
        var $this = $(this),
            pageX = ev.gesture.pointers[0].pageX,
            pageY = ev.gesture.pointers[0].pageY,
            id = $this.attr(self.attrSignalId),
            valid = $this.attr(self.attrSignalValid),
            title = $this.find('a').html(),
            color = $this.attr(self.attrSignalColor),
            str = {
                id: id,
                valid: valid,
                title: title,
                color: color
            };

        if($this.attr(self.attrSignalValid) === '0'){
            self.log($.i18n.prop('index.msg.invalid.input_signal'));
            return false;
        }

        $('#drag').addClass('active').css({
            top: pageY-25,
            left: pageX-25
        }).find('span').html(title);

        dataTransfer = str;

        dragFlag = true; //长按后可以拖拽，否则是滚动列表
        console.log('press', dataTransfer);
    });

    $signal.hammer().on('panmove', function(ev){
        ev.preventDefault();

        if(!dragFlag) return false;

        var pageX = ev.gesture.pointers[0].pageX,
            pageY = ev.gesture.pointers[0].pageY;
        $('#drag').css({
            top: pageY-25,
            left: pageX-25
        });
    });

    $signal.hammer().on('pancancel pressup', function(ev){
        $('#drag').removeClass('active')
    });

    $signal.hammer().on('panend', function(ev){
        ev.preventDefault();
        if(!dragFlag) return false;

        $('#drag').removeClass('active')

        var pageX = ev.gesture.pointers[0].pageX,
            pageY = ev.gesture.pointers[0].pageY,
            $target = $(document.elementFromPoint(pageX, pageY)),
            tagName = $target.prop('tagName');

        // 切换信号
        if(tagName === 'DIV' && $target.hasClass('content')){

            // 保存窗口信息到本地
            var $pep = $target.parent(),
                $activeDroppable = $(self.selActiveDroppable),
                wallId = $(self.selDroppable).index($activeDroppable),
                winInfo = self.getWinInfoById(wallId, parseInt($pep.attr(self.attrWinId)));

            $pep.find('.title span').html(dataTransfer.title);

            winInfo.title = dataTransfer.title;
            winInfo.src_ch = dataTransfer.id;
            winInfo.color = dataTransfer.color;

            $pep.attr(self.attrWinSId, winInfo.src_ch);
            $pep.css({'background':winInfo.color});

            //TODO 发送移动窗口指令
            //<switch,Wall_ID,Window_ID,Src_Ch,src_hstart,src_vstart,src_hsize,src_vsize>
            var cmd = '<switch,'+
                wallId+','+
                winInfo.id+','+
                winInfo.src_ch+','+
                winInfo.src_hstart+','+
                winInfo.src_vstart+','+
                winInfo.src_hsize+','+
                winInfo.src_vsize+','+
                '>';
            self.cmd(cmd, true, function(){

                // 保存窗口信息到本地
                self.insertOrUpdateWinInfo(wallId, winInfo);

            },function(){

            });
        }else if(tagName === 'CANVAS'){//生成新窗口

            var $activeDroppable = $(self.selActiveDroppable),
                wallId = $(self.selDroppable).index($activeDroppable),
                pTop = $activeDroppable.offset().top,
                pLeft = $activeDroppable.offset().left,
                winID,winLevel, idArr = [], levelArr = [], winInfo;

            $activeDroppable.find('.pep').each(function(){
                var _this = $(this)
                idArr.push(parseInt(_this.attr(self.attrWinId)))
                levelArr.push(parseInt(_this.attr(self.attrWinLevel)));
            });
            winID = idArr.queue();// 获取队列中新的ID
            winLevel = levelArr.queue();

            winInfo = {
                id: winID,
                level: winLevel,// 获取队列中新的窗口层次
                src_ch: dataTransfer.id,
                src_hstart: 0,
                src_vstart: 0,
                src_hsize: 0,
                src_vsize: 0,
                title: dataTransfer.title,
                color: dataTransfer.color,
                win_x0: (pageX - pLeft) / self.scale[wallId],
                win_y0: (pageY - pTop) / self.scale[wallId],
                win_width: false,
                win_height: false
            };

            self.handleInitWindow($activeDroppable, winInfo, self.settings.software.logicFill, true, true);
        }

        dragFlag = false;
    });
}

/**
 * 获取预设模式列表
 */
SkyApp.prototype.handleGetSceneList = function(){

    var self = this,
        $sceneList = $(self.selSceneList),
        sceneList,resultArr, title, sceneInfo,
        flag = false;

    //var sceneType = ['3x3', '2x2'];

    title = $.i18n.prop('index.left.scene.title');

    for (var wallId = 0; wallId < self.settings.screenEnable.length; wallId++){

        if(!self.settings.screenEnable[wallId]) return false;
        //TODO 读取已经存储的情景模式编号
        // <readsc,Wall_ID>
        var cmd = '<readsc,'+
            wallId+
            '>';
        self.cmd(cmd, false, function(data){

            if(data === '') return false;
            // 生成空白列表
            for(var j = 1; j < 33; j++){

                $sceneList.eq(wallId).append(self.getSceneCtrl(j, title));
            }

            if(data && data !== 'offline'){
                if(data && data.split(',').length > 2){
                    sceneList = data;
                }else{
                    return false;
                }
            }else if(data === 'offline'){
                sceneList = '< The valid Scene ID is :\r\n'+
                    '1,2,3,4\r\n'+
                    '>';
            }

            resultArr = sceneList.split('\r\n');

            for(var i = 1; i < resultArr.length - 1; i++){

                var arr = resultArr[i].split(',');// 生效的预设模式
                for(var k = 0; k < arr.length; k++){
                    var sceneID = parseInt(arr[k]);

                    // 读取本地保存的预设模式缩略图
                    sceneInfo = self.getSceneInfoById(wallId, sceneID);

                    if(sceneInfo){
                        //$sceneList.eq(wallId).append(self.getSceneCtrl(arr[k], title, sceneType[wallId], sceneInfo.screenshot));
                        $sceneList.eq(wallId).find('li').eq(sceneID-1).after(self.getSceneCtrl(arr[k], title, sceneInfo.screenshot));
                        $sceneList.eq(wallId).find('li').eq(sceneID-1).remove();
                        flag = true;
                        break;
                    }
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
        activeDroppable = self.selActiveDroppable;

    // 同步当前屏幕墙
    $('#synchronize').on(self.evClick,function(e){
        e.preventDefault();

        var $activeDroppable = $(activeDroppable),
            wallId = $activeDroppable.parent().index();
        //self.handleSynchronizeWall(wallId)

        self.handleSynScreeSettings(wallId);
        // 重绘canvas
        self.editPanelSize = self.requestResolution();
        self.handleDrawGrid();

        self.handleSynWall(wallId);

        // 读取信号源
        self.handleGetSignalList();
        // 读取预设模式
        self.handleGetSceneList();
    });

    $('#sky-wrapper .right .new-win').on(self.evClick, function(e){
        e.preventDefault();
        $contaner = $(activeDroppable)
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
        self.handleInitWindow($contaner, winInfo, self.settings.software.logicFill, true, true);
    });

    $('#sky-wrapper .right .close-win').on(self.evClick,function(e){
        e.preventDefault();

        $pep = $(self.selActiveDroppable).find('.pep.active')
        if($pep.size() > 0){
            self.handleCloseWin($pep, true, true)
        }else{
            self.log($.i18n.prop('index.msg.no.select_win'));
        }
    });

    $('#sky-wrapper .right .clean-win').on(self.evClick,function(e){
        e.preventDefault();

        $pep = $(self.selActiveDroppable).find('.pep')
        if($pep.size() > 0){
            self.handleCloseWinAll($pep, true, true)
        }
    });

    $('#sky-wrapper .right .draw-win').on(self.evClick,function(e){
        e.preventDefault();

        var $this = $(this);

        if($this.hasClass('disable')){
            $this.removeClass('disable');
            self.enableGesture = true;
            $(self.selActiveDroppable).css({
                cursor:'crosshair'
            })
        }else{
            $this.addClass('disable');
            self.enableGesture = false;
            $(self.selActiveDroppable).css({
                cursor:'-webkit-grab'
            })
        }
    });

}

/**
 * 关闭窗口控件
 * @param $pep
 * @param cleanCache {boolean} 是否清除缓存
 * @param sendCMD {boolean} 是否发送清除命令
 */
SkyApp.prototype.handleCloseWin = function($pep, cleanCache, sendCMD){
    var self = this,
        wallId, winID;

    wallId = $(self.selDroppable).index($(self.selActiveDroppable))

    $pep.each(function(){
        var $this = $(this);

        if(cleanCache){

            winID = $this.attr(self.attrWinId);

            // 删除本地数据
            self.delWinInfoById(wallId, winID);

            if(sendCMD){
                //todo 发送删除窗口指令
                //<shut,Wall_ID,Window_ID>
                var cmd = '<shut,'+
                    wallId+','+
                    winID+
                    '>';
                self.cmd(cmd, true, function(){

                },function(){

                });
            }
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
 * @param sendCMD {boolean} 是否发送清除命令
 */
SkyApp.prototype.handleCloseWinAll = function($pep, cleanCache, sendCMD){
    var self = this,
        wallId;

    wallId = $(self.selDroppable).index($(self.selActiveDroppable))

    // 移除控件
    $.pep.unbind($pep);
    $pep.fadeOut(300, function(){
        $pep.remove();

    });

    if(cleanCache){

        // 删除本地数据
        self.delWinInfoByWallId(wallId);
        if(sendCMD){
            //todo 发送关闭一个显示墙组的所有窗口指令
            //<reset,Wall_ID>
            var cmd = '<reset,'+
                wallId+
                '>';
            self.cmd(cmd, true, function(){

            },function(){

            });
        }

    }
}

/**
 * 修改窗口属性
 * @param $obj
 */
SkyApp.prototype.handleUpdateWinAttr = function($obj){
    var self = this,
        $el = $obj.$el,
        pos = $el.attr(self.attrWinInfo).split(','),
        $activeDroppable = $(self.selActiveDroppable),
        index = $(self.selDroppable).index($activeDroppable),
        dPosX = Math.round(pos[0]*self.scaleX[index]/self.scale[index]).toFixed(0),
        dPosY = Math.round(pos[1]*self.scaleY[index]/self.scale[index]).toFixed(0),
        dPosW = Math.round(pos[3]*self.scaleX[index]).toFixed(0),
        dPosH = Math.round(pos[2]*self.scaleY[index]).toFixed(0),
        winID = $el.attr(self.attrWinId),
        winSID = $el.attr(self.attrWinSId),
        winLevel = $el.attr(self.attrWinLevel);

    $('#win-id').val(winID);
    $('#win-sid').val($el.find('.title span').html());
    $('#win-x').val(dPosX);
    $('#win-y').val(dPosY);
    $('#win-w').val(dPosW);
    $('#win-h').val(dPosH);

    $('#modal-win-info').modal('show');

    $('#win-save').off(self.evClick).on(self.evClick, function(e){
        e.preventDefault();

        var x0 = Math.round($('#win-x').val()).toFixed(0),
            y0 = Math.round($('#win-y').val()).toFixed(0),
            w0 = Math.round($('#win-w').val()).toFixed(0),
            h0 = Math.round($('#win-h').val()).toFixed(0),
            x = x0/self.scaleX[index],
            y = y0/self.scaleY[index],
            w = w0/self.scaleX[index],
            h = h0/self.scaleY[index];

        console.log(x+'_'+y+'_'+w+'_'+h)
        console.log(x*self.scaleX[index], y*self.scaleY[index], w*self.scaleX[index], h*self.scaleY[index])
        $el.outerWidth(w);
        $el.outerHeight(h);
        $obj.moveTo(x, y);

        // 保存窗口信息到本地
        var winInfo = {
            id: parseInt(winID),
            level: parseInt(winLevel),
            src_ch: parseInt(winSID),
            src_hstart: 0,
            src_vstart: 0,
            src_hsize: 0,
            src_vsize: 0,
            title: $el.find('.title span').html(),
            color: $el.css('background-color'),
            win_x0: x,
            win_y0: y,
            win_width: w,
            win_height: h
        };
        // 将窗口信息存到控件上
        $el.attr(self.attrWinInfo, [x, y, h, w])
        // 获取窗口静态信息
        //winInfo = self.getStaticWinInfo($el, $activeDroppable, winInfo);

        //var wallId = $(self.selDroppable).index($activeDroppable)
        //TODO 发送移动窗口指令
        //<move,Wall_ID,Window_ID,Src_Ch,src_hstart,src_vstart,src_hsize,src_vsize,win_x0,win_y0,win_width,win_height>
        var cmd = '<move,'+
            index+','+
            winInfo.id+','+
            winInfo.src_ch+','+
            winInfo.src_hstart+','+
            winInfo.src_vstart+','+
            winInfo.src_hsize+','+
            winInfo.src_vsize+','+
            x0+','+
            y0+','+
            w0+','+
            h0+
            '>';
        self.cmd(cmd, true, function(){

            // 保存窗口信息到本地
            self.insertOrUpdateWinInfo(index, winInfo);

            var info = $.i18n.prop('index.msg.win_index') + (parseInt(winInfo.id)+1) +'<br>'+
                $.i18n.prop('index.msg.win_zindex') + (parseInt(winInfo.level)+1) + '<br>'+
                $.i18n.prop('index.msg.win_pos') + '(' + x0 + ',' + y0 + ')' + '<br>'+
                $.i18n.prop('index.msg.win_size') + '(' + w0 + ',' + h0 + ')';
            $el.find('.content').html(info);
        },function(){

        });


    });
}

/**
 * 绘制网格背景，需要在指定元素上添加属性“data-cvs-grid”，格式为x_y_x0_y0
 * 网格由 水平方向上的x个 和 垂直方向的y个 实线网格组成，每个实线网格又由水平方向上的x0个 和 垂直方向的y0个 虚线网格组成
 * 绘制网格后将网格间距填写到“data-cvs-grid-step”中
 */
SkyApp.prototype.handleDrawGrid = function() {
    var self = this,
        $droppable = $(self.selDroppable),
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

    $droppable.each(function(index, el){

        var $thisDroppable = $(this),

            $el = $(el);

        grid = $el.attr(self.attrGrid);

        if(!grid){return false;}

        gridArr = grid.split('_');

        if(!(gridArr instanceof Array) && gridArr.length < 2){return false;}

        x = gridArr[0];
        y = gridArr[1];
        x0 = gridArr[2];
        y0 = gridArr[3];

        $thisDroppable.find('canvas').remove();

        //idObject = document.getElementById('cvs'+x+'-'+y);
        //if (idObject != null)
        //    idObject.parentNode.removeChild(idObject);

        canvas = document.createElement("canvas");
        canvas.id = 'cvs'+x+'-'+y;

        // 由于jquery不能获取display:none元素的物理尺寸，故获取当前显示的第一个相近元素的尺寸
        canvas.width = self.editPanelSize[index].w;
        canvas.height = self.editPanelSize[index].h;
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

        stepX = self.editPanelSize[index].w/x;
        stepY = self.editPanelSize[index].h/y;
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
        $el.attr(self.attrGridStep, dashedStepX+'_'+dashedStepY);
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
 * 生成window控件
 * @param $pep 控件对象
 * @param droppableCls 拖拽区class
 * @param winInfo {object} 窗口属性
 * @param fullSingleScreen {boolean} 是否触发单屏最大化
 */
SkyApp.prototype.handleWindowCtrl = function($pep, winInfo, fullSingleScreen){

    var self = this;

    $pep.css({
        width: winInfo.win_width,
        height: winInfo.win_height,
        //background: winInfo.color ? winInfo.color : winInfo.color = self.getRandomColor()// 随机背景颜色
        background: winInfo.color
            ? winInfo.color
            //: winInfo.color = $(self.selActiveInputList).find('li:eq('+ (Number(winInfo.src_ch)+1) +') .drag').attr(self.attrSignalColor)
            : winInfo.color = self.getColor( (Number(winInfo.src_ch)) ),
        'z-index': winInfo.level
    });

    $pep.pep({
        //debug: true,
        droppable: self.selActiveDroppable,
        dragIcon: '.coor',//添加的拖拽缩放功能
        selectFloat: true,//选中元素上浮
        allowDragEventPropagation: false,//禁止DOM冒泡
        ignoreRightClick: true,// 不允许右键移动
        minSize:{'w':50,'h':50},
        maxSize:null,
        constrainTo: 'window',
        elementsWithInteraction: '.full-single-screen,.fullscreen,.close',//指定某部分不会触发拖动
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
        startPos: { left: Number(winInfo.win_x0), top: Number(winInfo.win_y0) },
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
            var $el = obj.$el,
                $parent = $el.parent(),

                winInfo = $el.attr(self.attrWinInfo).split(','),

                pTop = $parent.position().top,
                pLeft = $parent.position().left,

                oTop = $el.position().top - pTop,
                oLeft = $el.position().left - pLeft;

            $el.attr(self.attrWinInfo, [oLeft, oTop, winInfo[2], winInfo[3]]);
        },
        rest: function (ev, obj){
            self.handleCentering(ev, obj);
        },
        onResizeEnd: function(ev, obj){

            var $el = obj.$el,
                $parent = $el.parent(),

                winInfo = $el.attr(self.attrWinInfo).split(','),

                oHeight = $el.outerHeight(),
                oWidth = $el.outerWidth();

            $el.attr(self.attrWinInfo, [winInfo[0], winInfo[1], oHeight, oWidth]);
        }

    });

    //self.handleInitWinCtrlAction($(droppableCls).find('.pep:last').data('plugin_pep'));
    var $obj = $pep.data('plugin_pep');

    self.handleInitWinCtrlAction($obj);

    //TODO 因为通过窗口尺寸换算显示分辨率会产生误差，这里对默认无分辨率的窗口设置默认宽高
    if(winInfo.win_height == false || winInfo.win_width == false){
        winInfo.win_height = $pep.height();
        winInfo.win_width = $pep.width();
    }

    // 将窗口信息存到控件上
    $pep.attr(self.attrWinInfo, [winInfo.win_x0, winInfo.win_y0, winInfo.win_height, winInfo.win_width])

    // 开窗后单屏最大化
    if(fullSingleScreen){
        var $elParent = $obj.$el.parent(),
            x_y = $elParent.attr(self.attrGrid).split('_'),
            stepXY = $elParent.attr(self.attrGridStep).split('_'),
            grid = [x_y[0] * x_y[2], x_y[1] * x_y[3], stepXY[0], stepXY[1]];

        self.requestFullSingleScreen($obj, grid, true)

        //winInfo = self.handleGetWinInfo($obj.$el, $droppable);
    }

    // 保存窗口信息到本地
    //var wallId = $(self.selDroppable).index($droppable)
    //self.insertOrUpdateWinInfo(wallId, winInfo);

    return $obj;
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
        winLevel = 0,
        winTitle = '',
        color = '',
        $selectedSignal = $(self.selActiveInputList).find('.item.active .drag');

    var idArr = [], levelArr = [];
    if($pep === null || typeof $pep === 'undefined'){
        $droppable.find('.pep').each(function(index, el){
            var $this = $(this);
            idArr.push(parseInt($this.attr(self.attrWinId)));
            levelArr.push(parseInt($this.attr(self.attrWinLevel)));
        });

        winID = idArr.queue();// 获取队列中新的ID
        winSID = $selectedSignal.attr(self.attrSignalId);
        winSID = winSID ? winSID : 1;

        winLevel = levelArr.queue();// 获取队列中新的level

        winTitle = $selectedSignal.find('a').html()

        color = $selectedSignal.attr(self.attrSignalColor)
    }else{
        winID = $pep.attr(self.attrWinId);//获取自身的窗口ID
        winSID = $pep.attr(self.attrWinSId);
        winLevel = $pep.attr(self.attrWinLevel);
        winTitle = $pep.find('.title span').html();

        color = $pep.css('background');
    }

    defaultInfo.id = parseInt(winID);
    defaultInfo.title = winTitle;
    defaultInfo.src_ch = parseInt(winSID);
    defaultInfo.color = color;
    defaultInfo.level = parseInt(winLevel);

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
        pTop, pLeft, pWidth, pHeight,
        x, y, w, h;

    if(typeof $pep.attr(self.attrWinInfo) != 'undefined'){
        var pos = $pep.attr(self.attrWinInfo).split(',');

        x = pos[0];
        y = pos[1];
        w = pos[3];
        h = pos[2];
    }else{
        pTop = $droppable.position().top;
        pLeft = $droppable.position().left;
        pWidth = $droppable.innerWidth();
        pHeight = $droppable.innerHeight();

        oTop = $pep.position().top - pTop;
        oLeft = $pep.position().left - pLeft;
        oWidth = $pep.outerWidth();
        oHeight = $pep.outerHeight();

        x = oLeft-pLeft;
        y = oTop-pTop;
        w = oWidth;
        h = oHeight;

        // 将窗口信息存到控件上
        $pep.attr(self.attrWinInfo, [x, y, h, w])
    }


    //level = $pep.css('z-index');

    winInfo.level =  parseInt(winInfo.level ? winInfo.level : $pep.css('z-index'));
    winInfo.color = winInfo.color ? winInfo.color : $pep.css('background-color');
    //winInfo.win_x0 = (oLeft-pLeft)*self.scaleX;
    //winInfo.win_y0 = (oTop-pTop)*self.scaleY;
    //winInfo.win_width = oWidth*self.scaleX;
    //winInfo.win_height = oHeight*self.scaleY;
    winInfo.win_x0 = x;
    winInfo.win_y0 = y;
    winInfo.win_width = w;
    winInfo.win_height = h;

    return winInfo;
}

/**
 * 生成窗口的全部逻辑
 * @param $droppable
 * @param defaultInfo
 * @param fullSingleScreen
 * @param cache {boolean} 是否缓存数据
 * @param open 是否开窗
 */
SkyApp.prototype.handleInitWindow = function($droppable, defaultInfo, fullSingleScreen, cache, open){
    var self = this,
        winInfo,
        $pep,
        index = $(self.selDroppable).index($droppable);

    // 获取窗口id，信号源等静态数据
    if(defaultInfo.id === 0
        && defaultInfo.src_ch === 0
        && defaultInfo.level === 0){
        winInfo = self.getStaticWinInfo(null, $droppable, defaultInfo);
    }else{
        winInfo = defaultInfo
    }

    // 添加控件
    $droppable.append(self.getWinCtrl(winInfo.title, winInfo.id, winInfo.src_ch, winInfo.level))
    $pep = $droppable.find('.pep:last');

    // 初始化
    var $obj = self.handleWindowCtrl(
        $pep,
        //$droppable,
        winInfo,
        fullSingleScreen
    )

    // 根据当前编辑区缩放比例设置窗口移动缩放比例
    $obj.scale = self.scale[index];

    // 初始化完成获取完整信息
    winInfo = self.getDynamicWinInfo($pep, $droppable, winInfo);

    if(cache){

        var wallId = $(self.selDroppable).index($droppable)

        if(open){
            //TODO 发送开窗口指令
            //<open,Wall_ID,Window_ID,Src_Ch,src_hstart,src_vstart,src_hsize,src_vsize,win_x0,win_y0,win_width,win_height>
            var cmd = '<open,'+
                wallId+','+
                winInfo.id+','+
                winInfo.src_ch+','+
                winInfo.src_hstart+','+
                winInfo.src_vstart+','+
                winInfo.src_hsize+','+
                winInfo.src_vsize+','+
                Math.round(winInfo.win_x0*self.scaleX[index]).toFixed(0)+','+
                Math.round(winInfo.win_y0*self.scaleY[index]).toFixed(0)+','+
                Math.round(winInfo.win_width*self.scaleX[index]).toFixed(0)+','+
                Math.round(winInfo.win_height*self.scaleY[index]).toFixed(0)+
                '>';
            self.cmd(cmd, true, function(data){

                // 保存窗口信息到本地
                self.insertOrUpdateWinInfo(wallId, winInfo)
            },function(){

            });

        }else{
            // 保存窗口信息到本地
            self.insertOrUpdateWinInfo(wallId, winInfo)
        }



    }

}
/**
 * 生成随机16进制颜色代码
 * @returns {string}
 */
SkyApp.prototype.getRandomColor = function(){
    return '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).substr(-6);
}

SkyApp.prototype.getColor = function(index){
    var color = ["#1c9e6d", "#84053c", "#200598", "#4478a1", "#445f10", "#6da8bd", "#20ffbc", "#05bd1d", "#2e4aa4", "#2160ff", "#a3fccc", "#6776e0", "#e5d1e3", "#024430", "#d0724a", "#bd9b9c", "#13f22c", "#f2266a", "#75d044", "#c1feca"];
    return color[index];
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

    // 右键呼出菜单
    $el.on(self.evRightClick,function(ev){
        ev.preventDefault();

        //console.log('mouse event:', ev)
        var pos = {x: ev.pageX, y: ev.pageY};

        // 绑定菜单事件
        self.handleContentPopMenuAction($obj, $popMenu, pos);
    });

    // 移动设备长按呼出菜单
    $el.find('.content').hammer().on(self.evPress,function(ev){
        ev.preventDefault();

        //var pointer = ev.gesture.pointers[0],
        //    pos = {x: pointer.pageX, y: pointer.pageY};

        if (!navigator.userAgent.match(/mobile/i)) {
            return false;
        }

        // 绑定菜单事件
        self.handleContentPopMenuAction($obj, $popMenu);
    });

    // 移除控件
    $el.find('.close').hammer().on(self.evTap, function(e){
        e.preventDefault();

        self.handleCloseWin($el, true, true)

        $obj.options.constrainTo = 'window';
    });

    // 解锁控件
    $el.find('.lock').hammer().on(self.evTap, function(e){
        e.preventDefault();

        $obj.toggle(true);
        $el.removeClass('lock');
    });

    // 按钮 单屏最大化
    $el.find('.full-single-screen').hammer().on(self.evTap, function(){
        var x_y = $elParent.attr(self.attrGrid).split('_'),
            stepXY = $elParent.attr(self.attrGridStep).split('_'),
            grid = [x_y[0] * x_y[2], x_y[1] * x_y[3], stepXY[0], stepXY[1]];

        self.requestFullSingleScreen($obj, grid, true);
        setTimeout(function(){
            self.handleCentering(null, $obj);
        },300)
    });
    // 按钮 全屏最大化
    $el.find('.fullscreen').hammer().on(self.evTap, function(){
        var x_y = $elParent.attr(self.attrGrid).split('_'),
            stepXY = $elParent.attr(self.attrGridStep).split('_'),
            grid = [x_y[0] * x_y[2], x_y[1] * x_y[3], stepXY[0], stepXY[1]];

        self.requestFullSingleScreen($obj, grid, false);
        setTimeout(function(){
            self.handleCentering(null, $obj);
        },300)
    });

    // 双击 单屏最大化
    $el.find('.content').hammer().on(self.evDbTap, function(){
        var x_y = $elParent.attr(self.attrGrid).split('_'),
            stepXY = $elParent.attr(self.attrGridStep).split('_'),
            grid = [x_y[0] * x_y[2], x_y[1] * x_y[3], stepXY[0], stepXY[1]];

        self.requestFullSingleScreen($obj, grid, true)
    });

}

/**
 * 编辑区弹出菜单点击事件
 * @param $obj
 * @param $popMenu
 * @param pos
 */
SkyApp.prototype.handleContentPopMenuAction = function ($obj, $popMenu, pos){
    var self = this,
        $el = $obj.$el,
        $elParent = $el.parent();

    if(pos){
        var $ul = $popMenu.find('ul'),
            oH = $ul.height(),
            dH = $(document).height(),
            dX = pos.x, dY = pos.y;
        if(oH + pos.y > dH){
            dY = dH - oH;
        }
        $ul.css({
            left: dX,
            top: dY
        });
    }

    if($el.hasClass('lock')){
        $popMenu.find("a:not(.win-unlock,.win-attr)").addClass('disable');
    }else{
        $popMenu.find("a").removeClass('disable');
    }

    $popMenu.fadeIn(300);
    $popMenu.off(self.evClick).on(self.evClick, function(e){
        e.preventDefault();
        $(this).fadeOut(300);
    });

    $popMenu.off(self.evClick, 'a').on(self.evClick, 'a', function(ev){
        //ev.stopPropagation();// 阻止冒泡触发父元素事件
        var $this = $(this),
            x_y, stepXY, grid,
            wallId = $(self.selDroppable).index($(self.selActiveDroppable));

        switch ($this.attr('class')){
            case 'single-screen':
                x_y = $elParent.attr(self.attrGrid).split('_');
                stepXY = $elParent.attr(self.attrGridStep).split('_');
                grid = [x_y[0] * x_y[2], x_y[1] * x_y[3], stepXY[0], stepXY[1]];

                self.requestFullSingleScreen($obj, grid, true);
                setTimeout(function(){
                    self.handleCentering(null, $obj);
                },300)
                break;
            case 'full-screen':
                x_y = $elParent.attr(self.attrGrid).split('_');
                stepXY = $elParent.attr(self.attrGridStep).split('_');
                grid = [x_y[0] * x_y[2], x_y[1] * x_y[3], stepXY[0], stepXY[1]];

                self.requestFullSingleScreen($obj, grid, false);
                setTimeout(function(){
                    self.handleCentering(null, $obj);
                },300)
                break;
            case 'up-level':
                var currLevel = Number($el.css('z-index')),
                    $brother = $el.siblings('['+self.attrWinLevel+'="'+(currLevel+1)+'"]');

                if(currLevel !== $el.siblings().size()-1){
                    $brother.attr(self.attrWinLevel, currLevel);
                    $brother.css('z-index', currLevel);
                    $el.attr(self.attrWinLevel, currLevel+1);
                    $el.css('z-index', currLevel+1);

                    //发送窗口叠加层次更改指令
                    var cmd = '<movz,'+
                        wallId +','+
                        $el.attr(self.attrWinId) +','+
                        (currLevel+1) +
                        '>';
                    self.cmd(cmd, true, function(data){
                        self.handleCentering(null, $obj);
                    },function(){
                    });
                    cmd = '<movz,'+
                        wallId +','+
                        $brother.attr(self.attrWinId) +','+
                        currLevel +
                        '>';
                    self.cmd(cmd, true, function(data){
                        self.handleCentering(null, $brother.data('plugin_pep'));
                    },function(){
                    });
                }
                break;
            case 'down-level':
                var currLevel = Number($el.css('z-index')),
                    $littleBrother = $el.siblings('['+self.attrWinLevel+'="'+(currLevel-1)+'"]');

                if(currLevel !== 0){
                    $littleBrother.attr(self.attrWinLevel, currLevel);
                    $littleBrother.css('z-index', currLevel);
                    $el.attr(self.attrWinLevel, currLevel-1);
                    $el.css('z-index', currLevel-1);
                    //发送窗口叠加层次更改指令
                    var cmd = '<movz,'+
                        wallId +','+
                        $el.attr(self.attrWinId) +','+
                        (currLevel-1) +
                        '>';
                    self.cmd(cmd, true, function(data){
                        self.handleCentering(null, $obj);
                    },function(){
                    });
                    cmd = '<movz,'+
                        wallId +','+
                        $littleBrother.attr(self.attrWinId) +','+
                        currLevel +
                        '>';
                    self.cmd(cmd, true, function(data){
                        self.handleCentering(null, $littleBrother.data('plugin_pep'));
                    },function(){
                    });
                }
                break;
            case 'win-close':
                self.handleCloseWin($el, true, true)
                break;
            case 'go-top':
                var currLevel = Number($el.css('z-index')),
                    topLevel = $el.siblings().size()-1,
                    $siblings = $el.siblings();

                if(currLevel === topLevel) break;
                $siblings.each(function(){
                    var _this = $(this),
                        siblingsLevel = Number(_this.attr(self.attrWinLevel)),
                        winId = _this.attr(self.attrWinId);
                    if(siblingsLevel > currLevel){
                        _this.css('z-index', siblingsLevel-1);
                        _this.attr(self.attrWinLevel, siblingsLevel-1);
                        //发送窗口叠加层次更改指令
                        var cmd = '<movz,'+
                            wallId +','+
                            winId +','+
                            (siblingsLevel-1) +
                            '>';
                        self.cmd(cmd, true, function(data){
                            self.handleCentering(null, _this.data('plugin_pep'));
                        },function(){
                        });
                    }
                });

                $el.css('z-index', topLevel);
                $el.attr(self.attrWinLevel, topLevel);
                //发送窗口叠加层次更改指令
                var cmd = '<movz,'+
                    wallId +','+
                    $el.attr(self.attrWinId) +','+
                    topLevel +
                    '>';
                self.cmd(cmd, true, function(data){
                    self.handleCentering(null, $obj);
                },function(){
                });
                break;
            case 'go-bottom':
                var currLevel = Number($el.css('z-index')),
                    bottomLevel = 0,
                    $siblings = $el.siblings();

                if(currLevel === bottomLevel) break;
                $siblings.each(function(){
                    var _this = $(this),
                        siblingsLevel = Number(_this.attr(self.attrWinLevel)),
                        winId = _this.attr(self.attrWinId);
                    if(siblingsLevel < currLevel){
                        _this.css('z-index', siblingsLevel+1);
                        _this.attr(self.attrWinLevel, siblingsLevel+1);
                        //发送窗口叠加层次更改指令
                        var cmd = '<movz,'+
                            wallId +','+
                            winId +','+
                            (siblingsLevel+1) +
                            '>';
                        self.cmd(cmd, true, function(data){
                            self.handleCentering(null, _this.data('plugin_pep'));
                        },function(){
                        });
                    }
                });

                $el.css('z-index', bottomLevel);
                $el.attr(self.attrWinLevel, bottomLevel);
                //发送窗口叠加层次更改指令
                var cmd = '<movz,'+
                    wallId +','+
                    $el.attr(self.attrWinId) +','+
                    bottomLevel +
                    '>';
                self.cmd(cmd, true, function(data){
                    self.handleCentering(null, $obj);
                },function(){
                });
                break;
            case 'win-lock':
                $obj.toggle(false);
                $el.addClass('lock');
                //$popMenu.find("a:not(.win-unlock,.win-attr)").addClass('disable');
                break;
            case 'win-unlock':
                $obj.toggle(true);
                $el.removeClass('lock');
                //$popMenu.find("a").removeClass('disable');
                break;
            case 'win-restore':
                $obj.revert();
                break;
            case 'win-attr':
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
        dTop, dLeft, dWidth, dHeight,// 位移
        index = $(self.selDroppable).index($(self.selActiveDroppable));

    x = grid[0];
    y = grid[1];
    //TODO 这里的缩放会影响窗口与网格间关系的判断，造成单屏最大化的误差
    stepX = grid[2] * self.scale[index];
    stepY = grid[3] * self.scale[index];

    pTop = $elParent.position().top;
    pLeft = $elParent.position().left;
    pWidth = $elParent.innerWidth();
    pHeight = $elParent.innerHeight();

    oTop = $el.position().top - pTop;
    oLeft = $el.position().left - pLeft;
    oWidth = $el.outerWidth();
    oHeight = $el.outerHeight();

    //全屏最大化(允许1px误差)
    if(!single){

        if(Math.abs(oTop+pTop - pTop) <= 1 && Math.abs(oLeft+pLeft - pLeft) <= 1 && Math.abs(oWidth - pWidth) <= 1 && Math.abs(oHeight - pHeight) <= 1){

            console.log('全屏最大化还原', 11)
            if($obj.reverPos){
                $el.outerWidth($obj.reverPos.w);
                $el.outerHeight($obj.reverPos.h);
                $obj.moveTo($obj.reverPos.x / self.scale[index], $obj.reverPos.y / self.scale[index]);
                // 将窗口信息存到控件上
                $el.attr(self.attrWinInfo, [$obj.reverPos.x, $obj.reverPos.y, $obj.reverPos.h, $obj.reverPos.w])
            }else{
                $el.outerWidth(oWidth);
                $el.outerHeight(oHeight);
                $obj.moveTo(oLeft / self.scale[index], oTop / self.scale[index]);
                // 将窗口信息存到控件上
                $el.attr(self.attrWinInfo, [oLeft, oTop, oHeight, oWidth])
            }

        }else{

            $el.outerWidth(pWidth);
            $el.outerHeight(pHeight);
            $obj.moveTo(0, 0);
            // 保存控件变化前的坐标尺寸
            $obj.reverPos = {
                x:oLeft,
                y:oTop,
                w:oWidth,
                h:oHeight
            };
            // 将窗口信息存到控件上
            $el.attr(self.attrWinInfo, [0, 0, pHeight, pWidth])
        }

    }else{//单屏最大化

        if($obj.reverPos){
            $el.outerWidth($obj.reverPos.w);
            $el.outerHeight($obj.reverPos.h);
            $obj.moveTo($obj.reverPos.x + pLeft, $obj.reverPos.y + pTop);
            // 将窗口信息存到控件上
            $el.attr(self.attrWinInfo, [$obj.reverPos.x, $obj.reverPos.y, $obj.reverPos.h, $obj.reverPos.w])

            $obj.reverPos = false;
        }else{

            for(var i = 0; i < x; i ++){
                if(stepX*i <= oLeft && oLeft <= stepX*(i+1)){
                    dLeft = stepX*i;
                    break;
                }
            }
            for(var j = 0; j < y; j ++){
                if(stepY*j <= oTop && oTop <= stepY*(j+1)){
                    dTop = stepY*j;
                    break;
                }
            }
            for(var k = 0; k < x; k ++){
                var horizon = oLeft * self.scale[index] + oWidth;
                if(stepX*k <= horizon && horizon <= stepX*(k+1)){
                    dWidth = stepX*(k+1) - dLeft;
                    break;
                }
            }
            for(var l = 0; l < y; l ++){
                var vertical = oTop * self.scale[index] + oHeight;
                if(stepY*l <= vertical && vertical <= stepY*(l+1)){
                    dHeight = stepY*(l+1) - dTop;
                    break;
                }
            }

            $el.outerWidth(dWidth / self.scale[index]);
            $el.outerHeight(dHeight / self.scale[index]);

            $obj.moveTo(dLeft / self.scale[index], dTop / self.scale[index])
            //console.log(dLeft/self.scale * self.scaleX, dTop/self.scale*self.scaleY, dWidth*self.scaleX, dHeight*self.scaleY)

            // 保存控件变化前的坐标尺寸
            $obj.reverPos = {
                x:oLeft,
                y:oTop,
                w:oWidth,
                h:oHeight
            };
            // 将窗口信息存到控件上
            $el.attr(self.attrWinInfo, [dLeft, dTop, dHeight / self.scale[index], dWidth / self.scale[index]])
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
        $activeDroppable, $pep, winInfo;

    if (obj.activeDropRegions.length > 0) {
        //centerWithin(obj);

        $activeDroppable = obj.activeDropRegions[0];
        $pep = obj.$el;

        var pos = self.insideWithin(obj),
            index = $(self.selDroppable).index($activeDroppable),
            dPosX = Math.round(pos[0] / self.scale[index] * self.scaleX[index]).toFixed(0),
            dPosY = Math.round(pos[1] / self.scale[index] * self.scaleY[index]).toFixed(0),
            dPosW = Math.round(pos[3] * self.scaleX[index]).toFixed(0),
            dPosH = Math.round(pos[2] * self.scaleY[index]).toFixed(0);

        // 保存窗口信息到本地
        winInfo = {
            id: 0,
            level: 0,
            src_ch: 0,
            src_hstart: 0,
            src_vstart: 0,
            src_hsize: 0,
            src_vsize: 0,
            title: '',
            color: $pep.css('background-color'),
            win_x0: pos[0] / self.scale[index],
            win_y0: pos[1] / self.scale[index],
            win_width: pos[3],
            win_height: pos[2]
        };
        // 将窗口信息存到控件上
        $pep.attr(self.attrWinInfo, pos)
        // 获取窗口静态信息
        winInfo = self.getStaticWinInfo($pep, $activeDroppable, winInfo);


        var wallId = index;
        // 保存窗口信息到本地
        //self.insertOrUpdateWinInfo(wallId, winInfo);

        // 控件显示记录
        var info = $.i18n.prop('index.msg.win_index') + (parseInt(winInfo.id)+1) +'<br>'+
            $.i18n.prop('index.msg.win_zindex') + (parseInt(winInfo.level)+1) + '<br>'+
            $.i18n.prop('index.msg.win_pos') + '(' + dPosX + ',' + dPosY + ')' + '<br>'+
            $.i18n.prop('index.msg.win_size') + '(' + dPosW + ',' + dPosH + ')';

        $pep.find('.content').html(info);

        //TODO 发送移动窗口指令
        //<move,Wall_ID,Window_ID,Src_Ch,src_hstart,src_vstart,src_hsize,src_vsize,win_x0,win_y0,win_width,win_height>
        var cmd = '<move,'+
            wallId+','+
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
        self.cmd(cmd, true, function(data){

            // 保存窗口信息到本地
            self.insertOrUpdateWinInfo(wallId, winInfo);
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
        index = $(self.selDroppable).index($parent),

        pTop = $parent.position().top,
        pLeft = $parent.position().left,
        pHeight = $parent.height(),
        pWidth = $parent.width(),

        oTop = $el.position().top - pTop,
        oLeft = $el.position().left - pLeft,
    //oHeight = $el.outerHeight(),
    //oWidth = $el.outerWidth(),
        pos = $el.attr(self.attrWinInfo).split(','),
    //oTop = pos[1],
    //oLeft = pos[0],
        oHeight = pos[2],
        oWidth = pos[3],

        moveTop = oTop,moveLeft = oLeft;

    //console.log('p_pos', pTop, pLeft, pWidth, pHeight)
    //console.log('o_pos', oTop, oLeft, oWidth, oHeight)

    if(0 > oTop){
        moveTop = 0;
    }else if(pHeight+oHeight < oTop){
        moveTop = pHeight - oHeight;
    }
    if(0 > oLeft){
        moveLeft = 0;
    }else if(pWidth-oWidth < oLeft){
        moveLeft = pWidth - oWidth;
    }

    $el.animate({top: moveTop / self.scale[index], left: moveLeft / self.scale[index]}, 0);

    //将移动块约束在编辑区内 [top, right, bottom, left]
    obj.options.constrainTo = [pTop, pLeft+pWidth-oWidth, pTop+pHeight-oHeight, pLeft];
    //obj.options.constrainTo = [0, pWidth-oWidth, pHeight-oHeight, 0];
    //obj.options.constrainTo = self.selActiveDroppable;
    //console.log('约束区', obj.options.constrainTo)
    //计算滑块相对编辑区的位置
    //var fTop,fRight,fBottom,fLeft;
    //fTop = moveTop - pTop;
    //fLeft = moveLeft - pLeft;
    //fRight = pWidth - fLeft - oWidth;
    //fBottom = pHeight - fTop - oHeight;

    //var pis = [fLeft.toFixed(2), fTop.toFixed(2), oHeight.toFixed(2), oWidth.toFixed(2)];//x y h w
    return [oLeft, oTop, oHeight, oWidth];
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
    var self = this;
    //$droppable.pep({
    //});

    $(self.selDroppable).each(function(){
        self.scale.push(1)
    });

    $('.sky-btn.dropdown').off(self.evClick).on(self.evClick,'li', function(){
        var $this = $(this),
            val = $this.find('a').html(),
            $activeDroppable = $(self.selActiveDroppable),
            index = $(self.selDroppable).index($activeDroppable),
            scale = 1;

        $this.parent().siblings('a.dropdown-toggle').html(val+' <span class="caret"></span>');
        scale = parseInt(val)*0.01;

        self.scale[index] = scale;//全局赋值

        $activeDroppable.parent().css({
            'transform': 'scale(' + scale + ')',
            'transform-origin': scale > 1 ? '0 0 0' : 'center'
        });

        $activeDroppable.find('.pep').each(function(){
            var $this = $(this),
                $pep = $this.data('plugin_pep');
            $pep.setScale(scale);
            //$pep.setMultiplier(scale);
        });

    });
    //  鼠标滑轮缩放
    self.mouseWheelScale();
}
/**
 * 滑动鼠标放大缩小滑块
 */
SkyApp.prototype.mouseWheelScale = function() {
    var self = this,
        i = 1,
        scale = 1,
        $droppable = $(self.selDroppable);

    $droppable.on("mousewheel", function (event, delta) {

        i += delta * 0.1;

        if(i < 0.5) {
            i = 0.6;
            return false;
        }
        if(i > 2) {
            i = 1.9;
            return false;
        }

        var $thisDroppable = $(this),
            index = $droppable.index($thisDroppable);

        scale = Math.abs(i);

        self.scale[index] = scale;//全局赋值

        $(self.selActiveWall).find('.sky-btn.dropdown a.dropdown-toggle').html( Math.round(scale*100).toFixed(0) +'% <span class="caret"></span>');

        $thisDroppable.parent().css({
            'transform': 'scale(' + scale + ')',
            'transform-origin': scale > 1 ? '0 0 0' : 'center'
        })

        $thisDroppable.find('.pep').each(function(){
            var $this = $(this),
                $pep = $this.data('plugin_pep'),
                constrainTo = $pep.options.constrainTo;
            $pep.setScale(scale);
            //$pep.setMultiplier(scale);
            //$pep.options.constrainTo = [constrainTo[0]/scale, constrainTo[1]/scale, constrainTo[2]/scale, constrainTo[3]/scale];
        });
        return false;
    });
}

/**
 * 向服务器发送指令
 * @param param string 指令参数 <cmd, param1, param2, ...>
 * @param async boolean
 * @param success function 成功回调函数
 * @param fail function 失败回调函数
 */
SkyApp.prototype.cmd = function(param, async, success, fail){
    var self = this,
        data = 'cmd=' + param,
        authority, sessionId;

    if(self.offline){
        success('offline');
        return false;
    }

    if(self.settings.commType === '0'){// 串口通信
        data += '&com=' + self.settings.commInfo[0].com_port + '&baudrate=' + self.settings.commInfo[0].com_baud_rate
    }else if(self.settings.commType === '1'){// 网络通信
        data += '&tcp=y&ip=' + self.settings.commInfo[1].ip + '&port=' + self.settings.commInfo[1].port
    }

    authority = sessionStorage.authority ? JSON.parse(sessionStorage.authority) :
        ($.cookie('authority') ? $.cookie('authority') : false);
    if(authority){
        sessionId = authority.sessionId;
        data += '&sessionid=' + sessionId;
    }

    $.ajax({
        url: self.serverUrl,
        data: data,
        type: 'GET',
        async: async ? async : false,// 默认同步执行
        //dataType:"JSONP",
        //crossDomain: true,
        contentType: 'text/html;charset=UTF-8',
        success: function(data){
            if(self.settings.software.logTip)
                self.log(data);
            console.log(data);
            if(success)
                success(data);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown){
            //if(fail) {
            //    fail(XMLHttpRequest, textStatus, errorThrown);
            //    return false;
            //}
            console.log(XMLHttpRequest)
            console.log(textStatus)
            console.log(errorThrown)
            //self.log(XMLHttpRequest.status, 'error');
            //self.log(XMLHttpRequest.readyState, 'error');
            //self.log(textStatus, 'error');
            if(fail)
                fail(XMLHttpRequest, textStatus, errorThrown);
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
 * 将编辑区宽高比置为设定的分辨率
 */
SkyApp.prototype.requestResolution = function(){

    var self = this,
        $placeholder = $('#sky-wrapper .right .placeholder'),
        oW, oH, pWidth, pHeight, margin,
        spliceSettings, splice, phyRow, phyCol, resW, resH, tW, tH, resolution = [];

    pWidth = $placeholder.parent().innerWidth();
    pHeight = $placeholder.parent().innerHeight();

    self.scaleX = [];
    self.scaleY = [];

    spliceSettings = self.settings.splice;

    for(var i = 0; i < spliceSettings.length; i++){

        if(self.settings.screenEnable[i]){
            splice = spliceSettings[i];

            phyRow = splice.phyRow;
            phyCol = splice.phyCol;
            resW = self.settings.resDef[i].actHSize;
            resH = self.settings.resDef[i].actVSize;

            tW = phyCol * resW;
            tH = phyRow * resH;

            if(pWidth/pHeight >= tW/tH){

                oH = pHeight - 20;
                oW = oH * tW/tH;
                $placeholder.eq(i).css({
                    'margin': '10px auto',
                    'width': oW,
                    'height': oH,
                    'left': 'calc((100% - '+oW+'px)/2)'
                })
            }else{

                oW = pWidth - 20;
                oH = oW * tH/tW;
                margin = (pHeight - oH)/2;
                $placeholder.eq(i).css({
                    'margin': margin + 'px auto',
                    'width': oW,
                    'height': oH,
                    'left': 'calc((100% - '+oW+'px)/2)'
                })
            }

            // 计算编辑区尺寸比例
            self.scaleX.push(resW * phyCol / oW);
            self.scaleY.push(resH * phyRow / oH);

            resolution.push({
                w: oW,
                h: oH
            });
        }
    }

    return resolution;
}

///**
// * 将编辑区宽高比置为设定的分辨率
// */
//SkyApp.prototype.requestResolution = function(){
//
//    var self = this,
//        $placeholder = $('#sky-wrapper .right .placeholder'),
//        oW, oH, pWidth, pHeight, margin;
//
//    pWidth = $placeholder.parent().innerWidth();
//    pHeight = $placeholder.parent().innerHeight();
//
//    if(pWidth/pHeight >= 16/9){
//
//        oH = pHeight - 20;
//        oW = oH*16/9;
//        $placeholder.css({
//            'margin': '10px auto',
//            'width': oW,
//            'height': oH,
//            'left': 'calc((100% - '+oW+'px)/2)'
//        })
//    }else{
//
//        oW = pWidth - 20;
//        oH = oW*9/16;
//        margin = (pHeight - oH)/2;
//        $placeholder.css({
//            'margin': margin + 'px auto',
//            'width': oW,
//            'height': oH,
//            'left': 'calc((100% - '+oW+'px)/2)'
//        })
//    }
//
//    //oW = $element.width();
//    //oH = $element.height();
//
//    // 计算编辑区尺寸比例
//    $placeholder.find('.droppable').each(function(){
//        var $this = $(this),
//            grid = $this.attr(self.attrGrid).split('_'),
//            gridX = grid[0],
//            gridY = grid[1];
//
//        self.scaleX.push(1920 * gridX / oW);
//        self.scaleY.push(1080 * gridY / oH);
//    });
//
//    return {
//        w: oW,
//        h: oH
//    }
//}

/**
 * 鼠标绘制窗口
 */
SkyApp.prototype.handleMouseDraw = function(){
    var self = this,
        $droppable = $(self.selDroppable),
    //$canvas = $droppable.find('canvas'),
        winInfo = {};

    // startX, startY 为鼠标点击时初始坐标
    var startX, startY, dX, dY;

    document.oncontextmenu=new Function("event.returnValue=false;");
    document.onselectstart=new Function("event.returnValue=false;");

    // 鼠标按下
    $droppable.on(self.evStar, function(e) {

        if(!self.enableGesture){
            return;
        }else{
            e.stopPropagation();
            e.preventDefault();
        }

        if(isTouch(e)){
            e.pageX = e.originalEvent.touches[0].pageX;
            e.pageY = e.originalEvent.touches[0].pageY;
        }else if(e.button !== 0 || e.target.className === "content"){
            return false;
        }
        startX = e.pageX;
        startY = e.pageY;

        var $this = $(this),
            oTop = $this.offset().top,
            oLeft = $this.offset().left,
            index = $droppable.index($this);

        // 在页面创建 box
        var active_box = document.createElement("div");
        active_box.id = "active-box";
        active_box.className = "draw-box";
        active_box.style.top = (startY - oTop)/self.scale[index] + 'px';
        active_box.style.left = (startX - oLeft)/self.scale[index] + 'px';
        $this.append(active_box);

    });

    // 鼠标移动
    $droppable.on(self.evMove, function(e) {

        //if(self.enableGesture) e.preventDefault();

        // 更新 box 尺寸
        var $this = $(this),
            $active_box = $('#active-box'),
            index = $droppable.index($this);

        if(isTouch(e)){
            e.pageX = e.originalEvent.touches[0].pageX;
            e.pageY = e.originalEvent.touches[0].pageY;
        }

        if(typeof $active_box !== 'undefined') {
            $active_box.width((e.pageX - startX)/self.scale[index]);
            $active_box.height((e.pageY - startY)/self.scale[index]);
        }

        var pTop = $this.offset().top,
            pLeft = $this.offset().left;

        dX = (e.pageX - pLeft)/self.scale[index];
        dY = (e.pageY - pTop)/self.scale[index];

        $(self.selWall).eq(index).find('.mouse-pos').html('x:'+ Math.round(dX*self.scaleX[index]) +',y:'+ Math.round(dY*self.scaleY[index]));
    });

    // 鼠标抬起
    $droppable.on(self.evEnd, function(e) {

        var $this = $(this),
            $active_box = $('#active-box'),
            index = $droppable.index($this);

        if($active_box.size() !== 0) {
            $active_box.removeAttr("id");
            if($active_box.width() > 50 && $active_box.height() > 30) {

                var $this = $(this),
                    pTop = $this.offset().top,
                    pLeft = $this.offset().left;

                dX = (startX - pLeft)/self.scale[index];
                dY = (startY - pTop)/self.scale[index];

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

                self.handleInitWindow($this, winInfo, self.settings.software.logicFill, true, true);
            }
            $active_box.remove();
        }


    });

    // 鼠标离开
    $droppable.on(self.evOut, function(e) {

        var $this = $(this),
            index = $droppable.index($this);

        $(self.selWall).eq(index).find('.mouse-pos').html('x:'+ 0 +',y:'+ 0);
    });
}

/**
 * 查询窗口信息指令
 * @param win number 获取指定屏幕墙的窗口信息，下标从0开始
 */
SkyApp.prototype.handleSynchronizeWall = function (win){
    var self = this,
        $droppable = $(self.selDroppable).eq(win);

    self.log($.i18n.prop('index.msg.synchronizing'))

    //self.cmd('<winf,'+win+'>', function(data){
    //
    //},function(XMLHttpRequest, textStatus, errorThrown){
    //
    //});

    var demo = '<The valid window ID is : id levelnum Src_Ch src_hstart src_vstart src_hsize src_vsize win_x0 win_y0 win_width win_height\r\n'+
        '0,1,2,0,0,0,0,0,0,1920,1080\r\n'+
        '1,2,3,0,0,0,0,300,200,480,270\r\n'+
        '2,3,2,0,0,0,0,200,200,1920,1080\r\n'+
        '3,4,3,0,0,0,0,700,600,480,270\r\n'+
        '4,5,2,0,0,0,0,960,1440,1920,1080\r\n'+
        '5,6,3,0,0,0,0,300,200,480,270\r\n'+
        '7,6,3,0,0,0,0,400,200,480,700\r\n'+
        '>';

    var resultArr = demo.split('\r\n'),
        winInfo = {},
        winInfoArr = [];

    // 清除现有窗口
    //$droppable.find('.pep').remove();
    self.handleCloseWinAll($(self.selActiveDroppable).find('.pep'), true ,false)

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
            title: $('.input ['+self.attrSignalId+'='+src_ch+'] a').html(),
            win_x0: win_x0/self.scaleX[win],
            win_y0: win_y0/self.scaleY[win],
            win_width: win_width/self.scaleX[win],
            win_height: win_height/self.scaleY[win]
        };
        // 向指定屏幕墙添加窗口

        self.handleInitWindow($droppable, winInfo, false, true, true);
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
 * @param wallId
 * @param winInfo
 */
SkyApp.prototype.insertOrUpdateWinInfo = function(wallId, winInfo){
    var self = this,
        tbl = self.tblWinInfo + wallId,
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
 * @param wallId
 * @param winInfoArr
 */
SkyApp.prototype.setWinInfoBatch = function(wallId, winInfoArr){
    var self = this,
        tbl = self.tblWinInfo + wallId,
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
 * @param wallId
 * @param winID
 */
SkyApp.prototype.getWinInfoById = function(wallId, winID){

    var self = this,
        tbl = self.tblWinInfo + wallId,
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
 * @param wallId
 */
SkyApp.prototype.getWinInfoByWallID = function (wallId){

    var self = this,
        tbl = self.tblWinInfo + wallId,
        resultHandle = self.getCache(tbl, true);
    if(resultHandle !== null){
        return resultHandle;
    }else{
        return null;
    }

}

/**
 * 通过ID删除一条记录
 * @param wallId
 * @param winID
 * @returns {boolean}
 */
SkyApp.prototype.delWinInfoById = function(wallId, winID){

    var self = this,
        tbl = self.tblWinInfo + wallId,
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
 * @param wallId
 */
SkyApp.prototype.delWinInfoByWallId = function(wallId){
    var self = this,
        tbl = self.tblWinInfo + wallId;

    self.delCache(tbl);
}
/**
 * 保存预设模式信息
 * @param wallId
 * @param sceneInfo
 */
SkyApp.prototype.insertOrUpdateSceneInfo = function(wallId, sceneInfo){
    var self = this,
        tbl = self.tblSceneInfo + wallId,
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
 * @param wallId
 * @param id
 * @returns {*}
 */
SkyApp.prototype.getSceneInfoById = function(wallId, id){
    var self = this,
        tbl = self.tblSceneInfo + wallId,
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
 * @param wallId
 * @returns {*}
 */
SkyApp.prototype.getSceneInfoByWallId = function(wallId){
    var self = this,
        tbl = self.tblSceneInfo + wallId,
        resultHandle = self.getCache(tbl, true);
    if(resultHandle !== null){
        return resultHandle;
    }else{
        return null;
    }
}

/**
 * 根据屏幕墙ID删除本地预设模式
 * @param wallId
 */
SkyApp.prototype.delSceneByWallId = function(wallId){
    var self = this,
        tbl = self.tblSceneInfo + wallId;

    self.delCache(tbl);
}

/**
 * 根据id删除指定预设模式
 * @param wallId
 * @param sceneID
 * @returns {*}
 */
SkyApp.prototype.delSceneById = function(wallId, sceneID){
    var self = this,
        tbl = self.tblSceneInfo + wallId,
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
 * 同步屏幕设置
 * @param wallId
 */
SkyApp.prototype.handleSynScreeSettings = function(wallId){
    var self = this,
        wallinf = {}, sset = {};

    //TODO 同步拼接设置
    // <wallinf,Wall_ID>
    var cmd = '<wallinf,'+
        wallId+
        '>';
    self.cmd(cmd, false, function(data){

        if(data && data !== 'offline'){

            if(data.split('\r\n').length < 2) return false;

            var arr = data.split('\r\n'),
                info = [];
            for(var i = 1; i < arr.length - 1; i++){

                var temp = arr[i].split(' ');
                info.push(temp[temp.length-1]);

            }

            console.log(info)

            wallinf = self.settings.splice[wallId];

            wallinf.phyRow = info[0];
            wallinf.phyCol = info[1];
            wallinf.screenWidth = info[2];
            wallinf.screenHeight = info[3];
            wallinf.frameLeft = info[4];
            wallinf.frameRight = info[5];
            wallinf.frameTop = info[6];
            wallinf.frameBottom = info[7];

            self.settings.splice[wallId] = wallinf;

            sset = self.settings.resDef[wallId];

            sset.hFront = info[8];
            sset.vFront = info[9];
            sset.actHSize = info[10];
            sset.actVSize = info[11];
            sset.hTotal = info[12];
            sset.vTotal = info[13];
            sset.hsWidth = info[14];
            sset.vsWidth = info[15];
            sset.hSyncPol = info[16];
            sset.vSyncPol = info[17];
            sset.fps = info[18];

            self.settings.resDef[wallId] = sset;
        }else if(data === 'offline'){

            wallinf = self.settings.splice[wallId];
        }


        self.setCache(self.tblSetting, self.settings, true);

        $(self.selDroppable).eq(wallId).attr(self.attrGrid, wallinf.phyCol+'_'+wallinf.phyRow+'_'+wallinf.logicCol+'_'+wallinf.logicRow)

    },function(){

    });
}

/**
 * 同步当前屏幕墙上的信息
 * @param wallId
 * @returns {boolean}
 */
SkyApp.prototype.handleSynWall = function (wallId){
    var self = this,
        $activeDroppable = $(self.selActiveDroppable),
        resultHandle,
        winInfo;

    //if($activeDroppable.find('.pep').size() > 0){
    //    return false;
    //}

    //TODO 同步窗口信息指令
    // <winf,Wall_ID>
    var cmd = '<winf,'+
        wallId+
        '>';
    self.cmd(cmd, false, function(data){

        if(data && data !== 'offline'){

            if(data.split('\r\n').length < 2) return false;

            //清除窗口
            self.handleCloseWinAll($activeDroppable.find('.pep'), true, false);

            var arr = data.split('\r\n');
            for(var i = 1; i < arr.length - 1; i++){

                var info = arr[i].split(',');
                winInfo = {
                    id: parseInt(info[0]),
                    level: parseInt(info[1]),
                    src_ch: info[2],
                    src_hstart: parseInt(info[3]),
                    src_vstart: parseInt(info[4]),
                    src_hsize: parseInt(info[5]),
                    src_vsize: parseInt(info[6]),
                    title: $(self.selActiveInputList).find('.item .drag['+self.attrSignalId+'='+info[2]+'] a').html(),
                    color: false,
                    win_x0: info[7] / self.scaleX[wallId],
                    win_y0: info[8] / self.scaleY[wallId],
                    win_width: info[9] / self.scaleX[wallId],
                    win_height: info[10] / self.scaleY[wallId]
                }

                // 向指定屏幕墙添加窗口并缓存
                self.handleInitWindow($activeDroppable, winInfo, false, true, false);
            }
        }else if(data === 'offline'){
            //清除窗口
            self.handleCloseWinAll($activeDroppable.find('.pep'), false, false);

            resultHandle = self.getWinInfoByWallID(wallId);

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
                    self.handleInitWindow($activeDroppable, winInfo, false, false);
                }
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
        $popMenu = $('#scene-pop-menu'),
        $sceneItem = $(self.selSceneList).find('li.item');

    // 绑定菜单事件
    self.handleScenePopMenuAction($popMenu);

    // 长按或右键呼出菜单
    $sceneItem.on(self.evRightClick, function(ev){
        ev.preventDefault();

        var $this = $(this),
            $activeList = $(self.selActiveSceneList),
            pos = {x: ev.pageX, y: ev.pageY};

        $activeList.find('li.item').removeClass('active')
        $this.addClass('active')

        if(pos){
            var $ul = $popMenu.find('ul'),
                oH = $ul.height(),
                dH = $(document).height(),
                dX = pos.x, dY = pos.y;
            if(oH + pos.y > dH){
                dY = dH - oH;
            }
            $ul.css({
                left: dX,
                top: dY
            });
        }
        $popMenu.fadeIn(300);
        $popMenu.on(self.evClick,function(){
            $(this).fadeOut(300);
        })
    });

    // 移动设备长呼出菜单
    $sceneItem.hammer().on(self.evPress, function(ev){
        ev.preventDefault();
        ev.stopPropagation();

        if (!navigator.userAgent.match(/mobile/i)) {
            return false;
        }

        var $this = $(this),
            $activeList = $(self.selActiveSceneList);

        $activeList.find('li.item').removeClass('active')
        $this.addClass('active')

        $popMenu.fadeIn(300);
        $popMenu.on(self.evClick,function(){
            $(this).fadeOut(300);
        })
    });
    //// 双击保存当前屏幕预设模式
    //$sceneItem.hammer().on(self.evDbTap, function(){
    //
    //    var $this = $(this),
    //        $activeList = $(self.selActiveSceneList);
    //
    //    $activeList.find('li.item').removeClass('active')
    //    $this.addClass('active')
    //
    //    self.handleSaveScene($this);
    //});

    // 双击打开当前屏幕预设模式
    $sceneItem.hammer().on(self.evDbTap, function(){

        var $this = $(this),
            $activeList = $(self.selActiveSceneList);

        $activeList.find('li.item').removeClass('active')
        $this.addClass('active')

        self.handleLoadScene($this);
    });

}

/**
 * 预设模式编辑菜单事件
 */
SkyApp.prototype.handleScenePopMenuAction = function($popMenu){
    var self = this;

    $popMenu.off(self.evClick, 'a').on(self.evClick, 'a',function(){
        var $this = $(this);

        var $activeItem = $(self.selActiveSceneList).find('.item.active');

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
                    btn: [$.i18n.prop('index.btn.cancel'),$.i18n.prop('index.btn.ok')],
                    onSuccess:function(){
                        self.handleDelScene($activeItem)
                    }
                });
                break;
            case 'sce-clean':
                $.confirm({
                    title: $.i18n.prop('index.modal.title.prompt'),
                    message: $.i18n.prop('index.modal.msg.del.all'),
                    btn: [$.i18n.prop('index.btn.cancel'),$.i18n.prop('index.btn.ok')],
                    onSuccess:function(){
                        self.handleDelSceneAll($(self.selActiveSceneList).find('li.item'))
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
        $activeList = $(self.selActiveSceneList).find('li.item'),
        index = $activeList.index($item) + 1,
        $droppable,wallId,
        winInfo, sceneInfo, screenshot;

    $droppable = $(self.selActiveDroppable);
    wallId = $(self.selDroppable).index($droppable);

    //TODO 新建情景模式指令
    //<creat,Wall_ID,Scene_Mode>
    //var cmd = '<creat,' +
    //    wallId +','+
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
        wallId +','+
        index +
        '>';
    self.cmd(cmd, true, function(data){

        // 获取编辑区中的窗口信息
        winInfo = self.getWinInfoByWallID(wallId);

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
                self.insertOrUpdateSceneInfo(wallId, sceneInfo)
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
        $activeList = $(self.selActiveSceneList).find('li.item'),
        index = $activeList.index($item) + 1,
        $activeDroppable,wallId,
        winInfo, sceneInfo;

    $activeDroppable = $(self.selActiveDroppable);
    wallId = $(self.selDroppable).index($activeDroppable);

    //TODO 调用情景模式指令
    //<call,Wall_ID,Scene_id>
    var cmd = '<call,'+
        wallId+','+
        index+
        '>';
    self.cmd(cmd, true, function(data){

        // 清除现有窗口
        self.handleCloseWinAll($activeDroppable.find('.pep'), true, false);
        // 获取编辑区中的窗口信息
        sceneInfo = self.getSceneInfoById(wallId, index);

        if(sceneInfo){
            winInfo = sceneInfo.winInfo;

            for (var i = 0; i < winInfo.length; i++){

                //winInfo[i].win_x0 = winInfo[i].win_x0;
                //winInfo[i].win_y0 = winInfo[i].win_y0;
                //winInfo[i].win_width = winInfo[i].win_width;
                //winInfo[i].win_height = winInfo[i].win_height;
                // 向指定屏幕墙添加窗口
                self.handleInitWindow($activeDroppable, winInfo[i], false, true, false);
            }
        }else{
            //TODO 如果本地没有缓存要向服务器读取，但是服务器没有保存截图，这是个问题！！！
        }
    },function(){

    });



}

/**
 * 删除指定预设模式
 * @param $item
 */
SkyApp.prototype.handleDelScene = function($item){

    var self = this,
        $activeList = $(self.selActiveSceneList).find('li.item'),
        index = $activeList.index($item) + 1,
        $droppable,wallId;

    $droppable = $(self.selActiveDroppable);
    wallId = $(self.selDroppable).index($droppable);

    //todo 发送删除预设模式指令
    //<delete,Wall_ID,Scene_id>
    var cmd = '<delete,'+
        wallId+','+
        index+
        '>';
    self.cmd(cmd, true, function(data){

        $item.find('img').css({'background-image':''})
        $item.removeClass('active');

        // 清除现有窗口
        //self.handleCloseWin($droppable.find('.pep'), true , false)

        // 清除本地数据
        self.delSceneById(wallId, index);
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
        $droppable, wallId, sceneList;

    $droppable = $(self.selActiveDroppable);
    wallId = $(self.selDroppable).index($droppable);


    $item.find('img').css({'background-image':''})
    $item.removeClass('active');

    // 清除现有窗口
    //self.handleCloseWin($droppable.find('.pep'), true)

    //TODO 查询已存在的预设模式
    // <readsc,Wall_ID>
    var cmd = '<readsc,'+
        wallId+
        '>';
    self.cmd(cmd, true, function(data) {

        if(data && data !== 'offline'){

            if(data.split('\r\n').length < 2) return false;

            sceneList = data;
        }else if(data === 'offline'){
            sceneList = '< The valid Scene ID is :\r\n' +
                '1,2,3,4,5,6,7,8,9\r\n' +
                '>';
        }else {
            return false;
        }

        var resultArr = sceneList.split('\r\n');

        for (var i = 1; i < resultArr.length - 1; i++) {
            var arr = resultArr[i].split(',')
            for (var j = 0; j < arr.length; j++){

                //TODO 发送删除预设模式指令
                //<delete,Wall_ID,Scene_id>
                var cmd = '<delete,'+
                    wallId+','+
                    arr[j]+
                    '>';
                self.cmd(cmd, true, function(data){

                    // 清除本地数据
                    self.delSceneByWallId(wallId);
                },function(){

                });
            }
        }
    }, function(){})
}
