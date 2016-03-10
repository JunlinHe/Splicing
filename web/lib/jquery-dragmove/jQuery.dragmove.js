(function($) {

    $.fn.dragMove = function(option) {

        var self = this;

        self.moveTrigger        = "MSPointerMove pointermove touchmove mousemove";
        self.startTrigger       = "MSPointerDown pointerdown touchstart mousedown";
        self.stopTrigger        = "MSPointerUp pointerup touchend mouseup";
        self.ignorePropagation = false; //阻止冒泡

        self.options = $.extend({
            startPos: {
                left: null,
                top: null
            },
            scale: 1,//缩放比例
            constrainTo: 'parent', //默认约束到parent
            elementsWithInteraction: 'input', //指定部分不会触发拖动
            onMoveStart: null,
            onMove: null,
            onMoveEnd: null,
            onResizeStart: null,
            onResize: null,
            onResizeEnd: null
        }, option);



        return self.each(function() {

            var $this = $(this),
                $parent = $this.parent(),
                active,
                startX,
                startY,
                constraint = [],
                pLeft, pTop, pWidth, pHeight,
                oLeft, oTop, oWidth, oHeight,
                dX, dY;

            self.onStartEventOnElementsWithInteraction = function(){ self.ignorePropagation = true; };
            self.onEndEventOnElementsWithInteraction = function(){ self.ignorePropagation = false; };
            $this.on(
                self.startTrigger,
                self.options.elementsWithInteraction,
                self.onStartEventOnElementsWithInteraction
            );

            $this.hammer().on('panstart', function(e) {

                if (self.ignorePropagation) return;

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

                active = true;
                startX = e.gesture.pointers[0].pageX - oLeft;
                startY = e.gesture.pointers[0].pageY - oTop;

                // 回调
                if(self.options.onMoveStart) self.options.onMoveStart.call(this, e, this);

                if (window.mozInnerScreenX == null)
                    return false;
            }).on('panmove', function(e) {

                dX = e.gesture.pointers[0].pageX - startX;
                dY = e.gesture.pointers[0].pageY - startY;

                if(dX > constraint[1]){
                    dX = constraint[1];
                }
                if(dX < constraint[3]){
                    dX = constraint[3];
                }

                if(dY > constraint[2]){
                    dY = constraint[2];
                }
                if(dY < constraint[0]){
                    dY = constraint[0];
                }

                $this.offset({
                    left: dX,
                    top: dY
                });

                if(self.options.onMove) self.options.onMove.call(this, e, this);
            }).on('panend', function(e) {

                active = false;
                self.onEndEventOnElementsWithInteraction();

                if(self.options.onMoveEnd) self.options.onMoveEnd.call(this, e, this);
            });

        });

    };

})(jQuery);