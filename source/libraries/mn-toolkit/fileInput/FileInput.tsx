import { FormEvent, MouseEvent } from 'react';
import { IContainableProps, IContainableState, Containable } from '../containable';
import { HorizontalStack, IHorizontalStackProps } from '../container';
import { Icon } from '../icon';
import { isDefined } from 'mn-tools';
import { Typography } from '../typography';

interface IFileInputProps extends IContainableProps {
  placeholder?: string;
  defaultValue?: string;
  onChange: (value: string) => void | Promise<void>;
  overrideOnTap?: (e: MouseEvent) => void | Promise<void>;
}

interface IFileInputState extends IContainableState {
  value: string;
}

export class FileInput extends Containable<IFileInputProps, IFileInputState> {
  public static get defaultProps() {
    return {
      ...super.defaultProps,
      defaultValue: '',
    };
  }

  public constructor(props: IFileInputProps) {
    super(props);
    this.state = { ...this.state, value: props.defaultValue as string };
  }

  public componentDidUpdate() {
    if (isDefined(this.props.defaultValue) && this.props.defaultValue.trim() !== this.state.value?.trim()) {
      this.setState({ value: this.props.defaultValue });
    }
  }

  private onChange(e: FormEvent<HTMLInputElement>) {
    const value = e.target.value as string;
    this.setState({ value });
    if (this.props.onChange) app.$errorManager.handlePromise(this.props.onChange(value));
  }

  private async onTap(e: MouseEvent) {
    if (this.props.overrideOnTap) {
      app.$errorManager.handlePromise(this.props.overrideOnTap(e));
    } else {
      const path = await window.electron.ipcRenderer.getFilePath();
      if (path) this.onChange({ target: { value: path } } as FormEvent<HTMLInputElement>);
    }
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-file-input'] = true;
    return classes;
  }

  public render() {
    if (!app.$device.isDesktop) {
      return <Typography content='Impossible de choisir un chemin de fichier sur cette plateforme' />;
    }

    return (
      <HorizontalStack {...(this.renderAttributes() as IHorizontalStackProps)}>
        <input
          type='text'
          name={this.props.name}
          disabled={this.props.disabled}
          placeholder={this.props.placeholder}
          value={this.state.value}
          onChange={(e) => this.onChange(e)}
        />
        <Icon iconId='toolkit-menu-meatballs' size={26} onTap={(e) => app.$errorManager.handlePromise(this.onTap(e))} />
      </HorizontalStack>
    );
  }
}
