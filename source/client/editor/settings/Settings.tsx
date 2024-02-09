import {
  IContainableProps,
  IContainableState,
  Containable,
  Button,
  FileInput,
  HorizontalStack,
  Icon,
  Spacer,
  Spinner,
  VerticalStack,
} from 'libraries/mn-toolkit';
import { ISettingsListener, IUserSettings } from './SettingsService';

interface ISettingsProps extends IContainableProps {}

interface ISettingsState extends IContainableState {
  settings: IUserSettings;
}

export class Settings extends Containable<ISettingsProps, ISettingsState> implements Partial<ISettingsListener> {
  public constructor(props: ISettingsProps) {
    super(props);
    this.state = {
      ...this.state,
      loaded: true,
      settings: app.$settings.settings,
    };
    app.$settings.addListener(this);
  }

  public componentWillUnmount() {
    app.$settings.removeListener(this);
  }

  public settingsLoaded(settings: IUserSettings) {
    this.setState({ settings });
  }

  public settingsUpdated(settings: IUserSettings) {
    this.setState({ settings });
  }

  private async getDefaultRenderPath() {
    const defaultRenderPath = await window.electron.ipcRenderer.getDirectoryPath(this.state.settings.defaultRenderPath);
    if (!defaultRenderPath) return;
    await this.onDefaultRenderPathChanged(defaultRenderPath);
  }

  private async onDefaultRenderPathChanged(defaultRenderPath: string) {
    await app.$settings.saveSettings({ defaultRenderPath });
  }

  private async getDefaultArtworkPath() {
    const defaultArtworkPath = await window.electron.ipcRenderer.getDirectoryPath(
      this.state.settings.defaultArtworkPath
    );
    if (!defaultArtworkPath) return;
    await this.onDefaultArtworkPathChanged(defaultArtworkPath);
  }

  private async onDefaultArtworkPathChanged(defaultArtworkPath: string) {
    await app.$settings.saveSettings({ defaultArtworkPath });
  }

  private async getDefaultImgImportPath() {
    const defaultImgImportPath = await window.electron.ipcRenderer.getDirectoryPath(
      this.state.settings.defaultImgImportPath
    );
    if (!defaultImgImportPath) return;
    await this.onDefaultImgImportPathChanged(defaultImgImportPath);
  }

  private async onDefaultImgImportPathChanged(defaultImgImportPath: string) {
    await app.$settings.saveSettings({ defaultImgImportPath });
  }

  public render() {
    if (!this.state?.settings) return <Spinner />;
    return this.renderAttributes(
      <VerticalStack fill>
        <VerticalStack fill gutter padding>
          <HorizontalStack verticalItemAlignment='middle'>
            <Icon className='field-icon' iconId='toolkit-millennium-puzzle' color='1' />
            {app.$device.isDesktop && (
              <FileInput
                fill
                placeholder='Chemin de rendu par défaut'
                defaultValue={this.state.settings.defaultRenderPath}
                onChange={(url) => this.onDefaultRenderPathChanged(url)}
                overrideOnTap={() => this.getDefaultRenderPath()}
              />
            )}
          </HorizontalStack>

          <HorizontalStack verticalItemAlignment='middle'>
            <Icon className='field-icon' iconId='toolkit-image' color='1' />
            {app.$device.isDesktop && (
              <FileInput
                fill
                placeholder="Chemin vers l'artwork par défaut"
                defaultValue={this.state.settings.defaultArtworkPath}
                onChange={(path) => this.onDefaultArtworkPathChanged(path)}
                overrideOnTap={() => this.getDefaultArtworkPath()}
              />
            )}
          </HorizontalStack>

          <HorizontalStack verticalItemAlignment='middle'>
            <Icon className='field-icon' iconId='toolkit-image-sync' color='1' />
            {app.$device.isDesktop && (
              <FileInput
                fill
                placeholder="Chemin d'import d'images par défaut"
                defaultValue={this.state.settings.defaultImgImportPath}
                onChange={(path) => this.onDefaultImgImportPathChanged(path)}
                overrideOnTap={() => this.getDefaultImgImportPath()}
              />
            )}
          </HorizontalStack>

          <Spacer />

          <HorizontalStack gutter verticalItemAlignment='middle'>
            <Button
              fill
              label='Importer des données'
              color='energized'
              onTap={() => app.$errorManager.handlePromise(app.$settings.importData())}
            />

            <Button
              fill
              label='Exporter les données'
              color='royal'
              onTap={() => app.$errorManager.handlePromise(app.$settings.exportData())}
            />
          </HorizontalStack>
        </VerticalStack>
      </VerticalStack>,
      'settings'
    );
  }
}
