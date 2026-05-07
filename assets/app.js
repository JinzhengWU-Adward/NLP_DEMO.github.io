(async function () {
  const els = {
    pageTitle: document.querySelector('[data-site-title]'),
    pageDesc: document.querySelector('[data-site-desc]'),
    videoTitle: document.querySelector('[data-video-title]'),
    statusDot: document.querySelector('[data-status-dot]'),
    statusText: document.querySelector('[data-status-text]'),
    stage: document.querySelector('[data-video-stage]'),
    embedContainer: document.querySelector('[data-embed-container]'),
    placeholder: document.querySelector('[data-placeholder]'),
    placeholderNote: document.querySelector('[data-placeholder-note]'),
    cta: document.querySelector('[data-primary-cta]'),
    kvEmbedUrl: document.querySelector('[data-kv-embed-url]'),
    kvUpdatedAt: document.querySelector('[data-kv-updated-at]'),
  };

  function setText(el, text) {
    if (!el) return;
    el.textContent = (text ?? '').toString();
  }

  function setMeta(selector, value) {
    const el = document.querySelector(selector);
    if (!el) return;
    const v = (value ?? '').toString();
    if (el.tagName.toLowerCase() === 'link') el.setAttribute('href', v);
    else el.setAttribute('content', v);
  }

  function normalizeUrl(u) {
    const raw = (u ?? '').toString().trim();
    if (!raw.length) return '';
    try {
      return new URL(raw, window.location.href).toString();
    } catch {
      return raw;
    }
  }

  function setCta({ label, href }) {
    if (!els.cta) return;
    const hasHref = typeof href === 'string' && href.trim().length > 0;
    const hasLabel = typeof label === 'string' && label.trim().length > 0;
    if (!hasHref || !hasLabel) {
      els.cta.setAttribute('hidden', 'hidden');
      els.cta.removeAttribute('href');
      setText(els.cta, '');
      return;
    }
    els.cta.removeAttribute('hidden');
    els.cta.setAttribute('href', href);
    els.cta.setAttribute('rel', 'noopener noreferrer');
    els.cta.setAttribute('target', '_blank');
    setText(els.cta, label);
  }

  function setLive(isLive) {
    if (els.statusDot) els.statusDot.classList.toggle('live', !!isLive);
    setText(els.statusText, isLive ? 'Live' : 'ComingSoon');
  }

  function toEmbeddableUrl(raw) {
    const s = (raw ?? '').toString().trim();
    if (!s.length) return '';

    let u;
    try {
      u = new URL(s, window.location.href);
    } catch {
      return s;
    }

    const host = u.hostname.replace(/^www\./, '').toLowerCase();

    const ytBase = 'https://www.youtube-nocookie.com/embed/';

    function addCommonYouTubeParams(embed) {
      embed.searchParams.set('rel', '0');
      embed.searchParams.set('playsinline', '1');
      return embed;
    }

    // YouTube watch → embed
    if ((host === 'youtube.com' || host === 'm.youtube.com') && u.pathname === '/watch') {
      const id = u.searchParams.get('v');
      if (id) {
        const embed = new URL(`${ytBase}${id}`);
        // Keep only a small safe subset of params
        const start = u.searchParams.get('start') || u.searchParams.get('t');
        if (start) embed.searchParams.set('start', String(start).replace(/[^\d]/g, ''));
        return addCommonYouTubeParams(embed).toString();
      }
    }

    // youtu.be/<id> → embed
    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) {
        const embed = new URL(`${ytBase}${id}`);
        const t = u.searchParams.get('t');
        if (t) embed.searchParams.set('start', String(t).replace(/[^\d]/g, ''));
        return addCommonYouTubeParams(embed).toString();
      }
    }

    return u.toString();
  }

  function renderEmbed(embedUrl) {
    const raw = (embedUrl ?? '').toString().trim();
    const url = toEmbeddableUrl(raw);
    setText(els.kvEmbedUrl, raw.length ? raw : '(empty)');

    if (!els.embedContainer || !els.placeholder) return;

    if (!url.length) {
      els.embedContainer.replaceChildren();
      els.placeholder.removeAttribute('hidden');
      setLive(false);
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.loading = 'lazy';
    iframe.allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';

    els.embedContainer.replaceChildren(iframe);
    els.placeholder.setAttribute('hidden', 'hidden');
    setLive(true);
  }

  async function loadConfig() {
    const res = await fetch('./site.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load site.json: ${res.status}`);
    return await res.json();
  }

  try {
    const cfg = await loadConfig();
    const title = cfg?.site?.title ?? 'Video Demo';
    const desc = cfg?.site?.description ?? '';
    const lang = cfg?.site?.lang ?? 'zh-CN';

    document.documentElement.lang = lang;
    document.title = title;
    setText(els.pageTitle, title);
    setText(els.pageDesc, desc);

    const canonical = normalizeUrl(window.location.pathname || '/');
    setMeta('link[data-link="canonical"]', canonical);
    setMeta('meta[data-meta="description"]', desc);
    setMeta('meta[data-meta="og:title"]', title);
    setMeta('meta[data-meta="og:description"]', desc);
    setMeta('meta[data-meta="twitter:title"]', title);
    setMeta('meta[data-meta="twitter:description"]', desc);
    setMeta('meta[data-meta="og:url"]', normalizeUrl(window.location.href));

    setText(els.videoTitle, cfg?.video?.title ?? '视频');
    setText(els.placeholderNote, cfg?.video?.note ?? '');
    setCta({
      label: cfg?.links?.primaryCtaLabel ?? '',
      href: cfg?.links?.primaryCtaHref ?? '',
    });

    const updatedAt = new Date().toISOString();
    setText(els.kvUpdatedAt, updatedAt);

    const cover = normalizeUrl('assets/cover.svg');
    setMeta('meta[data-meta="og:image"]', cover);
    setMeta('meta[data-meta="twitter:image"]', cover);

    renderEmbed(cfg?.video?.embedUrl ?? '');
  } catch (err) {
    setLive(false);
    setText(els.pageTitle, 'NLP Demo');
    setText(els.pageDesc, '页面配置加载失败。请检查 site.json 是否存在且为有效 JSON。');
    setText(els.videoTitle, '演示视频');
    setText(els.placeholderNote, String(err?.message ?? err));
    renderEmbed('');
  }
})();
