/**
 * author: Junlin He
 */
;(function ( $, window, undefined ) {

    var pluginName = 'dragMove',
        defaults = {
            droppable: false,
            droppableActiveClass: 'dm-dpa',
            startPos: {
                left: null,
                top: null
            },
            scale: 1,//缩放比例
            constrainTo: 'parent', //默认约束到parent
            elementsWithInteraction: 'input', //指定部分不会触发拖动
            dragIcon: '.dragIcon',
            ignoreRightClick: false,
            minSize: {'w':100,'h':100},
            maxSize: null,
            selectFloat: false,
            onMoveStart: null,
            onMove: null,
            onMoveEnd: null,
            onResizeStart: null,
            onResize: null,
            onResizeEnd: null
        };

    function DragMove(el, options){

        var self = this;
        self.el  = el;
        self.$el = $(el);

        self.disabled = false;
        self.activeDropRegions = [];

        self.evClick = 'click';
        self.evRightClick = 'contextmenu';
        self.evMove        = "MSPointerMove pointermove touchmove mousemove";
        self.evStart       = "MSPointerDown pointerdown touchstart mousedown";
        self.evStop        = "MSPointerUp pointerup touchend mouseup";
        self.evTap = 'tap';
        self.evPanStart = 'panstart';
        self.evPanMove = 'panmove';
        self.evPanEnd = 'panend';
        self.evPanUp = 'panup';
        self.evPanDown = 'pandown';
        self.evPinchStart = 'pinchstart';
        self.evPinchMove = 'pinchmove';
        self.evPinchIn = 'pinchin';
        self.evPinchOut = 'pinchout';
        self.evPinchEnd = 'pinchend';

        self.constraint = [];
        self.ignorePropagation = false; //阻止冒泡

        self.options = $.extend(defaults, options);

        self.ticking = false;//动画垫片启用标识
        self.elLeft = 0;//供垫片使用的元素样式
        self.elTop = 0;
        self.elWidth = 0;
        self.elHeight = 0;
        self.elScale = 1;
        self.elDeltaX = 0
        self.elDeltaY = 0;
        self.elDeltaW = 0;
        self.elDeltaH = 0;

        // init
        self.placeObject();




        // 拖拽控制窗口
        self.handleMove();
        // 拖拽控制窗口大小
        self.handleResize();
        // 手指控制窗口大小
        self.handlePinch();

        // 处理过滤元素不触发拖动
        self.handleInteraction();
        // 屏蔽右键
        self.handleRightClick();

    }

    /**
     * 初始化控件位置、大小
     */
    DragMove.prototype.placeObject = function(){

        var self = this;

        self.offset = {};

        if (typeof self.options.startPos.left === "number")
            self.offset.left = self.options.startPos.left;

        if (typeof self.options.startPos.top === "number")
            self.offset.top = self.options.startPos.top;

        self.$el.css({
            position:   'absolute',
            top:        self.offset.top,
            left:       self.offset.left,
            transition: 'all 300ms cubic-bezier(0.190, 1.000, 0.220, 1.000)'
        }).addClass(pluginName);
    }

    /**
     * 处理过滤元素不触发拖动
     */
    DragMove.prototype.handleInteraction = function(){

        var self = this;
        self.$el.find(self.options.elementsWithInteraction+','+self.options.dragIcon).on(self.evPanStart,function() {
            self.ignorePropagation = true;
        });
    }


    /**
     * 屏蔽右键事件
     */
    DragMove.prototype.handleRightClick = function(){

        var self = this;

        self.$el.on(self.evRightClick, function(e){

            if(self.options.ignoreRightClick && e.which === 3) return;
        });
    }

    /**
     * 控件拖动
     */
    DragMove.prototype.handleMove = function(){

        var self = this,
            $parent = self.$el.parent(),
            startX,
            startY,
            pLeft, pTop, pWidth, pHeight,
            oLeft, oTop, oWidth, oHeight,
            dX, dY;

        //// 初始化hammer方法一（此方法为元素绑定hammer事件后直接使用jquery监听事件即可）
        //new Hammer(self.$el.get(0),{
        //    recognizers: [
        //        [Hammer.Pinch,{ direction: Hammer.DIRECTION_ALL }],
        //        [Hammer.Pan,{ direction: Hammer.DIRECTION_ALL }],
        //        [Hammer.Tap]
        //    ]
        //});
        //
        //new Hammer(self.$el.find('.content').get(0),{
        //    recognizers: [
        //        [Hammer.Tap]
        //    ]
        //});


        //初始化hammer方法二（此方法要是使用hammer对象监听事件）
        var mc = propagating(new Hammer.Manager(self.$el.get(0), {}));

        mc.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }) );
        //mc.add( new Hammer.Tap({ event: 'quadrupletap', taps: n }) );//n次点击
        mc.add( new Hammer.Tap());
        mc.add( new Hammer.Pinch({ direction: Hammer.DIRECTION_ALL }) );

        var mcp = propagating(new Hammer.Manager($('.draggable').get(0), {}));
        mcp.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }) );

        $('.draggable').on(self.evPanStart, function(e) {
            alert(1);
        });

        self.$el.on(self.evPanStart, function(e) {

            console.log(e)
            e.preventDefault();
            myStopPropagation(e);

            alert(0)
            if(self.disabled) return;
            if(self.ignorePropagation) return;

            var $this = $(this);

            if(self.options.selectFloat){
                self.$el.siblings().removeClass('active');
                self.$el.addClass('active');
            }
            self.$el.addClass('dm-active');

            if(typeof self.options.constrainTo === 'string'){

                oLeft = $this.position().left;
                oTop = $this.position().top;
                oWidth = $this.outerWidth();
                oHeight = $this.outerHeight();

                if(self.options.constrainTo === 'parent'){
                    pLeft = $parent.position().left;
                    pTop = $parent.position().top;
                    pWidth = $parent.innerWidth();
                    pHeight = $parent.innerHeight();

                    self.constraint = [0, pWidth-oWidth, pHeight-oHeight, 0];
                }else{
                    //TODO 存在bug，当此元素范围超过parent，可移动返回会出问题
                    var $targetEl = $(self.options.constrainTo);
                    pLeft = $targetEl.position().left;
                    pTop = $targetEl.position().top;
                    pWidth = $targetEl.innerWidth() * self.options.scale;
                    pHeight = $targetEl.innerHeight() * self.options.scale;
                }

            }else if($.isArray(self.options.constrainTo)){

                self.constraint = self.options.constrainTo;
            }

            console.log(oLeft, oTop, oWidth, oHeight)
            console.log(pLeft, pTop, pWidth, pHeight)

            startX = oLeft ;
            startY = oTop ;

            self.elLeft = startX;
            self.elTop = startY;
            self.elWidth = oWidth;
            self.elHeight = oHeight;
            self.elDeltaW = oWidth;
            self.elDeltaH = oHeight;
            // 回调
            if(self.options.onMoveStart) self.options.onMoveStart.call(self, e, self);

        }).on(self.evPanMove, function(e) {
            e.preventDefault();
            myStopPropagation(e);

            if(self.disabled) return;
            if(self.ignorePropagation) return;

            dX = (startX + e.gesture.deltaX) / self.options.scale;
            dY = (startY + e.gesture.deltaY) / self.options.scale;

            console.log(dX, dY);

            var hash = self.handleConstraint(dX, dY);

            self.elDeltaX = hash.x;
            self.elDeltaY = hash.y;

            self.requestElementUpdate();

            // Calculate our drop regions
            if ( self.options.droppable ) {
                self.calculateActiveDropRegions();
            }

            if(self.options.onMove) self.options.onMove.call(self, e, self);
        }).on(self.evPanEnd, function(e) {

            e.preventDefault();
            myStopPropagation(e);
            self.ignorePropagation = false;

            self.$el.removeClass('dm-active');

            // Calculate our drop regions
            if ( self.options.droppable ) {
                self.calculateActiveDropRegions();
            }

            console.log('enEnd')
            if(self.disabled) return;

            if(self.options.onMoveEnd) self.options.onMoveEnd.call(self, e, self);
        });
    }

    /**
     * 控件移动范围限制
     * @param dX
     * @param dY
     * @returns {{x: *, y: *}}
     */
    DragMove.prototype.handleConstraint = function(dX, dY){

        var self = this,
            constraint = self.constraint;

        if($.isArray(constraint)){
            if(dX > constraint[1]){
                dX = constraint[1];
            }else if(dX < constraint[3]){
                dX = constraint[3];
            }

            if(dY > constraint[2]){
                dY = constraint[2];
            }else if(dY < constraint[0]){
                dY = constraint[0];
            }
        }

        return {x: dX, y: dY};
    }

    /**
     * 控件拖拽缩放
     */
    DragMove.prototype.handleResize = function(){

        var self = this;

        self.$el.find(self.options.dragIcon).hammer({ recognizers: [
            [Hammer.Pan,{ direction: Hammer.DIRECTION_ALL }]
        ] }).on(self.evPanStart, function(e){
            e.preventDefault();
            myStopPropagation(e);

            if(self.disabled) return;

            var $el = self.$el;
            self.dragPosix = {
                '$dragIcon': $(this),
                'w': $el.outerWidth(),
                'h': $el.outerHeight(),
                'x': e.gesture.pointers[0].pageX,
                'y': e.gesture.pointers[0].pageY
            };

            // 回调
            if(self.options.onResizeStart) self.options.onResizeStart.call(self, e, self);
        }).on(self.evPanMove, function(e){
            e.preventDefault();
            myStopPropagation(e);

            if(self.disabled) return;

            var $drag = self.$el,
                curX = e.gesture.pointers[0].pageX,
                curY = e.gesture.pointers[0].pageY;

            // 获得鼠标移动阀值内的移动数值
            var hash = self.handleResizeMove(curX, curY);
            var $dragIcon = self.dragPosix.$dragIcon;

            if($dragIcon.hasClass('nw')){
                $drag.css({
                    'top': hash.curY,
                    'left': hash.curX,
                    'width': Math.max(self.options.minSize.w, (self.dragPosix.x - hash.curX)/self.options.scale  + self.dragPosix.w),
                    'height': Math.max(self.options.minSize.h, (self.dragPosix.y - hash.curY)/self.options.scale + self.dragPosix.h)
                });
            }else if($dragIcon.hasClass('n')){
                $drag.css({
                    'top': hash.curY,
                    'height': Math.max(self.options.minSize.h, (self.dragPosix.y - hash.curY)/self.options.scale + self.dragPosix.h)
                });
            }else if($dragIcon.hasClass('ne')){
                $drag.css({
                    'top': hash.curY,
                    'width': Math.max(self.options.minSize.w, (hash.curX - self.dragPosix.x)/self.options.scale + self.dragPosix.w),
                    'height': Math.max(self.options.minSize.h, (self.dragPosix.y - hash.curY)/self.options.scale + self.dragPosix.h)
                });
            }else if($dragIcon.hasClass('w')){
                $drag.css({
                    'left': hash.curX,
                    'width': Math.max(self.options.minSize.w, (self.dragPosix.x - hash.curX)/self.options.scale  + self.dragPosix.w)
                });
            }else if($dragIcon.hasClass('e')){
                $drag.css({
                    'width': Math.max(self.options.minSize.w, (hash.curX - self.dragPosix.x)/self.options.scale + self.dragPosix.w)
                });
            }else if($dragIcon.hasClass('sw')){
                $drag.css({
                    'left': hash.curX,
                    'width': Math.max(self.options.minSize.w, (self.dragPosix.x - hash.curX)/self.options.scale  + self.dragPosix.w),
                    'height': Math.max(self.options.minSize.h, (hash.curY - self.dragPosix.y)/self.options.scale + self.dragPosix.h)
                });
            }else if($dragIcon.hasClass('s')){
                $drag.css({
                    'height': Math.max(self.options.minSize.h, (hash.curY - self.dragPosix.y)/self.options.scale + self.dragPosix.h)
                });
            }else{
                $drag.css({
                    'width': Math.max(self.options.minSize.w, (hash.curX - self.dragPosix.x)/self.options.scale + self.dragPosix.w),
                    'height': Math.max(self.options.minSize.h, (hash.curY - self.dragPosix.y)/self.options.scale + self.dragPosix.h)
                });
            }

            // 回调
            if(self.options.onResize) self.options.onResize.call(self, e, self);
        }).on(self.evPanEnd, function(e){
            e.preventDefault();
            myStopPropagation(e);

            if(self.disabled) return;

            // 回调
            if(self.options.onResizeEnd) self.options.onResizeEnd.call(self, e, self);
        });

    }


    /**
     * 计算窗口大小阀值
     * @param curX
     * @param curY
     * @returns {{curX: boolean, curY: boolean}}
     */
    DragMove.prototype.handleResizeMove = function(curX, curY) {

        var self = this,
            hash = { curX: false, curY: false},
            pTop, pLeft, pHeight, pWidth;

        if ( $.isArray( self.options.constrainTo ) ) {
            var constrainTo = self.options.constrainTo;

            pTop = constrainTo[0];
            pLeft = constrainTo[3];
            pHeight = constrainTo[2];
            pWidth = constrainTo[1];
        } else if ( typeof self.options.constrainTo === 'string' ) {
            var constrainTo = self.options.constrainTo;

            if(constrainTo ==='window'){
                pTop = 0;
                pLeft = 0;
                pHeight = $(window).height();
                pWidth = $(window).width();
            }else if(constrainTo ==='parent'){
                var $parent = self.$el.parent();
                pTop = $parent.offset().top;
                pLeft = $parent.offset().left;
                pHeight = $parent.outerHeight();
                pWidth = $parent.outerWidth();
            }else{
                var $element = $(constrainTo);
                pTop = $element.offset().top;
                pLeft = $element.offset().left;
                pHeight = $element.outerHeight();
                pWidth = $element.outerWidth();
            }
        }

        if(self.options.maxSize !== null){
            if(curX >= pLeft+self.options.maxSize.w) curX = pLeft+self.options.maxSize.w;
            else if(curX <= pLeft+self.options.minsize.w) curX = pLeft+self.options.minsize.w;
            if(curY >= pTop+self.options.maxSize.h) curY = pTop+self.options.maxSize.h;
            else if(curY <= pTop+self.options.minsize.h) curY = pTop+self.options.minsize.h;
        }else{
            if(curX >= pLeft+pWidth) curX = pLeft+pWidth;
            else if(curX <= pLeft) curX = pLeft;
            if(curY >= pTop+pHeight) curY = pTop+pHeight;
            else if(curY <= pTop) curY = pTop;
        }
        hash.curX = curX;
        hash.curY = curY;
        return hash;
    }

    /**
     * 控件手势缩放
     */
    DragMove.prototype.handlePinch = function(){
        var self = this;

        self.$el.on(self.evPinchStart, function(e){

            if(self.disabled) return;

            // 回调
            if(self.options.onResizeStart) self.options.onResizeStart.call(self, e, self);
        }).on(self.evPinchMove, function(e){

            if(self.disabled) return;

            var scale = e.gesture.scale;
            $('.content').html(scale)

            var $this = $(this);

            $this.css({
                transform: 'scale('+scale+', '+scale+')'
            })

            self.elScale = scale;

            // 回调
            if(self.options.onResize) self.options.onResize.call(self, e, self);
        }).on(self.evPinchEnd, function(e){

            if(self.disabled) return;

            var $this = $(this);

            self.elDeltaX = $this.position().left;
            self.elDeltaY = $this.position().top;
            self.elDeltaW = $this.outerWidth() * self.elScale;
            self.elDeltaH = $this.outerHeight() * self.elScale;

            $this.css({
                transform: 'scale(1, 1)'
            })

            self.requestElementUpdate();

            // 回调
            if(self.options.onResizeEnd) self.options.onResizeEnd.call(self, e, self);
        });
    }

    /**
     * 更新css样式
     */
    DragMove.prototype.updateElementCss = function() {
        var self = this;

        self.$el.animate({
            left: self.elDeltaX,
            top: self.elDeltaY,
            width: self.elDeltaW,
            height: self.elDeltaH
        }, 0, 'easeOutQuad', {queue: false});
        self.ticking = false;
    }

    /**
     * 使用垫片播放动画
     */
    DragMove.prototype.requestElementUpdate = function() {
        var self = this;

        if(!self.ticking) {
            reqAnimationFrame(self.updateElementCss.bind(self));
            self.ticking = true;
        }
    }

    /**
     * 控制插件生效失效
     * @param on
     */
    DragMove.prototype.toggle = function(on) {
        if ( typeof(on) === "undefined"){
            this.disabled = !this.disabled;
        }
        else {
            this.disabled = !on;
        }

    };

    // calculateActiveDropRegions()
    //    sets parent droppables of this.
    DragMove.prototype.calculateActiveDropRegions = function() {
        var self = this;
        self.activeDropRegions.length = 0;

        $.each( $(this.options.droppable), function(idx, el){
            var $el = $(el);
            if ( self.isOverlapping($el, self.$el) ){
                $el.addClass(self.options.droppableActiveClass);
                self.activeDropRegions.push($el);
            } else {
                $el.removeClass(self.options.droppableActiveClass);
            }
        });

    };
    //  isOverlapping();
    //    returns true if element a over
    DragMove.prototype.isOverlapping = function($a,$b) {

        if ( this.options.overlapFunction ) {
            return this.options.overlapFunction($a,$b);
        }

        var rect1 = $a[0].getBoundingClientRect();
        var rect2 = $b[0].getBoundingClientRect();

        return !( rect1.right   < rect2.left  ||
        rect1.left    > rect2.right ||
        rect1.bottom  < rect2.top   ||
        rect1.top     > rect2.bottom  );
    };

    //  moveTo();
    //    move the object to an x and/or y value
    //    using jQuery's .css function -- this fxn uses the
    //    .css({top: "+=20", left: "-=30"}) syntax
    DragMove.prototype.moveTo = function(x,y, animate) {

        var self = this;
        if ( animate ) {
            self.$el.animate({ top: y, left: x }, 0, 'easeOutQuad', {queue: false});
        } else{
            self.$el.stop(true, false).css({ top: y , left: x });
        }
    };

    DragMove.prototype.setScale = function(val) {
        this.options.scale = val;
    };

    // 装载jquery插件
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                var obj = new DragMove( this, options );
                $.data(this, 'plugin_' + pluginName, obj);
                $.dragMove.dragMoves.push(obj);
            }
        });
    };

    // 控制插件生效、失效
    $.dragMove = {};
    $.dragMove.dragMoves = [];
    $.dragMove.toggleAll = function(on){
        $.each(this.dragMoves, function(index, obj){
            obj.toggle(on);
        });
    };

    $.dragMove.unbind = function($obj){
        var dragMove = $obj.data('plugin_' + pluginName);

        if ( typeof dragMove === 'undefined' )
            return;

        dragMove.toggle(false);
        $obj.removeData('plugin_' + pluginName);

    };

    //  *** Special Easings functions ***
    //    Used for JS easing fallback
    //    We can use any of these for a
    //    good intertia ease
    $.extend($.easing,
        {
            easeOutQuad: function (x, t, b, c, d) {
                return -c *(t/=d)*(t-2) + b;
            },
            easeOutCirc: function (x, t, b, c, d) {
                return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
            },
            easeOutExpo: function (x, t, b, c, d) {
                return (t===d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
            }
        });

    window.myStopPropagation = function(e){
        if (window.event) {
            event.cancelBubble = true;
        }else{
            e.stopPropagation();
        }
    };


    /**
     * Animation polyFill
     */
    var reqAnimationFrame = (function () {
        return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();
}(jQuery, window));