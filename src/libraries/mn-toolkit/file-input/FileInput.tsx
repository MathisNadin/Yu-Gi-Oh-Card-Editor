import './styles.scss';
import { FormEvent, MouseEvent } from "react";
import { IContainableProps, IContainableState, Containable } from "../containable/Containable";
import { HorizontalStack } from '../container/HorizontalStack';
import { Icon } from '../icon';
import { isDefined } from 'libraries/mn-tools';

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
    this.state = { ...(this.state || {}), value: props.defaultValue as string };
  }

  public componentWillReceiveProps(nextProps: Readonly<IFileInputProps>) {
    if (isDefined(nextProps.defaultValue) && nextProps.defaultValue?.trim() !== this.state.value?.trim()) {
      this.setState({ value: nextProps.defaultValue });
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
      try {
        const path = await window.electron.ipcRenderer.getFilePath();
        if (path) this.onChange({ target: { value: path } } as FormEvent<HTMLInputElement>);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
  }

  public render() {
    return this.renderAttributes(<HorizontalStack>
      <input type='text'
        name={this.props.name}
        disabled={this.props.disabled}
        placeholder={this.props.placeholder}
        value={this.state.value}
        onInput={e => this.onChange(e)}
      />
      <Icon iconId='toolkit-menu-meatballs' size={26} onTap={e => app.$errorManager.handlePromise(this.onTap(e))} />
    </HorizontalStack>, 'mn-file-input');
  }
}