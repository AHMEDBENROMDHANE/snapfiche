// Menu mobile partagé des pages publiques : ajoute un bouton hamburger qui ouvre
// un panneau reprenant les liens de .lp-nav. Aucune dépendance, chargé par chaque page.
(function () {
  var container = document.querySelector('.lp-header .container');
  var nav = document.querySelector('.lp-nav');
  if (!container || !nav) return;

  var burger = document.createElement('button');
  burger.className = 'lp-burger';
  burger.setAttribute('aria-label', 'Ouvrir le menu');
  burger.setAttribute('aria-expanded', 'false');
  burger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path class="l1" d="M3 6h18"/><path class="l2" d="M3 12h18"/><path class="l3" d="M3 18h18"/></svg>';
  container.appendChild(burger);

  var panel = document.createElement('div');
  panel.className = 'lp-mobile-nav';
  panel.innerHTML = nav.innerHTML;
  document.body.appendChild(panel);

  function setOpen(open) {
    panel.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setOpen(!panel.classList.contains('open')); });
  panel.addEventListener('click', function (e) { if (e.target.tagName === 'A' || e.target === panel) setOpen(false); });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
})();
