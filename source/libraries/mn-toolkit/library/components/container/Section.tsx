import { TJSXElementChild } from '../../system';
import { IContainerProps, IContainerState, Container } from './Container';

export interface ISectionProps extends IContainerProps<HTMLElement> {}

export interface ISectionState extends IContainerState {}

export class Section<PROPS extends ISectionProps, STATE extends ISectionState> extends Container<
  PROPS,
  STATE,
  HTMLElement
> {
  public static override get defaultProps(): ISectionProps {
    return {
      ...super.defaultProps,
      layout: 'vertical',
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-section'] = true;
    return classes;
  }

  public override render(): TJSXElementChild {
    return (
      <section ref={this.base} {...this.renderAttributes()}>
        {this.inside}
      </section>
    );
  }
}
