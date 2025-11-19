import { Container, IContainerProps, IContainerState } from '../container';

export interface IToggleProps extends IContainerProps {
  value: boolean;
  onChange: (value: boolean) => void | Promise<void>;
}

interface IToggleState extends IContainerState {}

export class Toggle extends Container<IToggleProps, IToggleState> {
  public static override get defaultProps(): Omit<IToggleProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      itemAlignment: 'center',
      verticalItemAlignment: 'middle',
    };
  }

  private async doToggle(e: React.MouseEvent<HTMLDivElement>) {
    if (this.props.disabled) return;
    if (this.props.onTap) await this.props.onTap(e);
    await this.props.onChange(!this.props.value);
  }

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    attributes.onClick = (e) => app.$errorManager.handlePromise(this.doToggle(e));
    return attributes;
  }

  public override renderClasses(): { [key: string]: boolean } {
    const classes = super.renderClasses();
    classes['mn-toggle'] = true;
    classes['has-click'] = true;
    classes['checked'] = !!this.props.value;
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
