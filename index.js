(function() {
  var defaultConfig = {
    className: '.ellipsis-text',
    mode: 'word',
    count: 20,
    responsive: true,
    debounce: 200
  }
  var cache = [];
  var debounce;
  var punctuations = [',', '.', ';', '!'];

  function extend(a, b) {
    var c = {};
    for (var p in a) { c[p] = a[p]; }
    for (var p in b) { c[p] = b[p]; }
    return c;
  }

  function Ellipsis(options) {
    this.init(options);
  }

  Ellipsis.prototype = {
    init: function(options) {
      this.config = extend(defaultConfig, options);
      this.run();

      var listener = function(event) {
        clearTimeout(debounce);
        debounce = setTimeout(function() {
          if (this.config.responsive) {
            this.run();
          }
          for (var i = 0; i < cache.length; ++i) {
            if (cache[i].config.responsive) {
              cache[i].run();
            }
          }
        }.bind(this), this.config.debounce);
      };

      window.addEventListener('resize', listener.bind(this), false);
      window.removeEventListener('beforeunload', listener.bind(this), false);
    },
    run: function() {
      var nodes = document.querySelectorAll(this.config.className);
      for(var i = 0; i < nodes.length; ++i){
      	if(!nodes[i].cloneText){
      		nodes[i].cloneText = nodes[i].innerHTML;
      	}
      	nodes[i].innerHTML = truncate(nodes[i].cloneText, this.config);
      }
    },
    addItem: function(dom, options) {
      var item = new EllipsisItem(dom, options);
      cache.push(item);
      return item;
    },
    destroy: function() {
      var nodes = document.querySelectorAll(this.config.className);

      for(var i = 0; i < nodes.length; ++i){
      	nodes[i].innerHTML = nodes[i].cloneText;
      	delete nodes[i].cloneText;
      }

      for (var i = 0; i < cache.length; ++i) {
        cache[i].destroy();
      }
    }
  }

  function EllipsisItem(dom, options) {
    if (dom.__EllipsisInited) return;
    this.config = extend(defaultConfig, options);
    this.cloneText = dom.innerHTML;
    this.dom = dom;
    this.run();
    dom.__EllipsisInited = true;
  }

  EllipsisItem.prototype = {
    run: function() {
      this.dom.innerHTML = truncate(this.cloneText, this.config, this.dom);
    },
    destroy: function() {
      cache.splice(cache.indexOf(this), 1);
      this.dom.innerHTML = this.cloneText;
      this.dom.__EllipsisInited = false;
    }
  }

  function truncate(text, config, dom) {
    var res;
    if (config.mode === 'line') {
      res = truncateLine(text, config.count, dom);
    } else if (config.mode === 'word') {
      res = truncateWord(text, config.count)
    } else {
      res = truncateChar(text, config.count);
    }
    return res;
  }

  function truncateWord(text, count) {
    var arr = text.split(' ');
    if (arr.length <= count) return;

    arr = arr.slice(0, count);

    return removeTrailingPunctuation(arr.join(' ')) + '...';
  }

  function truncateChar(text, count) {
    if (text.length < count) return;
    var str = text.substr(0, count);
    var char = str[str.length - 1];

    return removeTrailingPunctuation(str) + '...';
  }

  function removeTrailingPunctuation(str) {
    if (punctuations.indexOf(str[str.length - 1]) >= 0) {
      return str.substr(0, str.length - 1);
    }
    return str;
  }

  function truncateLine(text, count, dom) {
    dom.innerHTML = '';
    var ih = dom.clientHeight;
    dom.innerHTML = 'text';
    var lh = dom.clientHeight - ih;
    dom.innerHTML = text;
    var arr, i, str, ret = text;
    if (dom.clientHeight - ih > count * lh) {
      if (dom.clientHeight - ih > 2 * count * lh) {
        arr = text.split(' ');
        i = 1;
        while (i < arr.length) {
          str = arr.slice(0, i).join(' ');
          dom.innerHTML = removeTrailingPunctuation(str) + '...';
          if (dom.clientHeight - ih > count * lh) {
            str = arr.slice(0, i - 1).join(' ');
            ret = removeTrailingPunctuation(str) + '...';
            break;
          }
          ++i;
        }
      } else {
        arr = text.split(' ');
        i = arr.length - 1;
        while (i >= 0) {
          str = arr.slice(0, i).join(' ');
          dom.innerHTML = removeTrailingPunctuation(str) + '...';
          if (dom.clientHeight - ih <= count * lh) {
          	ret = dom.innerHTML;
            break;
          }
          --i;
        }
      }
    }

    return ret;
  }

  function getLineHeight(dom) {
    var temp = document.createElement(dom.nodeName);
    temp.setAttribute("style", "margin:0px;padding:0px;font-family:" + dom.style.fontFamily + ";font-size:" + dom.style.fontSize);
    temp.innerHTML = "test";
    temp = dom.parentNode.appendChild(temp);
    var ret = temp.clientHeight;
    temp.parentNode.removeChild(temp);
    return ret;
  }


  function EllipsisFactory(o) {
    return window.__ellipsisInstance || (window.__ellipsisInstance = new Ellipsis(o));
  }

  window.Ellipsis = EllipsisFactory;

  return EllipsisFactory;
})()
