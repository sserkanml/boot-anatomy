import { getLanguage, LANGUAGES, setLanguage, t, type Language } from '../i18n';
import { UI } from '../i18n/strings';

/**
 * The EN / TR toggle in the top-right corner.
 *
 * It only writes the preference; everything else reacts through
 * onLanguageChange, so the switch never has to know what is on screen.
 */
export class LanguageSwitch {
  readonly element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'lang-switch';
    this.element.setAttribute('role', 'group');
    this.element.setAttribute('aria-label', t(UI.language));

    for (const language of LANGUAGES) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lang-option';
      button.dataset.lang = language.id;
      button.textContent = language.label;
      button.title = language.title;
      button.setAttribute('aria-pressed', String(language.id === getLanguage()));
      button.classList.toggle('is-active', language.id === getLanguage());
      button.addEventListener('click', () => setLanguage(language.id as Language));
      this.element.appendChild(button);
    }
  }
}
