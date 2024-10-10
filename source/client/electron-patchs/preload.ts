declare global {
  interface IIpcRenderer {
    renderCurrentCard: () => Promise<void>;
    saveCurrentToLocal: () => Promise<void>;
  }
}

export function getProjectIpcRenderer(): Partial<IIpcRenderer> {
  return {
    renderCurrentCard(): Promise<void> {
      return app.$card.renderCurrentCard();
    },

    saveCurrentToLocal(): Promise<void> {
      return app.$card.saveCurrentToLocal();
    },
  };
}
