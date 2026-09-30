/* RP (Revolutionary Planning) prototype loader: React (bundled locally) + our tiny template runtime. */
(function () {
  var s = document.currentScript && document.currentScript.src;
  var base = s ? s.slice(0, s.lastIndexOf('/') + 1) : './';
  document.write('<meta name="color-scheme" content="light only">');
  document.write('<style>x-dc{display:none!important}:root,html,body{color-scheme:light only!important}body{background:#E7E4DC;color:#1D1D1B}button,input,select,textarea{color:inherit;color-scheme:light}input::placeholder,textarea::placeholder{color:#8A857A}</style>');
  document.write('<script src="' + base + 'vendor/react.production.min.js"><\/script>');
  document.write('<script src="' + base + 'vendor/react-dom.production.min.js"><\/script>');
  document.write('<script src="' + base + 'dc-lite.js"><\/script>');
})();
