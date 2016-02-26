/**
 * Created by HeJunlin on 2016/1/12.
 */
/**
 * 获取元素在数组中的索引
 * @param val
 * @returns {number}
 */
Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};

/**
 * 删除数组中的指定元素
 * @param val
 */
Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

/**
 * 查询当前队列中可用的索引，队列从0开始
 * @returns {number}
 */
Array.prototype.queue = function() {
    var arr = this,
        len = arr.length,
        index = 0,
        queue = [],
        tmp = [];

    if(len === 0)
        return 0;
    // 对当前队列去重排序
    arr = arr.unique();
    arr.sort();
    //console.log(arr)
    // 生成从0开始的顺序队列
    for(var i = 0; i <= arr[arr.length-1]; i++){
        queue.push(i);
    }
    //console.log(queue)
    // 取差集首个插入
    tmp = Array.minus(queue, arr);
    //console.log(tmp)
    if(tmp.length > 0){
        index = tmp[0];
    }else{
        index = len;
    }

    return index;
};


/**
 * each是一个集合迭代函数，它接受一个函数作为参数和一组可选的参数
 * 这个迭代函数依次将集合的每一个元素和可选参数用函数进行计算，并将计算得的结果集返回
 {%example
 <script>
      var a = [1,2,3,4].each(function(x){return x > 2 ? x : null});
      var b = [1,2,3,4].each(function(x){return x < 0 ? x : null});
      alert(a);
      alert(b);
 </script>
 %}
 * @param {Function} fn 进行迭代判定的函数
 * @param more ... 零个或多个可选的用户自定义参数
 * @returns {Array} 结果集，如果没有结果，返回空集
 */
Array.prototype.each = function(fn){
    fn = fn || Function.K;
    var a = [];
    var args = Array.prototype.slice.call(arguments, 1);
    for(var i = 0; i < this.length; i++){
        var res = fn.apply(this,[this[i],i].concat(args));
        if(res != null) a.push(res);
    }
    return a;
};

/**
 * 包含
 * @param item
 * @returns {boolean}
 */
Array.prototype.contains = function(item){
    return RegExp("\\b"+item+"\\b").test(this);
};

/**
 * 得到一个数组不重复的元素集合<br/>
 * 唯一化一个数组
 * @returns {Array} 由不重复元素构成的数组
 */
Array.prototype.unique = function(){
    var ra = new Array();
    for(var i = 0; i < this.length; i ++){
        if(!ra.contains(this[i])){
            ra.push(this[i]);
        }
    }
    return ra;
};

/**
 * 求两个集合的补集
 {%example
 <script>
      var a = [1,2,3,4];
      var b = [3,4,5,6];
      alert(Array.complement(a,b));
 </script>
 %}
 * @param {Array} a 集合A
 * @param {Array} b 集合B
 * @returns {Array} 两个集合的补集
 */
Array.complement = function(a, b){
    return Array.minus(Array.union(a, b),Array.intersect(a, b));
};

/**
 * 求两个集合的交集
 {%example
 <script>
      var a = [1,2,3,4];
      var b = [3,4,5,6];
      alert(Array.intersect(a,b));
 </script>
 %}
 * @param {Array} a 集合A
 * @param {Array} b 集合B
 * @returns {Array} 两个集合的交集
 */
Array.intersect = function(a, b){
    return a.unique().each(function(o){return b.contains(o) ? o : null});
};

/**
 * 求两个集合的差集
 {%example
 <script>
      var a = [1,2,3,4];
      var b = [3,4,5,6];
      alert(Array.minus(a,b));
 </script>
 %}
 * @param {Array} a 集合A
 * @param {Array} b 集合B
 * @returns {Array} 两个集合的差集
 */
Array.minus = function(a, b){
    return a.unique().each(function(o){return b.contains(o) ? null : o});
};

/**
 * 求两个集合的并集
 {%example
 <script>
      var a = [1,2,3,4];
      var b = [3,4,5,6];
      alert(Array.union(a,b));
 </script>
 %}
 * @param {Array} a 集合A
 * @param {Array} b 集合B
 * @returns {Array} 两个集合的并集
 */
Array.union = function(a, b){
    return a.concat(b).unique();
};

/**
 * 为canvas绘制虚线
 * @param fromX
 * @param fromY
 * @param toX
 * @param toY
 * @param pattern
 */
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

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function(fmt){
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
};

window.isTouch = function(ev){
    return ev.type.search('touch') > -1;
};

(function($){

    /**
     * 表单数据序列化为json
     */
    $.fn.serializeJson = function(){
        var serializeObj={};
        $(this.serializeArray()).each(function(){
            serializeObj[this.name]=this.value;
        });
        return serializeObj;
    };

    /**
     * bootstrap确认提示框
     * @param option
     * @returns {*|HTMLElement}
     */
    $.extend({
        confirm:function(option){
            var _option = $.extend({
                event: 'click',
                title: 'Confirm',
                message: 'Are you sure?',
                btn: ['no','yes'],
                onCancel: null,
                onSuccess: null
            },option);

            var $model = $('#modal-confirm'),
                $title = $model.find('.modal-header h4'),
                $message = $model.find('.modal-body'),
                $btnCancel = $model.find('.modal-footer .no'),
                $btnConfirm = $model.find('.modal-footer .yes');

            $title.html(_option.title);
            $message.html(_option.message);
            $btnCancel.html(_option.btn[0]);
            $btnConfirm.html(_option.btn[1]);

            $model.modal('show');

            $btnCancel.off(_option.event).on(_option.event, function() {
                if(_option.onCancel)
                    _option.onCancel();
            });
            $btnConfirm.off(_option.event).on(_option.event, function() {
                if(_option.onSuccess)
                    _option.onSuccess();
                $model.modal('hide')
            });

            return $model;
        }
    });
    //$.fn.confirm = function(option){
    //
    //};

    // 数字输入框数字限制
    $(document).on('keyup', 'input[type=number]', function(e){
        var val = parseInt(this.value),
            min = parseInt(this.min),
            max = parseInt(this.max);

        if(val < min){
            this.value = min;
        }else if(val > max){
            this.value = max;
        }else if(min <= val && val <= max){
            this.value = val;
        }else {
            this.value = '';
            return false;
        }
    });
})(jQuery);


