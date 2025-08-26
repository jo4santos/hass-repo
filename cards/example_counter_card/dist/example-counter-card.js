class ExampleCounterCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  render() {
    if (!this.config || !this._hass) {
      return;
    }

    const entityId = this.config.entity;
    const state = this._hass.states[entityId];
    const stateStr = state ? state.state : 'unavailable';
    const name = this.config.name || (state ? state.attributes.friendly_name : entityId);

    this.shadowRoot.innerHTML = `
      <style>
        .card {
          background: var(--card-background-color);
          border-radius: var(--ha-card-border-radius);
          box-shadow: var(--ha-card-box-shadow);
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .title {
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 8px;
          color: var(--primary-text-color);
        }
        .counter {
          font-size: 3em;
          font-weight: bold;
          color: var(--accent-color);
          margin: 16px 0;
        }
        .unit {
          font-size: 0.9em;
          color: var(--secondary-text-color);
          margin-top: 8px;
        }
        .unavailable {
          color: var(--error-color);
        }
      </style>
      <div class="card">
        <div class="title">${name}</div>
        <div class="counter ${stateStr === 'unavailable' ? 'unavailable' : ''}">${stateStr}</div>
        ${state && state.attributes.unit_of_measurement ? 
          `<div class="unit">${state.attributes.unit_of_measurement}</div>` : 
          ''
        }
      </div>
    `;
  }

  getCardSize() {
    return 2;
  }

  static getConfigElement() {
    return document.createElement('example-counter-card-editor');
  }

  static getStubConfig() {
    return { entity: 'sensor.frigate_person_count' };
  }
}

customElements.define('example-counter-card', ExampleCounterCard);

// Add to custom card picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'example-counter-card',
  name: 'Example Counter Card',
  description: 'A simple card to display counter values with styling',
  preview: false,
  documentationURL: 'https://github.com/jo4santos/hass-repo/tree/main/cards/example_counter_card',
});

// Configuration editor
class ExampleCounterCardEditor extends HTMLElement {
  setConfig(config) {
    this.config = config;
    this.render();
  }

  render() {
    this.innerHTML = `
      <div>
        <label>Entity (required):</label>
        <input type="text" .value="${this.config.entity || ''}" @change="${this.entityChanged}">
      </div>
      <div>
        <label>Name (optional):</label>
        <input type="text" .value="${this.config.name || ''}" @change="${this.nameChanged}">
      </div>
    `;
  }

  entityChanged(e) {
    this.config = { ...this.config, entity: e.target.value };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config } }));
  }

  nameChanged(e) {
    this.config = { ...this.config, name: e.target.value };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config } }));
  }
}

customElements.define('example-counter-card-editor', ExampleCounterCardEditor);