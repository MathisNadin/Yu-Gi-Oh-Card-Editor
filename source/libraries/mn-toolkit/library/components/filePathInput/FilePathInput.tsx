import { IContainerProps, IContainerState, Container } from '../container';
import { Icon } from '../icon';
import { Typography } from '../typography';

interface IFilePathInputProps extends IContainerProps {
  placeholder?: string;
  defaultPath?: string;
  value: string;
  onChange: (value: string) => void | Promise<void>;
  overrideOnTapIcon?: (event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void | Promise<void>;
}

interface IFilePathInputState extends IContainerState {}

export class FilePathInput extends Container<IFilePathInputProps, IFilePathInputState> {
  public static override get defaultProps(): Omit<IFilePathInputProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
    };
  }

  private async onTapIcon(event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) {
    if (this.props.overrideOnTapIcon) {
      return await this.props.overrideOnTapIcon(event);
    }

    if (!app.$device.isElectron(window)) return;
    const path = await window.electron.ipcRenderer.invoke('getFilePath', this.props.defaultPath);
    if (path) await this.props.onChange(path);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-file-path-input'] = true;
    return classes;
  }

  public override get children() {
    if (!app.$device.isElectron(window)) {
      return <Typography content='Impossible de choisir un chemin de fichier sur cette plateforme' />;
    }

    return [
      <input
        key='input'
        type='text'
        name={this.props.name}
        disabled={this.props.disabled}
        placeholder={this.props.placeholder}
        value={this.props.value}
        onChange={(e) =>
          app.$errorManager.handlePromise(this.props.onChange((e.target as HTMLInputElement).value || ''))
        }
      />,
      <Icon
        key='icon'
        icon='toolkit-menu-meatballs'
        name='Choisir un fichier'
        size={26}
        onTap={(e) => this.onTapIcon(e)}
      />,
    ];
  }
}
