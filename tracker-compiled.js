'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Dandy on 12/28/17.
 * Version 1.0.0
 * License MIT
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
        var xhr = new XMLHttpRequest(); //Over IE7 Running Well

        if (method === 'get') {
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
          xhr.open(method, url, true);
          for (var k in headers) {
            xhr.setRequestHeader(k, headers[k]);
          }

          xhr.send(JSON.stringify(data)); //Convert Send-Data To Json Type
        } else {
          return false;
        }

        xhr.onreadystatechange = function () {
          //Register Callback Functions
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


  var opts = {},
      //Merged Options

  report_obj = {
    tracker_msg: null,
    tracker_file_url: null,
    tracker_line: null,
    tracker_column: null,
    tracker_error_obj: null,
    tracker_agent: null,
    tracker_time: null
  },
      report_manager = {
    _queue: {},
    _oldestIndex: 1, //Pointer Of Report Queue Head
    _newestIndex: 1 };

  /**
   * @step1:  initialize ajax & listen errors
   * @step2:  catch errors & format data & push to report queue
   * @step3:  dequeue & send data & callback
   **/

  var Tracker = function () {
    function Tracker() {
      _classCallCheck(this, Tracker);

      this.ajax = new Ajax();
      this.listenError();
    }

    /**
     *  @name catchError
     *  @flow-control:  listen & catch errors, format & enqueue, dequeue & report, catch response & run callback
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

        /* @description: Send Tracker Data With Image & Callback Options Won't Work Anymore
         *
         *    var url = REPORT_URL + data.join('||');// 组装错误上报信息内容URL
         *    var img = new Image;
         *    img.onload = img.onerror = function(){
         *      img = null;
         *    };
         *    img.src = url;// 发送数据到后台cgi
         **/

        /* @description: Send Tracker Data With sendBeacon && Callback Options Won't Work Anymore
         *
         *   sendBeacon(opts.url,data)
         **/

        // TODO: reportTrack method with sendBeacon & new Image() request
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

    if (report_manager._oldestIndex !== report_manager._newestIndex) {
      //Judge Report-Queue If Suppose-Overflow Or Null
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