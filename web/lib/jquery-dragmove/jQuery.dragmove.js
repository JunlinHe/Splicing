(function($) {

    var pluginName = 'dragMove',
        defaults = {
            startPos: {
                left: null,
                top: null
            },
            scale: 1,//缩放比例
            constrainTo: 'parent', //默认约束到parent
            elementsWithInteraction: 'input', //指定部分不会触发拖动
            resizeIcon: '.resizeIcon',
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
        self.elLeft = 0; //供垫片使用的元素样式
        self.elTop = 0;
        self.elWidth = 0;
        self.elHeight = 0;

        var $parent = self.$el.parent(),
            startX,
            startY,
            pLeft, pTop, pWidth, pHeight,
            oLeft, oTop, oWidth, oHeight,
            dX, dY;


        // init
        self.placeObject();

        self.$el.find(self.options.elementsWithInteraction+','+self.options.resizeIcon).on(self.evPanStart,function() {
            self.ignorePropagation = true;
        });

        // 拖拽控制窗口大小
        self.handleResize();
        // 手指控制窗口大小
        self.handlePinch();

        // 初始化hammer方法一（此方法为元素绑定hammer事件后直接使用jquery监听事件即可）
        new Hammer(self.$el.get(0),{
            recognizers: [
                [Hammer.Pinch,{ direction: Hammer.DIRECTION_ALL,domEvents: true }],
                [Hammer.Pan,{ direction: Hammer.DIRECTION_ALL,domEvents: true }],
                [Hammer.Tap, {domEvents: true}]
            ]
        });

        new Hammer(self.$el.find('.content').get(0),{
            recognizers: [
                [Hammer.Tap, {domEvents: true}]
            ]
        });


        ////初始化hammer方法二（此方法要是使用hammer对象监听事件）
        //var mc = new Hammer.Manager(self.$el.get(0), {domEvents: true});
        //
        //mc.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }) );
        ////mc.add( new Hammer.Tap({ event: 'quadrupletap', taps: n }) );//n次点击
        //mc.add( new Hammer.Tap());
        //mc.add( new Hammer.Pinch({ direction: Hammer.DIRECTION_ALL }) );


        self.$el.on(self.evPanStart, function(e) {

            e.preventDefault();
            myStopPropagation(e);

            if(self.ignorePropagation) return;

            var $this = $(this);

            if(typeof self.options.constrainTo === 'string'){

                if(self.options.constrainTo === 'parent'){
                    pLeft = $parent.offset().left;
                    pTop = $parent.offset().top;
                    pWidth = $parent.innerWidth() * self.options.scale;
                    pHeight = $parent.innerHeight() * self.options.scale;
                }else{
                    var $targetEl = $(self.options.constrainTo);
                    pLeft = $targetEl.offset().left;
                    pTop = $targetEl.offset().top;
                    pWidth = $targetEl.innerWidth() * self.options.scale;
                    pHeight = $targetEl.innerHeight() * self.options.scale;
                }

                oLeft = $this.offset().left;
                oTop = $this.offset().top;
                oWidth = $this.outerWidth() * self.options.scale;
                oHeight = $this.outerHeight() * self.options.scale;

                self.constraint = [pTop, pLeft+pWidth-oWidth, pTop+pHeight-oHeight, pLeft];
            }else if($.isArray(self.options.constrainTo)){
                self.constraint = self.options.constrainTo;
            }

            startX = e.gesture.pointers[0].pageX - oLeft;
            startY = e.gesture.pointers[0].pageY - oTop;

            self.elWidth = oWidth;
            self.elHeight = oHeight;
            // 回调
            if(self.options.onMoveStart) self.options.onMoveStart.call(this, e, this);

        }).on(self.evPanMove, function(e) {
            e.preventDefault();
            myStopPropagation(e);

            if(self.ignorePropagation) return;

            dX = e.gesture.pointers[0].pageX - startX;
            dY = e.gesture.pointers[0].pageY - startY;

            var hash = self.handleConstraint(dX, dY);

            self.elLeft = hash.x;
            self.elTop = hash.y;

            self.requestElementUpdate();
            //self.$el.offset({
            //    left: hash.x,
            //    top: hash.y
            //});

            if(self.options.onMove) self.options.onMove.call(this, e, this);
        }).on(self.evPanEnd, function(e) {
            e.preventDefault();
            myStopPropagation(e);
            self.ignorePropagation = false;

            if(self.options.onMoveEnd) self.options.onMoveEnd.call(this, e, this);
        });
    }

    /**
     * 初始化控件位置、大小
     */
    DragMove.prototype.placeObject = function(){

        this.offset = {};

        if (typeof this.options.startPos.left === "number")
            this.offset.left = this.options.startPos.left;

        if (typeof this.options.startPos.top === "number")
            this.offset.top = this.options.startPos.top;

        this.$el.css({
            position:   'absolute',
            top:        this.offset.top,
            left:       this.offset.left
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

    DragMove.prototype.handleResize = function(){

        var self = this;

        self.$el.find(self.options.resizeIcon).hammer({ recognizers: [
            [Hammer.Pan,{ direction: Hammer.DIRECTION_ALL }]
        ] }).on(self.evPanStart, function(e){
            e.preventDefault();
            e.stopPropagation();
            var $el = self.$el;
            self.dragPosix = {
                '$dragIcon': $(this),
                'w': $el.outerWidth(),
                'h': $el.outerHeight(),
                'x': e.gesture.pointers[0].pageX,
                'y': e.gesture.pointers[0].pageY
            };

        }).on(self.evPanMove, function(e){
            e.preventDefault();
            e.stopPropagation();

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
        }).on(self.evPanEnd, function(e){
            e.preventDefault();
            e.stopPropagation();
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

    DragMove.prototype.handlePinch = function(){
        var self = this;

        //self.$el.hammer({ recognizers: [
        //    [Hammer.Pinch,{ direction: Hammer.DIRECTION_ALL }]
        //] }).on('pinch', function(e){
        //
        //    var scale = e.gesture.scale;
        //    $('.content').html(scale)
        //
        //    var $this = $(this);
        //
        //    $this.css({
        //        transform: 'scale('+scale+', '+scale+')'
        //    })
        //});

        self.$el.on('pinch', function(e){

            var scale = e.gesture.scale;
            $('.content').html(scale)

            var $this = $(this);

            $this.css({
                transform: 'scale('+scale+', '+scale+')'
            })
        });
    }

    DragMove.prototype.updateElementCss = function() {
        var self = this;

        self.$el.css({
            left: self.elLeft,
            top: self.elTop,
            width: self.elWidth,
            height: self.elHeight,
        })
        self.ticking = false;
    }

    DragMove.prototype.requestElementUpdate = function() {
        var self = this;

        if(!self.ticking) {
            reqAnimationFrame(self.updateElementCss.bind(self));
            self.ticking = true;
        }
    }

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
        dragMove.unsubscribe();
        $obj.removeData('plugin_' + pluginName);

    };


    window.myStopPropagation = function(e){
        if (window.event) {
            event.cancelBubble = true;
        }else{
            e.stopPropagation();
        }
    };


    // Animation polyFill
    var reqAnimationFrame = (function () {
        return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();
})(jQuery);