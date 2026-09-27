// Flat-link resolver for the deployed build.
//
// In the working source every page links to its neighbour by component name
// ("Research.dc.html"). The deployed site ships flat files ("research.html").
// Rather than maintaining two copies of every page, deployed pages carry
//   <meta name="flat-links" content="1">
// and this script rewrites the hrefs at runtime. Dev pages have no meta tag,
// so they are left completely alone.
(function () {
  if (!document.querySelector('meta[name="flat-links"]')) return;

  var SPECIAL = { 'nayak lab': 'index', 'sitenav': 'index', 'sitefooter': 'index' };

  function flatten(href) {
    if (!href) return href;
    var m = /^([^?#]*?)\.dc\.html(.*)$/.exec(href);
    if (!m) return href;
    var name = m[1].replace(/^.*\//, '');
    var dir = m[1].slice(0, m[1].length - name.length);
    var key = name.toLowerCase();
    return dir + (SPECIAL[key] || key.replace(/\s+/g, '-')) + '.html' + m[2];
  }

  function pass(root) {
    var list = (root || document).querySelectorAll('a[href*=".dc.html"]');
    for (var i = 0; i < list.length; i++) {
      var a = list[i], raw = a.getAttribute('href');
      var next = flatten(raw);
      if (next !== raw) a.setAttribute('href', next);
    }
  }

  // The page is rendered asynchronously, so sweep as nodes arrive.
  function start() {
    pass(document);
    if (!window.MutationObserver) return;
    new MutationObserver(function () { pass(document); })
      .observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  // Belt and braces: catch any anchor that slipped through between passes.
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*=".dc.html"]') : null;
    if (a) a.setAttribute('href', flatten(a.getAttribute('href')));
  }, true);

  window.flattenHref = flatten;
})();
