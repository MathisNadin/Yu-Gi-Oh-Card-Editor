import { TDidUpdateSnapshot } from '../containable';
import { Container, IContainerProps, IContainerState } from '../container';

export interface IToggleProps extends IContainerProps {
  defaultValue?: boolean;
  onChange?: (value: boolean) => void | Promise<void>;
}

interface IToggleState extends IContainerState {
  value: boolean;
}

export class Toggle extends Container<IToggleProps, IToggleState> {
  public static override get defaultProps(): IToggleProps {
    return {
      ...super.defaultProps,
      itemAlignment: 'center',
      verticalItemAlignment: 'middle',
      disabled: false,
    };
  }

  public constructor(props: IToggleProps) {
    super(props);
    this.state = {
      ...this.state,
      value: props.defaultValue!,
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IToggleProps>,
    prevState: Readonly<IToggleState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    if (this.props.defaultValue === this.state.value) return;
    this.setState({ value: this.props.defaultValue! });
  }

  private async doToggle(e: React.MouseEvent<HTMLDivElement>) {
    if (this.props.disabled) return;
    await this.setStateAsync({ value: !this.state.value });
    if (this.props.onChange) await this.props.onChange(this.state.value);
    if (this.props.onTap) await this.props.onTap(e);
  }

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    attributes.onClick = (e) => this.doToggle(e);
    return attributes;
  }

  public override renderClasses(): { [key: string]: boolean } {
    const classes = super.renderClasses();
    classes['mn-toggle'] = true;
    classes['has-click'] = true;
    classes['checked'] = this.state.value;
    return classes;
  }

  public override get children() {
    return (
      <div className='toggle'>
        <div className='handle' />
      </div>
    );
  }
}
