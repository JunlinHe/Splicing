/**
 * Created by User on 2016/1/12.
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
 * 将数字插入到数字数组中并返回它的索引
 * @returns {boolean}
 */
Array.prototype.joinNum = function(n) {
    var arr = this,
        len = arr.length,
        tmp = arr;

    tmp.push(n);

    tmp = tmp.unique();


};

/**
 * 数组去重
 * @returns {Array}
 */
Array.prototype.unique = function(){
    var result = [], hash = {}, arr = this;
    for (var i = 0, elem; (elem = arr[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
    }
    return result;
}