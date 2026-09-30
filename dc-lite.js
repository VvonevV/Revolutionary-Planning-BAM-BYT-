/*
 * dc-lite: a small runtime that renders the prototype's template files with React.
 * Supports: {{ dotted.path }} holes, <sc-for list as>, <sc-if value>, event handlers
 * (onClick, drag events, onInput/onChange), inline styles, SVG, and a DCLogic base class.
 * Written for the RP (Revolutionary Planning) hackathon prototype (FEIT Hackathon 2026).
 */
(function () {
  'use strict';
  var R = window.React, RD = window.ReactDOM;
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  var VOID = { input: 1, br: 1, img: 1, hr: 1, meta: 1, link: 1, area: 1, col: 1, source: 1, wbr: 1 };
  var EVENTS = {
    onclick: 'onClick', ondblclick: 'onDoubleClick', ondragstart: 'onDragStart', ondragover: 'onDragOver',
    ondrop: 'onDrop', ondragleave: 'onDragLeave', ondragenter: 'onDragEnter', ondragend: 'onDragEnd',
    oninput: 'onChange', onchange: 'onChange', onkeydown: 'onKeyDown', onkeyup: 'onKeyUp',
    onmouseenter: 'onMouseEnter', onmouseleave: 'onMouseLeave', onfocus: 'onFocus', onblur: 'onBlur', onsubmit: 'onSubmit'
  };

  function lookup(path, scope) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return +path;
    if (/^(['"]).*\1$/.test(path)) return path.slice(1, -1);
    var parts = path.split('.');
    for (var i = scope.length - 1; i >= 0; i--) {
      var sc = scope[i];
      if (sc != null && typeof sc === 'object' && parts[0] in sc) {
        var v = sc[parts[0]];
        for (var j = 1; j < parts.length; j++) v = v == null ? undefined : v[parts[j]];
        return v;
      }
    }
    return undefined;
  }
  function interp(str, scope) {
    return str.replace(HOLE, function (_, p) { var v = lookup(p, scope); return v == null ? '' : String(v); });
  }
  function evalAttr(str, scope) {
    var m = str.match(WHOLE);
    return m ? lookup(m[1], scope) : interp(str, scope);
  }
  function parseStyle(s) {
    var o = {};
    String(s).split(';').forEach(function (d) {
      var i = d.indexOf(':'); if (i < 0) return;
      var k = d.slice(0, i).trim(), v = d.slice(i + 1).trim();
      if (!k || v === '') return;
      if (k.indexOf('--') !== 0) k = k.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
      o[k] = v;
    });
    return o;
  }

  function build(node, scope, key) {
    if (node.nodeType === 3) {
      var t = node.nodeValue;
      return t.indexOf('{{') < 0 ? t : interp(t, scope);
    }
    if (node.nodeType !== 1) return null;
    var tag = node.localName;
    if (tag === 'helmet') return null;
    if (tag === 'sc-for') {
      var list = evalAttr(node.getAttribute('list') || '', scope) || [];
      var as = node.getAttribute('as') || 'item';
      return list.map(function (it, i) {
        var frame = { $index: i }; frame[as] = it;
        return R.createElement(R.Fragment, { key: i }, kids(node, scope.concat([frame])));
      });
    }
    if (tag === 'sc-if') {
      return evalAttr(node.getAttribute('value') || '', scope) ? R.createElement(R.Fragment, { key: key }, kids(node, scope)) : null;
    }
    var isSvg = node.namespaceURI === 'http://www.w3.org/2000/svg';
    var props = { key: key };
    for (var a = 0; a < node.attributes.length; a++) {
      var n = node.attributes[a].name, raw = node.attributes[a].value, ln = n.toLowerCase();
      if (ln.indexOf('hint-') === 0) continue;
      var hasHole = raw.indexOf('{{') >= 0;
      var val = hasHole ? evalAttr(raw, scope) : raw;
      if (EVENTS[ln]) { if (typeof val === 'function') props[EVENTS[ln]] = val; continue; }
      if (ln === 'style') { props.style = parseStyle(val); continue; }
      if (ln === 'class') { props.className = val; continue; }
      if (ln === 'for') { props.htmlFor = val; continue; }
      if (ln === 'tabindex') { props.tabIndex = val; continue; }
      if (ln === 'value') { if (hasHole) props.value = val == null ? '' : val; else props.defaultValue = val; continue; }
      if (ln === 'checked') { if (hasHole) props.checked = !!val; else props.defaultChecked = true; continue; }
      if (ln.indexOf(':') >= 0) { if (ln === 'xlink:href') props.xlinkHref = val; continue; }
      if (ln.indexOf('aria-') === 0) { props[ln] = typeof val === 'boolean' ? String(val) : val; continue; }
      if (isSvg && ln.indexOf('data-') !== 0 && n.indexOf('-') >= 0) n = n.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
      props[n] = val;
    }
    if ((tag === 'input' || tag === 'textarea') && props.value !== undefined && !props.onChange) props.readOnly = true;
    if (tag === 'input' && props.checked !== undefined && !props.onChange) props.readOnly = true;
    if (VOID[tag]) return R.createElement(tag, props);
    return R.createElement.apply(null, [tag, props].concat(kids(node, scope)));
  }
  function kids(node, scope) {
    var out = [], i = 0;
    node.childNodes.forEach(function (c) { var r = build(c, scope, i++); if (r !== null && r !== undefined && r !== '') out.push(r); });
    return out;
  }

  function DCLogic(props) { R.Component.call(this, props); this.state = {}; }
  DCLogic.prototype = Object.create(R.Component.prototype);
  DCLogic.prototype.constructor = DCLogic;
  DCLogic.prototype.renderVals = function () { return {}; };
  DCLogic.prototype.render = function () {
    var vals = this.renderVals() || {};
    var root = this.constructor.__template;
    return R.createElement(R.Fragment, null, kids(root, [this.props || {}, vals]));
  };
  window.DCLogic = DCLogic;

  function mount() {
    var tpl = document.querySelector('x-dc');
    if (!tpl) return;
    // move <helmet> styles and links into <head>
    var helmet = tpl.querySelector('helmet');
    if (helmet) Array.prototype.slice.call(helmet.children).forEach(function (el) { document.head.appendChild(el.cloneNode(true)); });
    var scriptEl = document.querySelector('script[data-dc-script]');
    var props = {}, preview = { width: 1280, height: 800 };
    try {
      var meta = JSON.parse(scriptEl.getAttribute('data-props') || '{}');
      Object.keys(meta).forEach(function (k) {
        if (k === '$preview') preview = meta[k];
        else if (meta[k] && 'default' in meta[k]) props[k] = meta[k]['default'];
      });
    } catch (e) { /* no props */ }
    // allow ?prop=value overrides, e.g. ?startZoom=0.6
    new URLSearchParams(location.search).forEach(function (v, k) { props[k] = v === 'true' ? true : v === 'false' ? false : (isNaN(+v) ? v : +v); });
    var Component = new Function('DCLogic', 'React', scriptEl.textContent + '\n;return Component;')(DCLogic, R);
    Component.__template = tpl;
    tpl.parentNode.removeChild(tpl);

    // stage: centre the fixed-size screen and scale it to fit the window
    document.body.style.margin = '0';
    var stage = document.createElement('div');
    stage.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#E7E4DC;overflow:hidden';
    var frame = document.createElement('div');
    frame.style.cssText = 'width:' + preview.width + 'px;height:' + preview.height + 'px;flex:none;transform-origin:center center;box-shadow:0 10px 40px rgba(0,0,0,0.18);background:#fff';
    stage.appendChild(frame); document.body.appendChild(stage);
    function fit() {
      var w = stage.clientWidth || window.innerWidth, h = stage.clientHeight || window.innerHeight;
      if (window.visualViewport) { w = Math.min(w, window.visualViewport.width); h = Math.min(h, window.visualViewport.height); }
      var s = Math.min(w / preview.width, h / preview.height, 1.6);
      frame.style.transform = 'scale(' + Math.max(s, 0.2) + ')';
    }
    window.addEventListener('resize', fit);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);
    if (window.ResizeObserver) new ResizeObserver(fit).observe(stage);
    fit(); setTimeout(fit, 100); setTimeout(fit, 600);
    RD.createRoot(frame).render(R.createElement(Component, props));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
