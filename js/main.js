/* Halloween — FAETEC Miracema
   Partículas, trilha sintética, linha do tempo, abas, carrossel,
   galeria, caldeirão e revelação no scroll. Sem frameworks. */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection && navigator.connection.saveData;

  function boot(name, fn) {
    try {
      fn();
    } catch (err) {
      console.error(name, err);
    }
  }

  boot("revelar", function () {
    const nodes = document.querySelectorAll(".reveal");
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach((node) => io.observe(node));
    const hero = document.querySelector(".hero__content");
    if (hero) hero.classList.add("is-in");
  });

  boot("particulas", function () {
    const canvas = document.getElementById("particles");
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const total = (saveData || window.innerWidth < 700) ? 18 : 36;
    const pieces = [];

    function spawn(i) {
      const kind = i < total - 12 ? "ember" : i < total - 4 ? "leaf" : "mist";
      const piece = {
        kind,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: kind === "mist" ? 28 + Math.random() * 26 : 0.7 + Math.random() * 1.8,
        vy: kind === "leaf" ? 0.35 + Math.random() * 0.55 : kind === "mist" ? 0.08 : -(0.25 + Math.random() * 0.7),
        vx: (Math.random() - 0.5) * (kind === "mist" ? 0.25 : 0.35),
        a: kind === "mist" ? 0.035 + Math.random() * 0.03 : 0.25 + Math.random() * 0.55,
        hue: Math.random() > 0.86 ? 110 : 24,
        rot: Math.random() * Math.PI
      };
      return piece;
    }

    for (let i = 0; i < total; i += 1) pieces.push(spawn(i));

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    let running = false;

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      pieces.forEach((p) => {
        p.x += p.vx + (p.kind === "leaf" ? Math.sin(p.y * 0.02) * 0.3 : 0);
        p.y += p.vy;
        p.rot += 0.01;
        if (p.kind === "leaf") {
          if (p.y > window.innerHeight + 16) {
            p.y = -16;
            p.x = Math.random() * window.innerWidth;
          }
        } else if (p.y < -30 || p.y > window.innerHeight + 40) {
          p.y = p.vy < 0 ? window.innerHeight + 10 : -20;
          p.x = Math.random() * window.innerWidth;
        }
        if (p.x < -40) p.x = window.innerWidth + 20;
        if (p.x > window.innerWidth + 40) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.kind === "leaf") {
          ctx.rotate(p.rot);
          ctx.fillStyle = `hsla(22, 78%, 42%, ${p.a})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r * 2.4, p.r, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === "mist") {
          ctx.fillStyle = `hsla(282, 55%, 46%, ${p.a})`;
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `hsla(${p.hue}, 100%, 58%, ${p.a * 0.28})`;
          ctx.beginPath();
          ctx.arc(0, 0, p.r * 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.a})`;
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      requestAnimationFrame(draw);
    }

    function start() {
      if (running || document.hidden) return;
      running = true;
      requestAnimationFrame(draw);
    }

    function stop() {
      running = false;
    }

    resize();
    start();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });
  });

  boot("som", function () {
    const buttons = document.querySelectorAll(".js-sound");
    if (!buttons.length || !window.AudioContext) return;

    let ctx;
    let master;
    let on = false;
    let hootTimer = 0;

    function paint() {
      buttons.forEach((btn) => {
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        const label = on ? btn.dataset.on : btn.dataset.off;
        btn.setAttribute("aria-label", label);
        const text = btn.querySelector(".sound__label");
        if (text) text.textContent = text.dataset[on ? "on" : "off"];
      });
    }

    function tone(freq, when, dur) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, when);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.68), when + dur);
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.exponentialRampToValueAtTime(0.045, when + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      osc.connect(gain).connect(master);
      osc.start(when);
      osc.stop(when + dur + 0.02);
    }

    function playHoot() {
      if (!on || !ctx) return;
      const t = ctx.currentTime + 0.05;
      tone(523, t, 0.22);
      tone(392, t + 0.26, 0.36);
    }

    function scheduleHoot() {
      window.clearTimeout(hootTimer);
      if (!on) return;
      hootTimer = window.setTimeout(() => {
        playHoot();
        scheduleHoot();
      }, 8000 + Math.random() * 9000);
    }

    function build() {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      const seconds = 2;
      const buffer = ctx.createBuffer(1, seconds * ctx.sampleRate, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 380;
      const wind = ctx.createGain();
      wind.gain.value = 0.14;
      noise.connect(filter).connect(wind).connect(master);
      noise.start();

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.08;
      lfoGain.gain.value = 140;
      lfo.connect(lfoGain).connect(filter.frequency);
      lfo.start();
    }

    async function toggle() {
      if (!ctx) build();
      if (ctx.state === "suspended") await ctx.resume();
      on = !on;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setTargetAtTime(on ? 0.55 : 0, now, 0.08);
      paint();
      scheduleHoot();
    }

    buttons.forEach((btn) => btn.addEventListener("click", () => {
      toggle().catch((err) => console.error(err));
    }));
    document.addEventListener("visibilitychange", () => {
      if (!ctx || !master) return;
      const now = ctx.currentTime;
      master.gain.setTargetAtTime(!document.hidden && on ? 0.55 : 0, now, 0.05);
    });
  });

  boot("menu", function () {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.getElementById("menu");
    if (!toggle || !menu) return;

    function close() {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  });

  boot("scroll", function () {
    const bar = document.querySelector(".progress__bar");
    const top = document.querySelector(".top");
    const links = document.querySelectorAll(".nav a");
    const sections = [...document.querySelectorAll("main section")];
    let ticking = false;

    function paint() {
      ticking = false;
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? scrolled / max : 0})`;
      if (top) top.classList.toggle("is-on", scrolled > 520);
      let current = sections[0] && sections[0].id;
      sections.forEach((sec) => {
        if (sec.getBoundingClientRect().top <= 150) current = sec.id;
      });
      links.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`);
      });
    }

    function requestPaint() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    }

    paint();
    window.addEventListener("scroll", requestPaint, { passive: true });
    window.addEventListener("resize", requestPaint, { passive: true });
  });

  boot("abobora", function () {
    const button = document.getElementById("pumpkin-toggle");
    const hero = document.getElementById("hero");
    const hint = document.getElementById("pumpkin-hint");
    if (!button || !hero) return;
    button.addEventListener("click", () => {
      const lit = button.classList.toggle("is-lit");
      hero.classList.toggle("is-lit", lit);
      button.setAttribute("aria-pressed", lit ? "true" : "false");
      button.setAttribute("aria-label", lit ? "Apagar a abóbora" : "Acender a abóbora");
      if (hint) hint.textContent = lit ? "A vela está acesa." : "Toque na abóbora para acender a vela.";
    });
  });

  boot("linha", function () {
    const items = [...document.querySelectorAll(".t-item")];
    items.forEach((item) => {
      const btn = item.querySelector(".t-btn");
      btn.addEventListener("click", () => {
        const willOpen = !item.classList.contains("is-open");
        items.forEach((other) => {
          other.classList.remove("is-open");
          other.querySelector(".t-btn").setAttribute("aria-expanded", "false");
        });
        if (willOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  });

  boot("abas", function () {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    if (!tabs.length) return;

    function activate(index, focus) {
      tabs.forEach((tab, i) => {
        const selected = i === index;
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(tab.getAttribute("aria-controls"));
        if (!panel) return;
        if (selected) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      });
      if (focus) tabs[index].focus();
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(index, false));
      tab.addEventListener("keydown", (event) => {
        let next = null;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        activate(next, true);
      });
    });
  });

  boot("carrossel", function () {
    const root = document.getElementById("carousel");
    if (!root) return;
    const viewport = root.querySelector(".carousel__viewport");
    const track = root.querySelector(".track");
    const slides = [...track.children];
    const dots = root.querySelector(".dots");
    const status = root.querySelector(".carousel-status");
    const prev = root.querySelector("[data-dir='-1']");
    const next = root.querySelector("[data-dir='1']");
    let index = 0;
    let pointerId = null;
    let startX = 0;
    let delta = 0;
    let dragged = false;

    function perView() {
      if (window.innerWidth >= 1040) return 3;
      if (window.innerWidth >= 720) return 2;
      return 1;
    }

    function pages() {
      return Math.max(1, slides.length - perView() + 1);
    }

    function render() {
      const view = perView();
      const total = pages();
      index = ((index % total) + total) % total;
      slides.forEach((slide) => {
        slide.style.flexBasis = `${100 / view}%`;
      });
      track.style.transform = `translateX(-${(index * 100) / view}%)`;
      if (dots.childElementCount !== total) {
        dots.replaceChildren();
        for (let i = 0; i < total; i += 1) {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "dot";
          dot.addEventListener("click", () => {
            index = i;
            render();
          });
          dots.append(dot);
        }
      }
      [...dots.children].forEach((dot, i) => {
        dot.setAttribute("aria-label", `Mostrar grupo ${i + 1} de ${total}`);
        if (i === index) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      const bar = root.querySelector(".carousel__bar");
      if (bar) bar.hidden = total <= 1;
      if (status) status.textContent = `Grupo ${index + 1} de ${total}`;
    }

    function go(dir) {
      index += dir;
      render();
    }

    prev.addEventListener("click", () => go(-1));
    next.addEventListener("click", () => go(1));
    root.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      go(event.key === "ArrowRight" ? 1 : -1);
    });

    viewport.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      delta = 0;
      dragged = false;
      viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener("pointermove", (event) => {
      if (event.pointerId !== pointerId) return;
      delta = event.clientX - startX;
      if (Math.abs(delta) < 8) return;
      dragged = true;
      track.classList.add("is-dragging");
      const view = perView();
      track.style.transform = `translateX(calc(-${(index * 100) / view}% + ${delta}px))`;
    });

    function end(event) {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      track.classList.remove("is-dragging");
      if (delta <= -48) go(1);
      else if (delta >= 48) go(-1);
      else render();
      delta = 0;
    }

    viewport.addEventListener("pointerup", end);
    viewport.addEventListener("pointercancel", end);
    viewport.addEventListener("click", (event) => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    }, true);

    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(render, 120);
    }, { passive: true });
    render();
  });

  boot("galeria", function () {
    const cards = [...document.querySelectorAll(".gcard")];
    const filters = [...document.querySelectorAll(".filters button")];
    const dialog = document.getElementById("lightbox");
    if (!cards.length || !dialog) return;
    const art = document.getElementById("lightbox-art");
    const title = document.getElementById("lightbox-title");
    const text = document.getElementById("lightbox-text");
    const tag = document.getElementById("lightbox-tag");

    function show(card, visible) {
      if (visible) {
        card.classList.remove("is-gone");
        requestAnimationFrame(() => card.classList.remove("is-fading"));
        return;
      }
      card.classList.add("is-fading");
      window.setTimeout(() => {
        if (card.classList.contains("is-fading")) card.classList.add("is-gone");
      }, reduce ? 0 : 360);
    }

    filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        filters.forEach((item) => item.setAttribute("aria-pressed", item === btn ? "true" : "false"));
        const cat = btn.dataset.filter;
        cards.forEach((card) => show(card, cat === "all" || card.dataset.cat === cat));
      });
    });

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const svg = card.querySelector("svg");
        art.replaceChildren(svg ? svg.cloneNode(true) : document.createTextNode(""));
        tag.textContent = card.querySelector(".tag").textContent;
        title.textContent = card.querySelector(".g-title").textContent;
        text.textContent = card.querySelector(".g-text").textContent;
        dialog.showModal();
      });
    });

    dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  boot("pocao", function () {
    const root = document.getElementById("potion-maker");
    if (!root) return;
    const buttons = [...root.querySelectorAll("[data-ingredient]")];
    const slots = document.getElementById("slots");
    const brew = document.getElementById("brew");
    const kettle = document.getElementById("kettle");
    const liquid = document.getElementById("liquid");
    const result = document.getElementById("potion-result");
    const names = {
      asa: "Asa de morcego",
      olho: "Olho de corvo",
      petala: "Pétala negra",
      lagrima: "Lágrima de fantasma",
      po: "Pó de osso",
      teia: "Teia ancestral",
      raiz: "Mandrágora",
      brasa: "Brasa de abóbora"
    };
    const flavors = {
      asa: "um sopro de voo curto",
      olho: "um olhar que não pisca",
      petala: "perfume de rosa que esqueceu o dia",
      lagrima: "sal de uma história antiga",
      po: "poeira clara sob a lua",
      teia: "fio que lembra o caminho de volta",
      raiz: "raiz que gritou e depois sossegou",
      brasa: "calor de lanterna recém-acesa"
    };
    const specials = {
      "asa|brasa|teia": ["Manto de Cinzas", "A asa carrega a brasa e a teia segura o calor. Quem bebe caminha sem acender vela — e mesmo assim não tropeça."],
      "lagrima|olho|petala": ["Espelho da Chorona", "Três tristezas bonitas, nenhuma cruel. A poção embacia o espelho e devolve só o nome de quem a gente quer lembrar."],
      "brasa|po|raiz": ["Lanterna de Jack", "A brasa entra no pó, a raiz dá corpo. No fim, a mistura pisca como abóbora recém-cortada na escada."],
      "olho|po|teia": ["Véu do Corvo", "O corvo empresta o olho, a teia faz a cortina. Serve para escutar uma história antiga sem inventar o final."],
      "asa|lagrima|raiz": ["Voo entre Mundos", "Uma asa, uma lágrima, uma raiz. A poção não abre portão nenhum: só deixa a noite parecer um pouco mais larga."],
      "brasa|petala|teia": ["Doce Amargo", "Cheira a flor queimada e a fio doce. É a poção das festas: alegre na borda, séria no fundo."],
      "lagrima|olho|po": ["Soro da Meia-Noite", "Transparente até a última gota. Dizem que mostra a hora em que o relógio esquece de bater."],
      "asa|brasa|petala": ["Fogo de Samhain", "A última fogueira da colheita, em três goles. Esquenta as mãos e não assusta a mesa."]
    };
    const fallbackNames = ["Bruma de Samhain", "Chá das Duas Luas", "Tinta de Abóbora", "Sussurro Verde", "Elixir do Corredor", "Orvalho Roxo"];
    const fallbackEffects = [
      "deixa as sombras educadas, pelo menos até a meia-noite.",
      "faz qualquer história de terror terminar com a luz do corredor acesa.",
      "pinta a língua de outono e a coragem de um tom mais firme.",
      "acende vaga-lumes imaginários no teto da sala.",
      "transforma o vento da janela em trilha sonora, sem aumentar o volume.",
      "guarda um segredo pequeno e devolve em forma de risada."
    ];
    const colors = ["#39ff14", "#ff6b00", "#c026d3", "#67e8f9", "#facc15", "#fb7185"];
    let picked = [];
    let brewing = false;

    function hash(value) {
      let h = 0;
      for (let i = 0; i < value.length; i += 1) h = (h * 33 + value.charCodeAt(i)) >>> 0;
      return h;
    }

    function craft(list) {
      const key = [...list].sort().join("|");
      if (specials[key]) {
        return { name: specials[key][0], text: specials[key][1], color: colors[hash(key) % colors.length] };
      }
      const h = hash(key);
      const notes = list.map((id) => flavors[id]).join(", ");
      return {
        name: fallbackNames[h % fallbackNames.length],
        text: `Três notas — ${notes} — assentam no fundo do caldeirão. A poção ${fallbackEffects[h % fallbackEffects.length]}`,
        color: colors[h % colors.length]
      };
    }

    function renderSlots() {
      slots.replaceChildren();
      for (let i = 0; i < 3; i += 1) {
        const slot = document.createElement("span");
        slot.className = picked[i] ? "slot is-filled" : "slot";
        slot.textContent = picked[i] ? names[picked[i]] : "vazio";
        slots.append(slot);
      }
      buttons.forEach((btn) => {
        btn.setAttribute("aria-pressed", picked.includes(btn.dataset.ingredient) ? "true" : "false");
      });
      brew.disabled = picked.length !== 3 || brewing;
    }

    function renderResult(potion) {
      result.replaceChildren();
      const eye = document.createElement("p");
      eye.className = "eyebrow";
      eye.textContent = "Poção pronta";
      const heading = document.createElement("h3");
      heading.textContent = potion.name;
      const copy = document.createElement("p");
      copy.textContent = potion.text;
      const reset = document.createElement("button");
      reset.type = "button";
      reset.className = "btn btn--ghost";
      reset.dataset.reset = "true";
      reset.textContent = "Esvaziar o caldeirão";
      result.append(eye, heading, copy, reset);
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.ingredient;
        const at = picked.indexOf(id);
        if (at >= 0) picked.splice(at, 1);
        else if (picked.length < 3) picked.push(id);
        else {
          kettle.classList.remove("shake");
          void kettle.offsetWidth;
          kettle.classList.add("shake");
          result.textContent = "O caldeirão aceita só três ingredientes. Retire um para trocar.";
        }
        renderSlots();
      });
    });

    brew.addEventListener("click", () => {
      if (brewing || picked.length !== 3) return;
      brewing = true;
      brew.disabled = true;
      const potion = craft(picked);
      liquid.style.setProperty("--liquid", potion.color);
      kettle.classList.add("is-hot", "shake");
      result.textContent = "O fogo está aceso…";
      window.setTimeout(() => {
        brewing = false;
        kettle.classList.remove("shake");
        renderResult(potion);
        renderSlots();
      }, reduce ? 0 : 850);
    });

    result.addEventListener("click", (event) => {
      if (!event.target.closest("[data-reset]")) return;
      picked = [];
      kettle.classList.remove("is-hot", "shake");
      liquid.style.removeProperty("--liquid");
      result.textContent = "Escolha três ingredientes e acenda o fogo.";
      renderSlots();
    });

    renderSlots();
  });

  boot("inclinacao", function () {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  });

  boot("ano", function () {
    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  });
}());
