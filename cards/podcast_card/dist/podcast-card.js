// Podcast Card v1.4.0 — grid/list of podcast episodes loaded from a JSON manifest.
// Plays via Music Assistant (music_assistant.play_media) using the absolute URL.

const CARD_VERSION = "1.4.0";

const SORT_OPTIONS = [
    { value: "title", icon: "mdi:sort-alphabetical-ascending", label: "Título" },
    { value: "duration", icon: "mdi:sort-clock-descending-outline", label: "Duração" },
];

class PodcastCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this._search = "";
        this._sort = "title";
        this._view = "grid";
        this._loaded = false;
        this._episodes = null;
        this._podcast = null;
        this._error = null;
        this._currentNum = null;

        // HA listens for keyboard shortcuts (e/c/m/d) on window. We register on window
        // in capture phase so we run before any bubble/listener HA has, and we also register
        // on document capture as a safety net. We stop propagation when the event originated
        // inside this card's shadow tree.
        this._blockHaShortcuts = (e) => {
            if (!this.shadowRoot) return;
            const path = e.composedPath();
            if (!path.includes(this.shadowRoot)) return;
            const target = path[0];
            const tag = target?.tagName;
            if (
                tag === "INPUT" ||
                tag === "TEXTAREA" ||
                target?.isContentEditable
            ) {
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        };
    }

    connectedCallback() {
        for (const evt of ["keydown", "keyup", "keypress"]) {
            window.addEventListener(evt, this._blockHaShortcuts, true);
            document.addEventListener(evt, this._blockHaShortcuts, true);
        }
    }

    disconnectedCallback() {
        for (const evt of ["keydown", "keyup", "keypress"]) {
            window.removeEventListener(evt, this._blockHaShortcuts, true);
            document.removeEventListener(evt, this._blockHaShortcuts, true);
        }
    }

    static getStubConfig() {
        return {
            media_player: "media_player.colunas_casa",
            base_path: "/local/podcasts",
            columns: 3,
            max_height: 600,
        };
    }

    setConfig(config) {
        if (!config.media_player) {
            throw new Error("media_player is required");
        }
        this._config = {
            media_player: config.media_player,
            base_path: (config.base_path || "/local/podcasts").replace(/\/$/, ""),
            columns: Number(config.columns) || 3,
            title: config.title,
            show_search: config.show_search !== false,
            show_random: config.show_random !== false,
            show_view_toggle: config.show_view_toggle !== false,
            enqueue: config.enqueue || "replace",
            sort: SORT_OPTIONS.some((o) => o.value === config.sort) ? config.sort : "title",
            max_height: Number(config.max_height) || 600,
            default_view: config.default_view === "list" ? "list" : "grid",
        };
        this._sort = this._config.sort;
        this._view = this._config.default_view;
        this._renderState = null;
        this._render();
    }

    set hass(hass) {
        this._hass = hass;
        if (!this._loaded) {
            this._loadEpisodes();
            return;
        }
        const detected = this._detectCurrent();
        const mp = hass.states[this._config.media_player];
        const playState = mp?.state || "unknown";
        if (
            detected !== this._currentNum ||
            playState !== this._lastPlayState
        ) {
            if (detected !== null) this._currentNum = detected;
            this._lastPlayState = playState;
            this._render();
        }
    }

    _detectCurrent() {
        if (!this._episodes) return null;
        const mp = this._hass?.states?.[this._config.media_player];
        if (!mp) return null;
        const cid = mp.attributes?.media_content_id || "";
        if (!cid) return null;
        for (const ep of this._episodes) {
            if (cid.includes(ep.audio_file)) return ep.number;
        }
        return null;
    }

    async _loadEpisodes() {
        this._loaded = true;
        try {
            const url = `${this._config.base_path}/episodes.json?v=${Date.now()}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            this._podcast = data.podcast || {};
            this._episodes = data.episodes || [];
            this._currentNum = this._detectCurrent();
            this._render();
        } catch (e) {
            this._error = e.message;
            this._render();
        }
    }

    _audioUrl(ep) {
        return `${window.location.origin}${this._config.base_path}/${ep.audio_file}`;
    }

    _imageUrl(ep) {
        return `${this._config.base_path}/${ep.image_file}`;
    }

    _play(ep) {
        if (!this._hass) return;
        this._currentNum = ep.number;
        this._hass.callService("music_assistant", "play_media", {
            entity_id: this._config.media_player,
            media_id: this._audioUrl(ep),
            media_type: "track",
            enqueue: this._config.enqueue,
        });
        this._updateHeader();
        this._updateScrollerHighlight();
    }

    _enqueueNext(ep) {
        if (!this._hass) return;
        this._hass.callService("music_assistant", "play_media", {
            entity_id: this._config.media_player,
            media_id: this._audioUrl(ep),
            media_type: "track",
            enqueue: "next",
        });
    }

    _filtered() {
        const q = this._search.trim().toLowerCase();
        const list = q
            ? this._episodes.filter((ep) =>
                  (ep.title || "").toLowerCase().includes(q) ||
                  (ep.description || "").toLowerCase().includes(q)
              )
            : [...this._episodes];

        if (this._sort === "duration") {
            list.sort((a, b) => (b.duration_seconds || 0) - (a.duration_seconds || 0));
        } else {
            list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        }
        return list;
    }

    _render() {
        if (!this._config) return;
        const root = this.shadowRoot;

        if (this._error) {
            this._renderState = "error";
            root.innerHTML = this._wrap(`
                <div class="error">
                    <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                    <div>
                        <div class="error-title">Falha a carregar episódios</div>
                        <div class="error-msg">${this._escape(this._error)}</div>
                        <div class="error-hint">Verifica que ${this._config.base_path}/episodes.json existe.</div>
                    </div>
                </div>
            `);
            return;
        }

        if (!this._episodes) {
            this._renderState = "loading";
            root.innerHTML = this._wrap(`<div class="loading">A carregar episódios…</div>`);
            return;
        }

        // Build the shell once; subsequent renders only swap inner pieces so the
        // search input keeps its focus and cursor.
        if (this._renderState !== "ready") {
            this._renderShell();
            this._renderState = "ready";
            return;
        }

        // Already mounted — just update the dynamic pieces.
        this._updateHeader();
        this._updateActionsState();
        this._updateScroller();
    }

    _renderShell() {
        const filtered = this._filtered();
        this.shadowRoot.innerHTML = this._wrap(`
            <div class="header-slot">${this._renderCurrent()}</div>
            ${this._renderActions(filtered.length)}
            <div class="scroller">${this._renderScrollerInner(filtered)}</div>
        `);
        this._wireShellEvents();
        this._wireScrollerEvents();
    }

    _updateHeader() {
        const slot = this.shadowRoot.querySelector(".header-slot");
        if (!slot) return;
        slot.innerHTML = this._renderCurrent();
    }

    _updateActionsState() {
        const filtered = this._filtered();
        this.shadowRoot.querySelectorAll(".sort-pill").forEach((btn) => {
            btn.classList.toggle("is-active", btn.dataset.sort === this._sort);
        });
        const tg = this.shadowRoot.querySelector(".view-toggle ha-icon");
        if (tg) tg.setAttribute("icon", this._view === "grid" ? "mdi:format-list-bulleted" : "mdi:view-grid");
        const tgBtn = this.shadowRoot.querySelector(".view-toggle");
        if (tgBtn) tgBtn.setAttribute("title", this._view === "grid" ? "Vista lista" : "Vista grelha");
        const counter = this.shadowRoot.querySelector(".counter");
        if (counter) counter.textContent = `${filtered.length} de ${this._episodes.length}`;
    }

    _updateScroller() {
        const scroller = this.shadowRoot.querySelector(".scroller");
        if (!scroller) return;
        const filtered = this._filtered();
        scroller.innerHTML = this._renderScrollerInner(filtered);
        this._wireScrollerEvents();
    }

    _updateScrollerHighlight() {
        this.shadowRoot.querySelectorAll(".episode, .list-item").forEach((el) => {
            el.classList.toggle("is-current", Number(el.dataset.num) === this._currentNum);
        });
    }

    _renderScrollerInner(filtered) {
        return filtered.length === 0
            ? `<div class="empty">Sem resultados</div>`
            : this._view === "list"
                ? this._renderList(filtered)
                : this._renderGrid(filtered);
    }

    _wrap(inner) {
        return `<style>${this._css()}</style><ha-card>${inner}</ha-card>`;
    }

    _renderCurrent() {
        const podcastTitle = this._config.title || this._podcast.title || "Podcasts";
        const ep = this._currentNum != null
            ? this._episodes.find((e) => e.number === this._currentNum)
            : null;

        if (!ep) {
            const podcastImg = this._podcast.image
                ? `<img class="header-img" src="${this._escape(this._podcast.image)}" alt="">`
                : `<div class="header-img placeholder"><ha-icon icon="mdi:podcast"></ha-icon></div>`;
            return `
                <div class="header">
                    ${podcastImg}
                    <div class="header-info">
                        <div class="header-eyebrow">Podcast</div>
                        <div class="header-title">${this._escape(podcastTitle)}</div>
                        <div class="header-meta">${this._episodes.length} episódios</div>
                    </div>
                </div>
            `;
        }

        const mp = this._hass?.states?.[this._config.media_player];
        const state = mp?.state;
        const isPlaying = state === "playing";
        const isPaused = state === "paused";
        const eyebrow = isPlaying ? "A reproduzir" : isPaused ? "Em pausa" : "Selecionado";
        const stateIcon = isPlaying ? "mdi:play-circle" : isPaused ? "mdi:pause-circle" : "mdi:music-circle";

        return `
            <div class="header current">
                <img class="header-img" src="${this._escape(this._imageUrl(ep))}" alt="">
                <div class="header-info">
                    <div class="header-eyebrow"><ha-icon icon="${stateIcon}"></ha-icon><span>${eyebrow}</span></div>
                    <div class="header-title">${this._escape(ep.title || "")}</div>
                    <div class="header-meta">${ep.duration ? `${ep.duration} · ` : ""}${this._escape(podcastTitle)}</div>
                </div>
            </div>
        `;
    }

    _renderActions(count) {
        const topParts = [];
        if (this._config.show_search) {
            topParts.push(`<input class="search" type="search" placeholder="Pesquisar…" value="${this._escape(this._search)}">`);
        }
        if (this._config.show_view_toggle) {
            topParts.push(`
                <button class="bubble-btn view-toggle" title="${this._view === "grid" ? "Vista lista" : "Vista grelha"}">
                    <ha-icon icon="${this._view === "grid" ? "mdi:format-list-bulleted" : "mdi:view-grid"}"></ha-icon>
                </button>
            `);
        }
        if (this._config.show_random) {
            topParts.push(`
                <button class="bubble-btn primary random" title="Aleatório">
                    <ha-icon icon="mdi:shuffle-variant"></ha-icon>
                </button>
            `);
        }

        const pills = SORT_OPTIONS.map((opt) => `
            <button class="bubble-pill sort-pill${this._sort === opt.value ? " is-active" : ""}"
                    data-sort="${opt.value}" title="${this._escape(opt.label)}">
                <ha-icon icon="${opt.icon}"></ha-icon>
                <span>${this._escape(opt.label)}</span>
            </button>
        `).join("");

        return `
            <div class="actions">${topParts.join("")}</div>
            <div class="sort-row">
                <div class="sort-pills" role="group" aria-label="Ordenar">${pills}</div>
                <div class="counter">${count} de ${this._episodes.length}</div>
            </div>
        `;
    }

    _renderGrid(list) {
        return `<div class="grid">${list.map((ep) => this._renderGridItem(ep)).join("")}</div>`;
    }

    _renderGridItem(ep) {
        const isCurrent = ep.number === this._currentNum;
        return `
            <div class="episode${isCurrent ? " is-current" : ""}" data-num="${ep.number}" tabindex="0">
                <div class="cover">
                    <img src="${this._escape(this._imageUrl(ep))}" alt="" loading="lazy">
                    <div class="overlay">
                        <ha-icon icon="mdi:play-circle"></ha-icon>
                    </div>
                    <button class="add-next" data-num="${ep.number}" title="Adicionar à fila">
                        <ha-icon icon="mdi:playlist-plus"></ha-icon>
                    </button>
                    ${isCurrent ? `<div class="badge"><ha-icon icon="mdi:music-note"></ha-icon></div>` : ""}
                </div>
                <div class="info">
                    ${ep.duration ? `<div class="meta">${this._escape(ep.duration)}</div>` : ""}
                    <div class="title">${this._escape(ep.title || "")}</div>
                </div>
            </div>
        `;
    }

    _renderList(list) {
        return `<div class="list">${list.map((ep) => this._renderListItem(ep)).join("")}</div>`;
    }

    _renderListItem(ep) {
        const isCurrent = ep.number === this._currentNum;
        return `
            <div class="list-item${isCurrent ? " is-current" : ""}" data-num="${ep.number}" tabindex="0">
                <div class="list-thumb">
                    <img src="${this._escape(this._imageUrl(ep))}" alt="" loading="lazy">
                    ${isCurrent ? `<div class="badge"><ha-icon icon="mdi:music-note"></ha-icon></div>` : ""}
                </div>
                <div class="list-info">
                    <div class="list-title">${this._escape(ep.title || "")}</div>
                    ${ep.duration ? `<div class="list-meta">${this._escape(ep.duration)}</div>` : ""}
                </div>
                <button class="add-next" data-num="${ep.number}" title="Adicionar à fila">
                    <ha-icon icon="mdi:playlist-plus"></ha-icon>
                </button>
                <ha-icon class="list-play" icon="mdi:play-circle"></ha-icon>
            </div>
        `;
    }

    _wireShellEvents() {
        const root = this.shadowRoot;

        const searchEl = root.querySelector(".search");
        if (searchEl) {
            searchEl.addEventListener("input", (e) => {
                this._search = e.target.value;
                this._updateActionsState();
                this._updateScroller();
            });
        }

        root.querySelectorAll(".sort-pill").forEach((btn) => {
            btn.addEventListener("click", () => {
                const next = btn.dataset.sort;
                if (next && next !== this._sort) {
                    this._sort = next;
                    this._updateActionsState();
                    this._updateScroller();
                }
            });
        });

        const toggleEl = root.querySelector(".view-toggle");
        if (toggleEl) {
            toggleEl.addEventListener("click", () => {
                this._view = this._view === "grid" ? "list" : "grid";
                this._updateActionsState();
                this._updateScroller();
            });
        }

        const rnd = root.querySelector(".random");
        if (rnd) {
            rnd.addEventListener("click", () => {
                if (!this._episodes?.length) return;
                const ep = this._episodes[Math.floor(Math.random() * this._episodes.length)];
                this._play(ep);
            });
        }
    }

    _wireScrollerEvents() {
        const root = this.shadowRoot;
        const playClick = (el) => {
            const num = Number(el.dataset.num);
            const ep = this._episodes.find((x) => x.number === num);
            if (ep) this._play(ep);
        };

        root.querySelectorAll(".episode, .list-item").forEach((el) => {
            el.addEventListener("click", (e) => {
                if (e.target.closest(".add-next")) return;
                playClick(el);
            });
            el.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    playClick(el);
                }
            });
        });

        root.querySelectorAll(".add-next").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const num = Number(btn.dataset.num);
                const ep = this._episodes.find((x) => x.number === num);
                if (ep) this._enqueueNext(ep);
            });
        });
    }

    _escape(s) {
        return String(s ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    _css() {
        const cols = this._config.columns;
        const maxH = this._config.max_height;
        return `
            :host { display: block; }
            ha-card { padding: 12px; display: flex; flex-direction: column; gap: 10px; }

            .header {
                display: flex;
                gap: 12px;
                align-items: center;
                padding: 8px;
                border-radius: 12px;
                background: var(--secondary-background-color, var(--card-background-color));
            }
            .header.current {
                background: linear-gradient(135deg,
                    color-mix(in srgb, var(--primary-color) 18%, var(--card-background-color)),
                    var(--secondary-background-color, var(--card-background-color)));
            }
            .header-img {
                width: 64px;
                height: 64px;
                border-radius: 10px;
                object-fit: cover;
                flex: 0 0 auto;
            }
            .header-img.placeholder {
                background: var(--divider-color);
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--secondary-text-color);
            }
            .header-img.placeholder ha-icon { --mdc-icon-size: 32px; }
            .header-info { display: flex; flex-direction: column; min-width: 0; gap: 2px; }
            .header-eyebrow {
                font-size: 0.72em;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                color: var(--secondary-text-color);
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }
            .header.current .header-eyebrow { color: var(--primary-color); font-weight: 600; }
            .header-eyebrow ha-icon { --mdc-icon-size: 14px; }
            .header-title {
                font-size: 1.05em;
                font-weight: 600;
                color: var(--primary-text-color);
                line-height: 1.25;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            .header-meta { font-size: 0.85em; color: var(--secondary-text-color); }

            .actions { display: flex; gap: 8px; align-items: center; }
            .search {
                padding: 10px 14px;
                border: none;
                border-radius: 999px;
                background: var(--secondary-background-color, var(--card-background-color));
                color: var(--primary-text-color);
                font: inherit;
                flex: 1;
                min-width: 0;
                outline: none;
                transition: box-shadow 0.15s ease;
            }
            .search:focus-visible { box-shadow: 0 0 0 2px var(--primary-color); }

            .bubble-btn {
                border: none;
                border-radius: 999px;
                background: var(--secondary-background-color, var(--card-background-color));
                color: var(--primary-text-color);
                cursor: pointer;
                width: 42px;
                height: 42px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                transition: background 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
            }
            .bubble-btn:hover { background: color-mix(in srgb, var(--primary-color) 18%, var(--secondary-background-color, var(--card-background-color))); }
            .bubble-btn:active { transform: scale(0.95); }
            .bubble-btn.primary {
                background: var(--primary-color);
                color: var(--text-primary-color, white);
            }
            .bubble-btn.primary:hover { filter: brightness(1.08); background: var(--primary-color); }

            .sort-row {
                display: flex;
                align-items: center;
                gap: 10px;
                justify-content: space-between;
            }
            .sort-pills {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
                background: var(--secondary-background-color, var(--card-background-color));
                padding: 4px;
                border-radius: 999px;
            }
            .bubble-pill {
                border: none;
                background: transparent;
                color: var(--secondary-text-color);
                font: inherit;
                font-size: 0.85em;
                font-weight: 500;
                cursor: pointer;
                padding: 6px 12px;
                border-radius: 999px;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
                white-space: nowrap;
            }
            .bubble-pill ha-icon { --mdc-icon-size: 16px; }
            .bubble-pill:hover { color: var(--primary-text-color); background: color-mix(in srgb, var(--primary-color) 12%, transparent); }
            .bubble-pill:active { transform: scale(0.96); }
            .bubble-pill.is-active {
                background: var(--primary-color);
                color: var(--text-primary-color, white);
                box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            }
            .bubble-pill.is-active:hover { filter: brightness(1.05); background: var(--primary-color); color: var(--text-primary-color, white); }
            .counter { font-size: 0.78em; color: var(--secondary-text-color); white-space: nowrap; }

            @media (max-width: 480px) {
                .bubble-pill span { display: none; }
                .bubble-pill { width: 36px; height: 36px; padding: 0; justify-content: center; }
            }

            .scroller {
                max-height: ${maxH}px;
                overflow-y: auto;
                overscroll-behavior: contain;
                scrollbar-width: thin;
                padding-right: 4px;
            }
            .scroller::-webkit-scrollbar { width: 8px; }
            .scroller::-webkit-scrollbar-thumb {
                background: var(--divider-color);
                border-radius: 4px;
            }

            .grid {
                display: grid;
                grid-template-columns: repeat(${cols}, minmax(0, 1fr));
                gap: 8px;
            }
            .episode {
                cursor: pointer;
                border-radius: 10px;
                overflow: hidden;
                background: var(--secondary-background-color, var(--card-background-color));
                transition: transform 0.15s ease, box-shadow 0.15s ease;
                outline: none;
                position: relative;
            }
            .episode:hover, .episode:focus-visible {
                transform: translateY(-2px);
                box-shadow: 0 4px 14px rgba(0,0,0,0.18);
            }
            .episode:focus-visible { box-shadow: 0 0 0 2px var(--primary-color); }
            .episode.is-current { box-shadow: 0 0 0 2px var(--primary-color); }
            .cover {
                position: relative;
                width: 100%;
                aspect-ratio: 1 / 1;
                background: var(--divider-color);
            }
            .cover img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }
            .overlay {
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.35);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.15s ease;
                color: white;
            }
            .overlay ha-icon { --mdc-icon-size: 48px; }
            .episode:hover .overlay,
            .episode:focus-visible .overlay { opacity: 1; }
            .add-next {
                position: absolute;
                top: 6px;
                right: 6px;
                border: none;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                background: rgba(0,0,0,0.55);
                color: white;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.15s ease, background 0.15s ease;
            }
            .episode .add-next ha-icon { --mdc-icon-size: 18px; }
            .episode:hover .add-next,
            .episode:focus-visible .add-next { opacity: 1; }
            .add-next:hover { background: var(--primary-color); }
            .badge {
                position: absolute;
                bottom: 6px;
                left: 6px;
                background: var(--primary-color);
                color: var(--text-primary-color, white);
                border-radius: 50%;
                width: 26px;
                height: 26px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            }
            .badge ha-icon { --mdc-icon-size: 16px; }
            .info { padding: 8px 10px 10px; }
            .meta { font-size: 0.72em; color: var(--secondary-text-color); }
            .title {
                font-size: 0.88em;
                font-weight: 600;
                color: var(--primary-text-color);
                line-height: 1.25;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                margin-top: 2px;
            }

            .list { display: flex; flex-direction: column; gap: 4px; }
            .list-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 6px 8px;
                border-radius: 10px;
                cursor: pointer;
                background: transparent;
                outline: none;
                transition: background 0.15s ease;
            }
            .list-item:hover, .list-item:focus-visible {
                background: var(--secondary-background-color, var(--card-background-color));
            }
            .list-item.is-current {
                background: color-mix(in srgb, var(--primary-color) 14%, transparent);
            }
            .list-thumb {
                position: relative;
                width: 48px;
                height: 48px;
                flex: 0 0 auto;
                border-radius: 8px;
                overflow: hidden;
                background: var(--divider-color);
            }
            .list-thumb img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }
            .list-thumb .badge {
                bottom: -4px;
                left: -4px;
                width: 20px;
                height: 20px;
            }
            .list-thumb .badge ha-icon { --mdc-icon-size: 12px; }
            .list-info { flex: 1; min-width: 0; }
            .list-title {
                font-size: 0.92em;
                font-weight: 600;
                color: var(--primary-text-color);
                line-height: 1.2;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .list-meta {
                font-size: 0.78em;
                color: var(--secondary-text-color);
                margin-top: 2px;
            }
            .list-item .add-next {
                position: static;
                opacity: 0;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: transparent;
                color: var(--secondary-text-color);
                border: none;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0;
            }
            .list-item .add-next ha-icon { --mdc-icon-size: 20px; }
            .list-item:hover .add-next, .list-item:focus-visible .add-next { opacity: 1; }
            .list-item .add-next:hover { background: var(--secondary-background-color); color: var(--primary-color); }
            .list-play {
                color: var(--secondary-text-color);
                --mdc-icon-size: 26px;
                opacity: 0.5;
            }
            .list-item:hover .list-play, .list-item.is-current .list-play {
                color: var(--primary-color);
                opacity: 1;
            }

            .empty, .loading {
                text-align: center;
                padding: 24px 8px;
                color: var(--secondary-text-color);
            }
            .error {
                display: flex;
                gap: 12px;
                padding: 12px;
                color: var(--error-color, #b00020);
            }
            .error ha-icon { --mdc-icon-size: 28px; flex: 0 0 auto; }
            .error-title { font-weight: 600; }
            .error-msg { font-size: 0.9em; opacity: 0.9; margin-top: 2px; }
            .error-hint { font-size: 0.85em; color: var(--secondary-text-color); margin-top: 6px; }
        `;
    }

    getCardSize() {
        return 6;
    }
}

customElements.define("podcast-card", PodcastCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "podcast-card",
    name: "Podcast Card",
    description: "Grelha/lista de episódios de podcast com capas, lidos de episodes.json e reproduzidos via Music Assistant.",
    preview: false,
    documentationURL: "https://github.com/jo4santos/hass-repo-card-podcast",
});

console.info(
    `%c PODCAST-CARD %c v${CARD_VERSION} `,
    "color: white; background: #6f42c1; font-weight: 700;",
    "color: #6f42c1; background: white; font-weight: 700;"
);
