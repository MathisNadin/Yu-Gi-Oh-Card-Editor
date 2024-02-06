import { Menu, BrowserWindow, MenuItemConstructorOptions } from 'electron';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

declare global {
  type IElectronShell = Electron.Shell;
  type IElectronApp = Electron.App;
  type IBrowserWindow = BrowserWindow;
  type IMenuItemConstructorOptions = MenuItemConstructorOptions;
  type IDarwinMenuItemConstructorOptions = DarwinMenuItemConstructorOptions;
}

export function buildDefaultDarwinTemplate(mainWindow: IBrowserWindow, app: IElectronApp, shell: IElectronShell): IMenuItemConstructorOptions[] {
  const includeDevTools = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

  const subMenuAbout: IDarwinMenuItemConstructorOptions = {
    label: 'Electron',
    submenu: [
      {
        label: 'About ElectronReact',
        selector: 'orderFrontStandardAboutPanel:',
      },
      { type: 'separator' },
      { label: 'Services', submenu: [] },
      { type: 'separator' },
      {
        label: 'Hide ElectronReact',
        accelerator: 'Command+H',
        selector: 'hide:',
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        selector: 'hideOtherApplications:',
      },
      { label: 'Show All', selector: 'unhideAllApplications:' },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => {
          app.quit();
        },
      },
    ],
  };

  const subMenuEdit: IDarwinMenuItemConstructorOptions = {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
      {
        label: 'Select All',
        accelerator: 'Command+A',
        selector: 'selectAll:',
      },
    ],
  };

  const subMenuViewDev: IMenuItemConstructorOptions = {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'Command+R',
        click: () => {
          mainWindow.webContents.reload();
        },
      },
      {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click: () => {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        },
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Command+I',
        click: () => {
          mainWindow.webContents.toggleDevTools();
        },
      },
    ],
  };

  const subMenuViewProd: IMenuItemConstructorOptions = {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click: () => {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        },
      },
    ],
  };

  const subMenuWindow: IDarwinMenuItemConstructorOptions = {
    label: 'Window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:',
      },
      { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
      { type: 'separator' },
      { label: 'Bring All to Front', selector: 'arrangeInFront:' },
    ],
  };

  const subMenuHelp: IMenuItemConstructorOptions = {
    label: 'Help',
    submenu: [
      {
        label: 'Learn More',
        click() {
          shell.openExternal('https://electronjs.org');
        },
      },
      {
        label: 'Documentation',
        click() {
          shell.openExternal(
            'https://github.com/electron/electron/tree/main/docs#readme'
          );
        },
      },
      {
        label: 'Community Discussions',
        click() {
          shell.openExternal('https://www.electronjs.org/community');
        },
      },
      {
        label: 'Search Issues',
        click() {
          shell.openExternal('https://github.com/electron/electron/issues');
        },
      },
    ],
  };

  const subMenuView = includeDevTools ? subMenuViewDev : subMenuViewProd;

  return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
}

export function buildDefaultTemplate(mainWindow: IBrowserWindow, _app: IElectronApp, shell: IElectronShell): IMenuItemConstructorOptions[] {
  const includeDevTools = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

    const templateDefault = [
      {
        label: '&File',
        submenu: [
          {
            label: '&Open',
            accelerator: 'Ctrl+O',
          },
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: () => {
              mainWindow.close();
            },
          },
        ],
      },
      {
        label: '&View',
        submenu: includeDevTools
          ? [
              {
                label: '&Reload',
                accelerator: 'Ctrl+R',
                click: () => {
                  mainWindow.webContents.reload();
                },
              },
              {
                label: 'Toggle &Full Screen',
                accelerator: 'F11',
                click: () => {
                  mainWindow.setFullScreen(
                    !mainWindow.isFullScreen(),
                  );
                },
              },
              {
                label: 'Toggle &Developer Tools',
                accelerator: 'Alt+Ctrl+I',
                click: () => {
                  mainWindow.webContents.toggleDevTools();
                },
              },
            ]
          : [
              {
                label: 'Toggle &Full Screen',
                accelerator: 'F11',
                click: () => {
                  mainWindow.setFullScreen(
                    !mainWindow.isFullScreen(),
                  );
                },
              },
            ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Learn More',
            click() {
              shell.openExternal('https://electronjs.org');
            },
          },
          {
            label: 'Documentation',
            click() {
              shell.openExternal(
                'https://github.com/electron/electron/tree/main/docs#readme',
              );
            },
          },
          {
            label: 'Community Discussions',
            click() {
              shell.openExternal('https://www.electronjs.org/community');
            },
          },
          {
            label: 'Search Issues',
            click() {
              shell.openExternal('https://github.com/electron/electron/issues');
            },
          },
        ],
      },
    ];

    return templateDefault;
}
