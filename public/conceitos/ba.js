// Antes e depois arrastável, usado pelas três propostas.
document.querySelectorAll('[data-ba]').forEach(function (el) {
  var r = el.querySelector('input');
  function set(v) { el.style.setProperty('--p', v + '%'); }
  r.addEventListener('input', function () { set(r.value); });
  set(r.value);
});
