import { Container } from '../container';
import { Containable, IContainableProps, IContainableState, TDidUpdateSnapshot } from '../containable';
import { classNames } from 'mn-tools';

export interface IToggleProps extends IContainableProps {
  defaultValue?: boolean;
  onChange?: (value: boolean) => void | Promise<void>;
}

interface IToggleState extends IContainableState {
  value: boolean;
}

export class Toggle extends Containable<IToggleProps, IToggleState> {
  public static get defaultProps(): Partial<IToggleProps> {
    return {
      ...super.defaultProps,
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

  private async doToggle() {
    if (this.props.disabled) return;
    await this.setStateAsync({ value: !this.state.value });
    if (this.props.onChange) await this.props.onChange(this.state.value);
  }

  public override render() {
    return (
      <Container
        className={classNames('mn-toggle', { checked: this.state.value })}
        itemAlignment='center'
        verticalItemAlignment='middle'
        onTap={() => this.doToggle()}
      >
        <Container className='toggle'>
          <Containable className='handle' />
        </Container>
      </Container>
    );
  }
}
