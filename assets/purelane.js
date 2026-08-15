/**
 * PURELANE - Production Theme JavaScript Engine
 * Handles animations, stage rotators, scroll reveals, scene crossfading,
 * parallax depth, and Shopify Theme Editor lifecycle events.
 */

window.Purelane = window.Purelane || {};

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var instances = {
    heroStages: new Map(),
    rotators: new Map(),
    observers: []
  };

  /* --------------------------------------------------------------------------
     1. SCROLL REVEAL OBSERVER
     -------------------------------------------------------------------------- */
  function initScrollReveals(container) {
    var root = container || document;
    var revs = root.querySelectorAll('.rv:not(.in)');
    if (!revs.length) return;

    if ('IntersectionObserver' in window && !reduce) {
      var ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            ro.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

      revs.forEach(function (el) { ro.observe(el); });
      instances.observers.push(ro);
    } else {
      revs.forEach(function (el) { el.classList.add('in'); });
    }
  }

  /* --------------------------------------------------------------------------
     2. DETERMINISTIC SCENE CROSSFADING & PROGRESS RAIL
     -------------------------------------------------------------------------- */
  var scenes = [];
  var zones = [];
  var stage = null;
  var currentScene = 0;
  var railLinks = [];
  var railTargets = [];

  function initScenesAndRail() {
    scenes = Array.prototype.slice.call(document.querySelectorAll('.pl-scene'));
    zones = Array.prototype.slice.call(document.querySelectorAll('[data-scene]'));
    stage = document.getElementById('scenes');
    railLinks = Array.prototype.slice.call(document.querySelectorAll('.pl-rail a'));
    railTargets = railLinks.map(function (a) {
      var href = a.getAttribute('href');
      return href && href.startsWith('#') ? document.querySelector(href) : null;
    });
  }

  function setScene(n) {
    if (n === currentScene) return;
    currentScene = n;
    scenes.forEach(function (s, i) {
      s.classList.toggle('on', i + 1 === n);
    });
    if (stage) stage.setAttribute('data-d', String(n));
  }

  function pickScene(scrollTop, winHeight) {
    var focus = scrollTop + winHeight * 0.5;
    var n = 1;
    for (var i = 0; i < zones.length; i++) {
      var z = zones[i];
      var top = 0;
      var el = z;
      while (el) {
        top += el.offsetTop;
        el = el.offsetParent;
      }
      if (top <= focus) {
        n = parseInt(z.getAttribute('data-scene'), 10) || n;
      }
    }
    setScene(n);
  }

  function syncRail(scrollTop, winHeight) {
    if (!railLinks.length) return;
    var mid = scrollTop + winHeight * 0.42;
    var idx = 0;
    railTargets.forEach(function (t, i) {
      if (t && t.offsetTop <= mid) idx = i;
    });
    railLinks.forEach(function (a, i) {
      a.classList.toggle('on', i === idx);
    });
  }

  /* --------------------------------------------------------------------------
     3. PARALLAX & WATER MOTION
     -------------------------------------------------------------------------- */
  var raf = null;
  var mx = 0;
  var my = 0;
  var hdr = null;
  var heroProd = null;

  function onFrame() {
    raf = null;
    var y = window.scrollY || window.pageYOffset;
    var winHeight = window.innerHeight;

    if (!hdr) hdr = document.getElementById('hdr');
    if (!heroProd) heroProd = document.getElementById('heroProd');

    if (hdr) hdr.classList.toggle('up', y > 90);

    if (!reduce) {
      var wl = document.querySelectorAll('#water .pl-wl');
      var depths = [0.05, 0.09, 0.03, 0.02];
      for (var i = 0; i < wl.length; i++) {
        var d = depths[i] || 0.05;
        wl[i].style.setProperty('--px', (mx * d * 130).toFixed(1) + 'px');
        wl[i].style.setProperty('--py', (-y * d + my * d * 90).toFixed(1) + 'px');
      }

      if (heroProd) {
        var f = Math.min(y / 700, 1);
        heroProd.style.transform = 'translate3d(' + (mx * -16).toFixed(2) + 'px,' + (-f * 54 + my * -10).toFixed(2) + 'px,0) scale(' + (1 - f * 0.06).toFixed(3) + ')';
        heroProd.style.opacity = (1 - f * 0.55).toFixed(3);
      }
    }

    syncRail(y, winHeight);
    pickScene(y, winHeight);
  }

  function requestTick() {
    if (!raf) raf = requestAnimationFrame(onFrame);
  }

  /* --------------------------------------------------------------------------
     4. HERO PRODUCT STAGE (1 -> 2 -> 3 Products)
     -------------------------------------------------------------------------- */
  function initHeroStage(sectionEl) {
    var stageEl = sectionEl.querySelector('.hstage') || document.getElementById('hstage');
    if (!stageEl) return;

    var sectionId = sectionEl.getAttribute('data-section-id') || 'hero-default';
    if (instances.heroStages.has(sectionId)) {
      instances.heroStages.get(sectionId).destroy();
    }

    var slides = Array.prototype.slice.call(stageEl.querySelectorAll('.hslide'));
    var dotsContainer = sectionEl.querySelector('.hdots') || document.getElementById('hdots');
    var dots = dotsContainer ? Array.prototype.slice.call(dotsContainer.querySelectorAll('button')) : [];
    var currentIndex = 0;
    var timer = null;
    var autoplaySpeed = parseInt(stageEl.getAttribute('data-autoplay-speed'), 10) || 3800;

    function goTo(n) {
      if (!slides.length) return;
      currentIndex = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        s.classList.toggle('on', i === currentIndex);
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('on', i === currentIndex);
      });
    }

    function play() {
      if (!timer && !reduce && slides.length > 1) {
        timer = setInterval(function () {
          goTo(currentIndex + 1);
        }, autoplaySpeed);
      }
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        stop();
        goTo(i);
        play();
      });
    });

    stageEl.addEventListener('mouseenter', stop);
    stageEl.addEventListener('mouseleave', play);

    var stageObserver = null;
    if ('IntersectionObserver' in window) {
      stageObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          e.isIntersecting ? play() : stop();
        });
      }, { threshold: 0.2 });
      stageObserver.observe(stageEl);
    } else {
      play();
    }

    var instance = {
      goTo: goTo,
      play: play,
      stop: stop,
      destroy: function () {
        stop();
        if (stageObserver) stageObserver.disconnect();
        stageEl.removeEventListener('mouseenter', stop);
        stageEl.removeEventListener('mouseleave', play);
        instances.heroStages.delete(sectionId);
      }
    };

    instances.heroStages.set(sectionId, instance);
  }

  /* --------------------------------------------------------------------------
     5. PRODUCT ROTATOR ("Why it works" / Proof Section)
     -------------------------------------------------------------------------- */
  function initProductRotator(sectionEl) {
    var rotEl = sectionEl.querySelector('.rot') || document.getElementById('rot');
    if (!rotEl) return;

    var sectionId = sectionEl.getAttribute('data-section-id') || 'proof-default';
    if (instances.rotators.has(sectionId)) {
      instances.rotators.get(sectionId).destroy();
    }

    var rimgs = Array.prototype.slice.call(rotEl.querySelectorAll('.frame .pimg, .frame img'));
    var rdots = Array.prototype.slice.call(rotEl.querySelectorAll('.dots i'));
    var rcapB = rotEl.querySelector('.cap b');
    var rcapS = rotEl.querySelector('.cap span');
    if (!rimgs.length) return;

    var ri = 0;
    var rtimer = null;
    var speed = parseInt(rotEl.getAttribute('data-speed'), 10) || 2900;

    function step() {
      if (!rimgs.length) return;
      rimgs[ri].classList.remove('on');
      if (rdots[ri]) rdots[ri].classList.remove('on');
      ri = (ri + 1) % rimgs.length;
      rimgs[ri].classList.add('on');
      if (rdots[ri]) rdots[ri].classList.add('on');
      if (rcapB) rcapB.innerHTML = rimgs[ri].getAttribute('data-name') || '';
      if (rcapS) rcapS.textContent = rimgs[ri].getAttribute('data-note') || '';
    }

    var rotObserver = null;
    if (!reduce) {
      rotObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !rtimer && rimgs.length > 1) {
            rtimer = setInterval(step, speed);
          } else if (!e.isIntersecting && rtimer) {
            clearInterval(rtimer);
            rtimer = null;
          }
        });
      }, { threshold: 0.25 });
      rotObserver.observe(rotEl);
    }

    var instance = {
      destroy: function () {
        if (rtimer) clearInterval(rtimer);
        if (rotObserver) rotObserver.disconnect();
        instances.rotators.delete(sectionId);
      }
    };

    instances.rotators.set(sectionId, instance);
  }

  /* --------------------------------------------------------------------------
     6. AJAX CART & QUICK ADD
     -------------------------------------------------------------------------- */
  function initCartForms(container) {
    var root = container || document;
    var forms = root.querySelectorAll('form[action*="/cart/add"]');
    forms.forEach(function (form) {
      if (form.getAttribute('data-ajax-initialized')) return;
      form.setAttribute('data-ajax-initialized', 'true');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var submitBtn = form.querySelector('button[type="submit"], .btn');
        var originalText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Adding...';
        }

        var formData = new FormData(form);
        fetch('/cart/add.js', {
          method: 'POST',
          body: formData,
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (submitBtn) {
            submitBtn.innerHTML = 'Added! ✓';
            setTimeout(function () {
              submitBtn.innerHTML = originalText;
              submitBtn.disabled = false;
            }, 1800);
          }
          // Update cart badges
          fetch('/cart.js')
            .then(function (r) { return r.json(); })
            .then(function (cart) {
              var dots = document.querySelectorAll('.pl-dot');
              dots.forEach(function (d) { d.textContent = cart.item_count; });
            });
        })
        .catch(function (err) {
          console.error('Error adding to cart:', err);
          if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
          }
        });
      });
    });
  }

  /* --------------------------------------------------------------------------
     7. INITIALIZATION & SHOPIFY THEME EDITOR INTEGRATION
     -------------------------------------------------------------------------- */
  function initAll() {
    initScenesAndRail();
    initScrollReveals(document);
    initHeroStage(document);
    initProductRotator(document);
    initCartForms(document);

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);

    if (!reduce && window.matchMedia('(min-width: 1024px)').matches) {
      window.addEventListener('mousemove', function (e) {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
        requestTick();
      }, { passive: true });
    }

    requestTick();
  }

  // DOM Content Loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Shopify Theme Editor Lifecycle Events
  document.addEventListener('shopify:section:load', function (e) {
    var section = e.target;
    initScenesAndRail();
    initScrollReveals(section);
    initHeroStage(section);
    initProductRotator(section);
    initCartForms(section);
    requestTick();
  });

  document.addEventListener('shopify:section:unload', function (e) {
    var sectionId = e.target.getAttribute('data-section-id') || e.detail && e.detail.sectionId;
    if (sectionId && instances.heroStages.has(sectionId)) {
      instances.heroStages.get(sectionId).destroy();
    }
    if (sectionId && instances.rotators.has(sectionId)) {
      instances.rotators.get(sectionId).destroy();
    }
  });

  document.addEventListener('shopify:block:select', function (e) {
    var block = e.target;
    var slideIndex = block.getAttribute('data-slide-index');
    if (slideIndex !== null && block.closest('.hero')) {
      var heroStage = instances.heroStages.get(block.closest('.hero').getAttribute('data-section-id') || 'hero-default');
      if (heroStage) {
        heroStage.stop();
        heroStage.goTo(parseInt(slideIndex, 10));
      }
    }
  });

  // Export public API
  window.Purelane.init = initAll;
  window.Purelane.initHeroStage = initHeroStage;
  window.Purelane.initProductRotator = initProductRotator;
})();
