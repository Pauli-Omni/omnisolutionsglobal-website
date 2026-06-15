(function () {
  'use strict';

  var STAR_COUNT = 58;
  var HIT_RADIUS = 28;
  var MAX_CHAIN = 4;
  var POINTER_COOLDOWN = 380;
  var CHAIN_STEP_MS = 140;

  var GLOW_A = { r: 72, g: 188, b: 220 };
  var GLOW_B = { r: 0, g: 229, b: 255 };

  function dist(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function jaggedPath(x1, y1, x2, y2, seed) {
    var pts = [{ x: x1, y: y1 }];
    var segments = 4;
    var i;
    for (i = 1; i < segments; i++) {
      var t = i / segments;
      var jitter = (1 - Math.abs(t - 0.5) * 1.4) * 7;
      pts.push({
        x: x1 + (x2 - x1) * t + Math.sin(seed + i * 1.7) * jitter,
        y: y1 + (y2 - y1) * t + Math.cos(seed + i * 2.1) * jitter
      });
    }
    pts.push({ x: x2, y: y2 });
    return pts;
  }

  function boltColor(depth, fade) {
    var c = depth % 2 === 0 ? GLOW_A : GLOW_B;
    return 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + fade + ')';
  }

  function mountStarfield(host) {
    if (!host || host.dataset.starfieldMounted === '1') return null;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var layer = document.createElement('div');
    layer.className = 'home-starfield';
    layer.setAttribute('aria-hidden', 'true');

    var canvas = document.createElement('canvas');
    canvas.className = 'home-starfield__canvas';
    layer.appendChild(canvas);
    host.insertBefore(layer, host.firstChild);
    host.dataset.starfieldMounted = '1';

    var ctx = canvas.getContext('2d');
    var stars = [];
    var bolts = [];
    var width = 0;
    var height = 0;
    var dpr = 1;
    var lastPointer = 0;
    var chaining = false;
    var rafId = 0;
    var active = true;

    function resize() {
      var rect = layer.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!stars.length) {
        var n;
        for (n = 0; n < STAR_COUNT; n++) {
          stars.push({
            id: n,
            x: Math.random() * width,
            y: Math.random() * height * 0.94,
            r: 0.7 + Math.random() * 1.35,
            phase: Math.random() * Math.PI * 2,
            glow: 0
          });
        }
      }
    }

    function nearestStar(px, py) {
      var best = null;
      var bestD = HIT_RADIUS;
      stars.forEach(function (s) {
        var d = Math.hypot(s.x - px, s.y - py);
        if (d < bestD) {
          bestD = d;
          best = s;
        }
      });
      return best;
    }

    function addBolt(from, to, depth) {
      bolts.push({
        from: from,
        to: to,
        born: performance.now(),
        life: 260,
        seed: Math.random() * 20,
        depth: depth
      });
      to.glow = Math.min(0.42, to.glow + 0.28);
    }

    function chainFrom(star, depth, visited) {
      if (depth >= MAX_CHAIN || !star || !active) {
        if (depth >= MAX_CHAIN || !star) {
          window.setTimeout(function () { chaining = false; }, 120);
        }
        return;
      }
      visited[star.id] = true;

      var next = null;
      var bestD = Infinity;
      stars.forEach(function (s) {
        if (visited[s.id]) return;
        var d = dist(star, s);
        if (d < bestD) {
          bestD = d;
          next = s;
        }
      });

      if (!next) {
        chaining = false;
        return;
      }

      window.setTimeout(function () {
        if (!active) return;
        addBolt(star, next, depth);
        chainFrom(next, depth + 1, visited);
      }, CHAIN_STEP_MS);
    }

    function onPointer(clientX, clientY) {
      if (reduced || !active || chaining) return;
      var now = performance.now();
      if (now - lastPointer < POINTER_COOLDOWN) return;

      var rect = layer.getBoundingClientRect();
      if (clientY < rect.top || clientY > rect.bottom) return;
      if (clientX < rect.left || clientX > rect.right) return;

      var star = nearestStar(clientX - rect.left, clientY - rect.top);
      if (!star) return;

      lastPointer = now;
      chaining = true;
      star.glow = 0.38;
      chainFrom(star, 0, {});
    }

    function draw(now) {
      if (!active) return;
      ctx.clearRect(0, 0, width, height);

      stars.forEach(function (s) {
        var tw = 0.42 + Math.sin(now * 0.0016 + s.phase) * 0.28;
        var alpha = 0.38 + tw * 0.35 + s.glow * 0.28;
        s.glow *= 0.9;

        var starC = s.glow > 0.08 ? GLOW_B : GLOW_A;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r + s.glow * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220, 238, 248, ' + alpha + ')';
        ctx.shadowBlur = 4 + s.glow * 8;
        ctx.shadowColor = 'rgba(' + starC.r + ', ' + starC.g + ', ' + starC.b + ', 0.45)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      bolts = bolts.filter(function (b) {
        var t = (now - b.born) / b.life;
        if (t >= 1) return false;

        var fade = (1 - t) * 0.55;
        var pts = jaggedPath(b.from.x, b.from.y, b.to.x, b.to.y, b.seed);
        var grad = ctx.createLinearGradient(b.from.x, b.from.y, b.to.x, b.to.y);
        grad.addColorStop(0, boltColor(b.depth, fade * 0.85));
        grad.addColorStop(1, boltColor(b.depth + 1, fade * 0.45));

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        pts.slice(1).forEach(function (p) { ctx.lineTo(p.x, p.y); });
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.65 + fade * 0.35;
        ctx.shadowBlur = 6 * fade;
        ctx.shadowColor = boltColor(b.depth, fade * 0.5);
        ctx.stroke();
        ctx.shadowBlur = 0;
        return true;
      });

      rafId = window.requestAnimationFrame(draw);
    }

    function onMove(e) {
      onPointer(e.clientX, e.clientY);
    }

    function onTouch(e) {
      if (!e.touches || !e.touches[0]) return;
      onPointer(e.touches[0].clientX, e.touches[0].clientY);
    }

    host.addEventListener('mousemove', onMove);
    host.addEventListener('touchstart', onTouch, { passive: true });

    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(resize);
      ro.observe(layer);
    } else {
      window.addEventListener('resize', resize);
    }

    resize();
    if (!reduced) {
      rafId = window.requestAnimationFrame(draw);
    } else {
      draw(performance.now());
    }

    return {
      pause: function () {
        active = false;
        chaining = false;
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
      },
      resume: function () {
        if (active || reduced) return;
        active = true;
        rafId = window.requestAnimationFrame(draw);
      },
      destroy: function () {
        active = false;
        chaining = false;
        if (rafId) window.cancelAnimationFrame(rafId);
        host.removeEventListener('mousemove', onMove);
        host.removeEventListener('touchstart', onTouch);
        if (layer.parentNode) layer.parentNode.removeChild(layer);
        delete host.dataset.starfieldMounted;
      }
    };
  }

  function initHomeStarfield() {
    if (document.body.getAttribute('data-page') !== 'home') return;

    var splash = document.querySelector('.home-splash');
    var portal = document.getElementById('portal-overlay');
    var instances = [];

    if (splash) instances.push(mountStarfield(splash));
    if (portal) {
      var portalField = mountStarfield(portal);
      instances.push(portalField);

      if (portalField) {
        var portalBtn = document.getElementById('portal-enter-btn');
        if (portalBtn) {
          portalBtn.addEventListener('click', function () {
            portalField.pause();
          });
        }
        var obs = new MutationObserver(function () {
          if (portal.classList.contains('portal-hidden')) {
            portalField.pause();
          } else if (!portal.classList.contains('portal-hidden')) {
            portalField.resume();
          }
        });
        obs.observe(portal, { attributes: true, attributeFilter: ['class'] });
      }
    }

    window.addEventListener('pagehide', function () {
      instances.forEach(function (inst) {
        if (inst && inst.destroy) inst.destroy();
      });
    });
  }

  window.OSGHomeStarfield = {
    init: initHomeStarfield
  };
})();
