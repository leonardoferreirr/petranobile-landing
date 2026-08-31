/* PETRA NOBILE — comportamento da pagina */
(function () {
  'use strict';

  var NUM = '5511967698486';
  var MSG = 'Ola! Vim pelo site da Petra Nobile e quero um orcamento de revestimento em pedra natural.';

  /* Todo CTA de WhatsApp passa por obrigado.html antes de abrir a conversa.
     A pagina intermediaria dispara o evento de conversao e so entao redireciona;
     link direto pro wa.me sai do site sem deixar rastro de que o lead converteu.

     A mensagem vai por dois caminhos, de proposito. A query e o caminho normal,
     mas quem serve o site com URL limpa redireciona /obrigado.html para
     /obrigado, e ha servidor que descarta a query nesse pulo -- o lead chega no
     WhatsApp sem nada escrito, justamente o que o formulario existe pra evitar.
     O sessionStorage sobrevive ao redirecionamento e cobre esse caso. */
  function ponte(msg) {
    return 'obrigado.html?n=' + NUM + '&t=' + encodeURIComponent(msg || MSG);
  }
  /* Guardar no CLIQUE, nunca ao montar os href: o laco abaixo passa por todos
     os CTAs, e gravar ali faria o ultimo link sobrescrever a mensagem de todos
     os outros. O lead do showroom chegaria com a frase do rodape. */
  function guarda(msg) {
    try { sessionStorage.setItem('pn_wa', JSON.stringify({ n: NUM, t: msg || MSG })); } catch (e) {}
  }
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    var msg = a.dataset.wa || '';
    a.href = ponte(msg);
    a.addEventListener('click', function () { guarda(msg); });
  });

  /* nav: fundo solido depois que sai do topo -------------------------------- */
  var nav = document.querySelector('.nav');
  var ultimo = -1;
  function pintaNav() {
    var fixa = window.scrollY > 40;
    if (fixa === ultimo) return;
    ultimo = fixa;
    nav.toggleAttribute('data-fixa', fixa);
  }
  pintaNav();
  addEventListener('scroll', pintaNav, { passive: true });

  /* gaveta mobile ----------------------------------------------------------- */
  var burger = document.querySelector('.burger');
  var gaveta = document.getElementById('gaveta');
  function fecha() {
    gaveta.removeAttribute('data-aberta');
    document.body.classList.remove('travado');
    burger.setAttribute('aria-expanded', 'false');
  }
  burger.addEventListener('click', function () {
    var aberta = gaveta.toggleAttribute('data-aberta');
    document.body.classList.toggle('travado', aberta);
    burger.setAttribute('aria-expanded', aberta ? 'true' : 'false');
  });
  gaveta.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', fecha); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') fecha(); });

  /* entrada das secoes ------------------------------------------------------ */
  var alvos = document.querySelectorAll('[data-sobe]');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('dentro'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    alvos.forEach(function (el) { obs.observe(el); });
  } else {
    alvos.forEach(function (el) { el.classList.add('dentro'); });
  }

  /* carrossel de pedras ------------------------------------------------------
     O carregamento das fotos e nosso, nao do navegador: dentro de um elemento
     que sofre transform, o loading="lazy" erra para os dois lados, ou baixa a
     pista inteira de uma vez ou nunca baixa o que entrou em cena. Entao os
     cards fora da janela inicial nascem com data-src e a gente promove pra src
     conforme o carrossel anda. */
  var EAGER = 4;
  document.querySelectorAll('[data-car]').forEach(function (car) {
    var pista = car.querySelector('.car__pista');
    var cards = [].slice.call(pista.children);
    var ant = car.querySelector('.car__nav--ant');
    var prox = car.querySelector('.car__nav--prox');
    var vis = EAGER;

    function destravar() {
      // uma folga de 2 cards para a frente, senao a foto aparece depois do slide
      for (var i = 0; i < Math.min(vis + 2, cards.length); i++) {
        var img = cards[i].querySelector('img[data-src]');
        if (img) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
      }
    }

    function medir() {
      var largura = cards[0] ? cards[0].getBoundingClientRect().width : 1;
      var gap = parseFloat(getComputedStyle(pista).columnGap) || 0;
      vis = Math.max(1, Math.round(pista.clientWidth / (largura + gap)));
      destravar();
      pinta();
      return largura + gap;
    }

    function pinta() {
      if (!ant) return;
      var fim = pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 4;
      ant.disabled = pista.scrollLeft <= 2;
      prox.disabled = fim;
    }

    function anda(dir) {
      var passo = medir();
      var alvo = pista.scrollLeft + dir * passo * Math.max(1, vis - 1);
      vis += dir > 0 ? Math.max(1, vis - 1) : 0;
      destravar();
      pista.scrollTo({ left: alvo, behavior: 'smooth' });
    }

    if (ant) {
      ant.addEventListener('click', function () { anda(-1); });
      prox.addEventListener('click', function () { anda(1); });
    }
    pista.addEventListener('scroll', function () {
      var largura = cards[0] ? cards[0].getBoundingClientRect().width : 1;
      var gap = parseFloat(getComputedStyle(pista).columnGap) || 0;
      vis = Math.max(vis, Math.ceil((pista.scrollLeft + pista.clientWidth) / (largura + gap)));
      destravar();
      pinta();
    }, { passive: true });
    addEventListener('resize', medir, { passive: true });
    medir();
  });

  /* formulario: leva os dados para o WhatsApp -------------------------------- */
  var form = document.getElementById('lead');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var nome = (d.get('nome') || '').toString().trim();
      var pedra = (d.get('pedra') || '').toString().trim();
      var m2 = (d.get('m2') || '').toString().trim();
      var obs = (d.get('obs') || '').toString().trim();

      var texto = 'Ola! Meu nome e ' + nome + ' e vim pelo site da Petra Nobile.';
      if (pedra && pedra !== 'Ainda não sei') texto += ' Tenho interesse em ' + pedra + '.';
      if (pedra === 'Ainda não sei') texto += ' Ainda nao sei qual pedra, gostaria de orientacao.';
      if (m2) texto += ' A area e de aproximadamente ' + m2 + ' m2.';
      if (obs) texto += ' ' + obs;

      guarda(texto);
      location.href = ponte(texto);
    });
  }

  /* ano do rodape ------------------------------------------------------------ */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
