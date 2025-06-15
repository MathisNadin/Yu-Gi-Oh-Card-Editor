import { isDefined } from 'mn-tools';
import { TDidUpdateSnapshot } from '../containable';
import { IContainerProps, IContainerState, Container } from '../container';
import { Icon } from '../icon';
import { Typography } from '../typography';

interface IFilePathInputProps extends IContainerProps {
  placeholder?: string;
  defaultValue?: string;
  defaultPath?: string;
  onChange?: (value: string) => void | Promise<void>;
  overrideOnTapIcon?: (event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void | Promise<void>;
}

interface IFilePathInputState extends IContainerState {
  value: string;
}

export class FilePathInput extends Container<IFilePathInputProps, IFilePathInputState> {
  public static override get defaultProps(): IFilePathInputProps {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      defaultValue: '',
    };
  }

  public constructor(props: IFilePathInputProps) {
    super(props);
    this.state = { ...this.state, value: props.defaultValue! };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IFilePathInputProps>,
    prevState: Readonly<IFilePathInputState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    if (isDefined(this.props.defaultValue) && this.props.defaultValue.trim() !== this.state.value?.trim()) {
      this.setState({ value: this.props.defaultValue });
    }
  }

  private async onChange(value: string) {
    await this.setStateAsync({ value });
    if (this.props.onChange) await this.props.onChange(value);
  }

  private async onTapIcon(event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) {
    if (this.props.overrideOnTapIcon) {
      return await this.props.overrideOnTapIcon(event);
    }

    if (!app.$device.isElectron(window)) return;
    const path = await window.electron.ipcRenderer.invoke('getFilePath', this.props.defaultPath);
    if (path) await this.onChange(path);
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
        value={this.state.value}
        onChange={(e) => app.$errorManager.handlePromise(this.onChange(e.target.value as string))}
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
