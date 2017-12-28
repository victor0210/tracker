'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by humengtao on 12/28/17.
 */
(function (g) {

  //-----------------------------------------------------Ajax-Section-Start------------------------------------------------------
  var Ajax = function () {
    function Ajax() {
      _classCallCheck(this, Ajax);
    }

    _createClass(Ajax, [{
      key: 'send',
      value: function send(url, method, data, headers, callbackSuccess, callbackFailed) {
        var xhr = new XMLHttpRequest(); //新建ajax请求，不兼容IE7以下

        if (method === 'get') {
          //如果是get方法，需要把data中的数据转化作为url传递给服务器
          if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
            var data_send = '?';
            for (var key in data) {
              data_send += key + '=' + data[key];
              data_send += '&';
            }
            data_send = data_send.slice(0, -1);
          }
          xhr.open(method, url + data_send, true);
          xhr.send(null);
        } else if (method === 'post') {
          //如果是post，需要在头中添加content-type说明
          xhr.open(method, url, true);
          for (var k in headers) {
            xhr.setRequestHeader(k, headers[k]);
          }

          setTimeout(function () {
            xhr.send(JSON.stringify(data)); //发送的数据需要转化成JSON格式
          }, 2000);
        } else {
          return false;
        }

        xhr.onreadystatechange = function () {
          //注册回调函数
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              console.log('s');
              if (callbackSuccess != null) callbackSuccess(xhr.responseText);
            } else {
              if (callbackFailed != null) callbackFailed();
              console.error('Server Error, Please Check Your Server ' + url + ' If Well');
            }
          }
        };
      }
    }]);

    return Ajax;
  }();

  //-----------------------------------------------------Ajax-Section-End--------------------------------------------------------


  //----------------------------------------------------Tracker-Section-Start----------------------------------------------------

  /**
   *  @description  Tracker Private Variable
   **/


  var
  //用户自定义参数 report url, request method, headers
  opts = {},


  //错误信息对象
  report_obj = {
    tracker_msg: null,
    tracker_file_url: null,
    tracker_line: null,
    tracker_column: null,
    tracker_error_obj: null,
    tracker_agent: null,
    tracker_time: null
  },


  //错误信息队列管理对象
  report_manager = {
    _queue: {},
    _oldestIndex: 1, //队列头部指针
    _newestIndex: 1 };

  /**
   * @step:  1.listen errors
   * @step:  2.catch errors & format data & push to report queue
   * @step:  3.queue actions & report
   **/

  var Tracker = function () {
    function Tracker() {
      _classCallCheck(this, Tracker);

      this.ajax = new Ajax();
      this.listenError();
    }

    /**
     *  @name catchError
     *  @description 流程控制: 监听错误, 获取错误信息, 队列操作, 上报数据
     **/


    _createClass(Tracker, [{
      key: 'listenError',
      value: function listenError() {
        var _this = this;
        try {
          window.onerror = function (msg, url, line, column, errorObj) {
            _setTrackerMessage(msg);
            _setTrackerFileUrl(url);
            _setTrackerLine(line);
            _setTrackerColumn(column);
            _setTrackerErrorObj(errorObj);
            _setTrackerTime();
            _setTrackerUserAgent();

            _enQueue();
            _this.reportTrack(_deQueue());
          };
        } catch (e) {
          console.error(e);
        }
      }
    }, {
      key: 'reportTrack',
      value: function reportTrack(data) {
        this.ajax.send(opts.report_url, opts.method, data, opts.headers, opts.callbackSuccess, opts.callbackFailed);
      }
    }]);

    return Tracker;
  }();

  /**
   *  @description  Tracker Private Functions
   **/

  var _enQueue = function _enQueue() {
    report_manager._queue[report_manager._oldestIndex] = report_obj;
    report_manager._newestIndex++;
  };

  var _deQueue = function _deQueue() {
    var deletedData = void 0;
    //判断是否存在假溢出、空队列的情况
    if (report_manager._oldestIndex !== report_manager._newestIndex) {
      deletedData = report_manager._queue[report_manager._oldestIndex];
      delete report_manager._queue[report_manager._oldestIndex++];

      return deletedData;
    }

    throw new Error("Tracker Queue Is Full Stack");
  };

  var _setTrackerMessage = function _setTrackerMessage(msg) {
    report_obj.tracker_msg = msg;
  };

  var _setTrackerFileUrl = function _setTrackerFileUrl(url) {
    report_obj.tracker_file_url = url;
  };

  var _setTrackerLine = function _setTrackerLine(line) {
    report_obj.tracker_line = line;
  };

  var _setTrackerColumn = function _setTrackerColumn(column) {
    report_obj.tracker_column = column;
  };

  var _setTrackerErrorObj = function _setTrackerErrorObj(obj) {
    report_obj.tracker_error_obj = obj;
  };

  var _setTrackerUserAgent = function _setTrackerUserAgent() {
    report_obj.tracker_agent = navigator.userAgent;
  };

  var _setTrackerTime = function _setTrackerTime() {
    report_obj.tracker_time = Date.now();
  };

  //----------------------------------------------------Tracker-Section-End------------------------------------------------------

  /**
   *  @description  Define Global Tracker Instance
   **/
  g.ErrorTracker = function () {
    var defaults = {
      report_url: null,
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      callbackSuccess: null,
      callbackFailed: null
    };

    return {
      init: function init(opt) {
        if (!opt.report_url) throw new Error("Tracker Report_Url Can't Be Null");

        opts = Object.assign('', defaults, opt);
        return new Tracker();
      }
    };
  }();
})(typeof window === 'undefined' ? undefined : window);

//# sourceMappingURL=tracker-compiled.js.map