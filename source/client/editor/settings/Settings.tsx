import {
  IContainerProps,
  IContainerState,
  Container,
  Button,
  FileInput,
  HorizontalStack,
  Icon,
  Spacer,
  Spinner,
  Typography,
  VerticalStack,
} from 'mn-toolkit';
import { ISettingsListener, IUserSettings } from './SettingsService';

interface ISettingsProps extends IContainerProps {}

interface ISettingsState extends IContainerState {
  settings: IUserSettings;
}

export class Settings extends Container<ISettingsProps, ISettingsState> implements Partial<ISettingsListener> {
  public static get defaultProps(): ISettingsProps {
    return {
      ...super.defaultProps,
      fill: true,
      padding: true,
      gutter: true,
      layout: 'vertical',
    };
  }

  public constructor(props: ISettingsProps) {
    super(props);
    this.state = {
      ...this.state,
      loaded: true,
      settings: app.$settings.settings,
    };
    app.$settings.addListener(this);
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    app.$settings.removeListener(this);
  }

  public settingsLoaded(settings: IUserSettings) {
    this.setState({ settings });
  }

  public settingsUpdated(settings: IUserSettings) {
    this.setState({ settings });
  }

  private async getDefaultRenderPath() {
    if (!app.$device.isElectron(window)) return;
    const defaultRenderPath = await window.electron.ipcRenderer.invoke(
      'getDirectoryPath',
      this.state.settings.defaultRenderPath
    );
    if (!defaultRenderPath) return;
    await this.onDefaultRenderPathChanged(defaultRenderPath);
  }

  private async onDefaultRenderPathChanged(defaultRenderPath: string) {
    await app.$settings.saveSettings({ defaultRenderPath });
  }

  private async getDefaultArtworkPath() {
    if (!app.$device.isElectron(window)) return;
    const defaultArtworkPath = await window.electron.ipcRenderer.invoke(
      'getDirectoryPath',
      this.state.settings.defaultArtworkPath
    );
    if (!defaultArtworkPath) return;
    await this.onDefaultArtworkPathChanged(defaultArtworkPath);
  }

  private async onDefaultArtworkPathChanged(defaultArtworkPath: string) {
    await app.$settings.saveSettings({ defaultArtworkPath });
  }

  private async getDefaultImgImportPath() {
    if (!app.$device.isElectron(window)) return;
    const defaultImgImportPath = await window.electron.ipcRenderer.invoke(
      'getDirectoryPath',
      this.state.settings.defaultImgImportPath
    );
    if (!defaultImgImportPath) return;
    await this.onDefaultImgImportPathChanged(defaultImgImportPath);
  }

  private async onDefaultImgImportPathChanged(defaultImgImportPath: string) {
    await app.$settings.saveSettings({ defaultImgImportPath });
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['settings'] = true;
    return classes;
  }

  public get children() {
    if (!this.state.settings) return <Spinner />;
    return [
      <VerticalStack key='default-render-path' className='setting-field'>
        <Typography variant='document' contentType='text' content='Chemin de rendu par défaut' />

        <HorizontalStack verticalItemAlignment='middle'>
          <Icon className='field-icon' size={24} icon='toolkit-millennium-puzzle' color='1' />
          {app.$device.isDesktop && (
            <FileInput
              fill
              placeholder='Chemin du dossier'
              defaultValue={this.state.settings.defaultRenderPath}
              onChange={(url) => this.onDefaultRenderPathChanged(url)}
              overrideOnTap={() => this.getDefaultRenderPath()}
            />
          )}
        </HorizontalStack>
      </VerticalStack>,

      <VerticalStack key='default-artwork-path' className='setting-field'>
        <Typography variant='document' contentType='text' content='Chemin vers les artworks par défaut' />

        <HorizontalStack verticalItemAlignment='middle'>
          <Icon className='field-icon' size={24} icon='toolkit-image' color='1' />
          {app.$device.isDesktop && (
            <FileInput
              fill
              placeholder='Chemin du dossier'
              defaultValue={this.state.settings.defaultArtworkPath}
              onChange={(path) => this.onDefaultArtworkPathChanged(path)}
              overrideOnTap={() => this.getDefaultArtworkPath()}
            />
          )}
        </HorizontalStack>
      </VerticalStack>,

      <VerticalStack key='default-img-import' className='setting-field'>
        <Typography variant='document' contentType='text' content="Chemin d'import des artworks par défaut" />

        <HorizontalStack verticalItemAlignment='middle'>
          <Icon className='field-icon' size={24} icon='toolkit-image-sync' color='1' />
          {app.$device.isDesktop && (
            <FileInput
              fill
              placeholder='Chemin du dossier'
              defaultValue={this.state.settings.defaultImgImportPath}
              onChange={(path) => this.onDefaultImgImportPathChanged(path)}
              overrideOnTap={() => this.getDefaultImgImportPath()}
            />
          )}
        </HorizontalStack>
      </VerticalStack>,

      <Spacer key='spacer' />,

      <HorizontalStack key='import-export-data' gutter verticalItemAlignment='middle'>
        <Button
          fill
          label='Importer des données'
          color='primary'
          onTap={() => app.$errorManager.handlePromise(app.$settings.importData())}
        />

        <Button
          fill
          label='Exporter les données'
          color='secondary'
          onTap={() => app.$errorManager.handlePromise(app.$settings.exportData())}
        />
      </HorizontalStack>,
    ];
  }
}
