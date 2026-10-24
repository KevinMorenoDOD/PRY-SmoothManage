export type Locale = 'en' | 'es';

export interface TranslationMessages {
  [key: string]: string | TranslationMessages;
}

export interface I18nConfig {
  defaultLocale: Locale;
  fallbackLocale: Locale;
  messages: Record<Locale, TranslationMessages>;
}

export class I18n {
  private locale: Locale;
  private config: I18nConfig;
  private listeners: Set<() => void> = new Set();

  constructor(config: I18nConfig) {
    this.config = config;
    this.locale = config.defaultLocale;
  }

  getLocale(): Locale {
    return this.locale;
  }

  setLocale(locale: Locale): void {
    if (locale !== this.locale && this.config.messages[locale]) {
      this.locale = locale;
      this.notify();
    }
  }

  t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let messages: TranslationMessages | string = this.config.messages[this.locale];
    
    for (const k of keys) {
      if (typeof messages === 'object' && messages !== null && k in messages) {
        messages = messages[k];
      } else {
        messages = this.getFallback(key);
        break;
      }
    }

    if (typeof messages !== 'string') {
      return key;
    }

    if (params) {
      return Object.entries(params).reduce(
        (str, [param, value]) => str.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value)),
        messages
      );
    }

    return messages;
  }

  private getFallback(key: string): string {
    const keys = key.split('.');
    let messages: TranslationMessages | string = this.config.messages[this.config.fallbackLocale];
    
    for (const k of keys) {
      if (typeof messages === 'object' && messages !== null && k in messages) {
        messages = messages[k];
      } else {
        return key;
      }
    }

    return typeof messages === 'string' ? messages : key;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const createI18n = (config: I18nConfig): I18n => {
  return new I18n(config);
};

export const useI18n = (i18n: I18n) => {
  const [, forceUpdate] = React.useState(0);

  React.useEffect(() => {
    return i18n.subscribe(() => forceUpdate((n) => n + 1));
  }, [i18n]);

  return {
    t: i18n.t.bind(i18n),
    locale: i18n.getLocale(),
    setLocale: i18n.setLocale.bind(i18n),
  };
};

import React from 'react';