(function($) {

    var pluginName = 'dragMove';
    var defaults = {
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

        self.moveTrigger        = "MSPointerMove pointermove touchmove mousemove";
        self.startTrigger       = "MSPointerDown pointerdown touchstart mousedown";
        self.stopTrigger        = "MSPointerUp pointerup touchend mouseup";
        self.evPanStart = 'panstart';
        self.evPanMove = 'panmove';
        self.evPanEnd = 'panend';

        self.ignorePropagation = false; //阻止冒泡

        self.options = $.extend(defaults, options);

        var $parent = self.$el.parent(),
            startX,
            startY,
            constraint = [],
            pLeft, pTop, pWidth, pHeight,
            oLeft, oTop, oWidth, oHeight,
            dX, dY;


        // init
        self.placeObject();

        self.$el.find(self.options.elementsWithInteraction+','+self.options.resizeIcon).hammer().on(self.evPanStart,function() {
            self.ignorePropagation = true;
        });

        self.$el.hammer().on(self.evPanStart, function(e) {

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

                constraint = [pTop, pLeft+pWidth-oWidth, pTop+pHeight-oHeight, pLeft];
            }

            startX = e.gesture.pointers[0].pageX - oLeft;
            startY = e.gesture.pointers[0].pageY - oTop;

            // 回调
            if(self.options.onMoveStart) self.options.onMoveStart.call(this, e, this);

        }).on(self.evPanMove, function(e) {

            if(self.ignorePropagation) return;

            dX = e.gesture.pointers[0].pageX - startX;
            dY = e.gesture.pointers[0].pageY - startY;

            var hash = self.handleConstraint(dX, dY);

            $(this).offset({
                left: hash.x,
                top: hash.y
            });

            if(self.options.onMove) self.options.onMove.call(this, e, this);
        }).on(self.evPanEnd, function(e) {

            self.ignorePropagation = false;

            if(self.options.onMoveEnd) self.options.onMoveEnd.call(this, e, this);
        });
    }

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

    DragMove.prototype.handleConstraint = function(dX, dY){

        var self = this,
            constraint = self.options.constrainTo;

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

        var self = this,
            dX, dY;

        self.$el.find(self.options.resizeIcon).hammer().on(self.evPanStart, function(e){
            var $el = self.$el;
            self.dragPosix = {
                '$dragIcon': $(this),
                'w': $el.outerWidth(),
                'h': $el.outerHeight(),
                'x': e.gesture.pointers[0].pageX,
                'y': e.gesture.pointers[0].pageY
            };
        }).on(self.evPanMove, function(e){

            var $drag = self.$el;
            // 获得鼠标移动阀值内的移动数值
            var hash = this.handleDragIconMove(curX, curY);
            var $dragIcon = this.dragPosix.$dragIcon;

            if($dragIcon.hasClass('nw')){
                this.doMoveTo(dX, dY);
                $drag.css({
                    'width': Math.max(this.options.minSize.w, (this.dragPosix.x - hash.curX)/this.scale  + this.dragPosix.w),
                    'height': Math.max(this.options.minSize.h, (this.dragPosix.y - hash.curY)/this.scale + this.dragPosix.h)
                });
            }else if($dragIcon.hasClass('n')){
                this.doMoveTo(0, dy);
                $drag.css({
                    'height': Math.max(this.options.minSize.h, (this.dragPosix.y - hash.curY)/this.scale + this.dragPosix.h)
                });
            }else if($dragIcon.hasClass('ne')){
                this.doMoveTo(0, dy);
                $drag.css({
                    'width': Math.max(this.options.minSize.w, (hash.curX - this.dragPosix.x)/this.scale + this.dragPosix.w),
                    'height': Math.max(this.options.minSize.h, (this.dragPosix.y - hash.curY)/this.scale + this.dragPosix.h)
                });
            }else if($dragIcon.hasClass('w')){
                this.doMoveTo(dx, 0);
                $drag.css({
                    'width': Math.max(this.options.minSize.w, (this.dragPosix.x - hash.curX)/this.scale  + this.dragPosix.w)
                });
            }else if($dragIcon.hasClass('e')){
                this.doMoveTo(0, 0);
                $drag.css({
                    'width': Math.max(this.options.minSize.w, (hash.curX - this.dragPosix.x)/this.scale + this.dragPosix.w)
                });
            }else if($dragIcon.hasClass('sw')){
                this.doMoveTo(dx, 0);
                $drag.css({
                    'width': Math.max(this.options.minSize.w, (this.dragPosix.x - hash.curX)/this.scale  + this.dragPosix.w),
                    'height': Math.max(this.options.minSize.h, (hash.curY - this.dragPosix.y)/this.scale + this.dragPosix.h)
                });
            }else if($dragIcon.hasClass('s')){
                this.doMoveTo(0, 0);
                $drag.css({
                    'height': Math.max(this.options.minSize.h, (hash.curY - this.dragPosix.y)/this.scale + this.dragPosix.h)
                });
            }else{
                $drag.css({
                    'width': Math.max(this.options.minSize.w, (hash.curX - this.dragPosix.x)/this.scale + this.dragPosix.w),
                    'height': Math.max(this.options.minSize.h, (hash.curY - this.dragPosix.y)/this.scale + this.dragPosix.h)
                });
            }
        }).on(self.evPanEnd, function(e){

        });

    }

    // 装载插件
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

})(jQuery);