declare global {
  interface IOnChannel {
    renderCurrentCard?: null;
    saveCurrentOrTempToLocal?: null;
    importCards?: null;
    importData?: null;
    exportData?: null;
  }

  interface IIpcRenderer {
    renderCurrentCard: () => Promise<void>;
    saveCurrentToLocal: () => Promise<void>;
  }
}

export function patchIpcMain(_ipcMain: IIpcMain) {
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

export function getProjectMenuDarwinTemplate() {
}

export function getProjectMenuTemplate() {
}
