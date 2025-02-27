import { TJSXElementChild } from '../../system';
import { Containable, IContainableProps, IContainableState, TDidUpdateSnapshot } from '../containable';
import { Container, HorizontalStack, TContainerLayout } from '../container';
import { Typography } from '../typography';
import { Icon } from '../icon';
import { createRef } from 'react';

export type TAccordionHeaderPosition = 'top' | 'bottom' | 'left' | 'right';

interface IAccordionProps extends IContainableProps {
  /** The header title which is clickable */
  title: string;
  /** Whether the accordion is open by default */
  defaultOpen?: boolean;
  /** Position of the header relative to the content */
  headerPosition?: TAccordionHeaderPosition;
  /** Layout of the Container element around the children */
  contentLayout?: TContainerLayout;
  /** Callback when the accordion is toggled */
  onToggle?: (open: boolean) => void | Promise<void>;
}

interface IAccordionState extends IContainableState {
  open: boolean;
}

export class Accordion extends Containable<IAccordionProps, IAccordionState> {
  private contentWrapperRef = createRef<HTMLDivElement>();

  public static override get defaultProps(): IAccordionProps {
    return {
      ...super.defaultProps,
      contentLayout: 'vertical',
      title: '',
      headerPosition: 'top',
      defaultOpen: false,
    };
  }

  public constructor(props: IAccordionProps) {
    super(props);
    this.state = {
      ...this.state,
      open: props.defaultOpen!,
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    const contentEl = this.contentWrapperRef.current;
    if (contentEl && !this.state.open) {
      contentEl.style.display = 'none';
    }
  }

  public override componentDidUpdate(
    prevProps: Readonly<IAccordionProps>,
    prevState: Readonly<IAccordionState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps.defaultOpen !== this.props.defaultOpen) {
      this.setState({ open: this.props.defaultOpen! });
    }
    if (prevState.open !== this.state.open) {
      this.animateTransition(this.state.open);
    }
  }

  private async toggleAccordion() {
    await this.setStateAsync((prevState) => ({ open: !prevState.open }));
    if (this.props.onToggle) await this.props.onToggle(this.state.open);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-accordion'] = true;
    classes['opened'] = this.state.open;
    if (this.props.headerPosition) classes[`header-${this.props.headerPosition}-position`] = true;
    return classes;
  }

  public override render(): TJSXElementChild {
    const { headerPosition } = this.props;
    return (
      <div ref={this.base} {...this.renderAttributes()}>
        {(headerPosition === 'top' || headerPosition === 'left') && this.renderHeader()}
        {this.renderContent()}
        {(headerPosition === 'bottom' || headerPosition === 'right') && this.renderHeader()}
      </div>
    );
  }

  private renderHeader() {
    return (
      <HorizontalStack className='mn-accordion-header' verticalItemAlignment='top' onTap={() => this.toggleAccordion()}>
        <HorizontalStack className='mn-accordion-header-inside' verticalItemAlignment='middle'>
          <Icon color='1' icon={this.state.open ? 'toolkit-minus' : 'toolkit-plus'} />
          <Typography noWrap bold contentType='text' content={this.props.title} />
        </HorizontalStack>
      </HorizontalStack>
    );
  }

  private renderContent() {
    return (
      <div ref={this.contentWrapperRef} className='mn-accordion-content-wrapper'>
        <Container className='mn-accordion-content' layout={this.props.contentLayout}>
          {this.children}
        </Container>
      </div>
    );
  }

  // Method to animate the accordion open/close transition
  private animateTransition(open: boolean) {
    const contentEl = this.contentWrapperRef.current;
    if (!contentEl) return;

    // Determine which dimension to animate based on header position
    const { headerPosition } = this.props;
    const dimension = headerPosition === 'left' || headerPosition === 'right' ? 'width' : 'height';
    const duration = 300; // Animation duration in ms

    if (open) {
      // Opening: display the content and animate from 0 to full size
      contentEl.style.display = 'flex'; // Set display to flex when open
      contentEl.style.transition = ''; // Reset transition

      // Get the full size of the content before setting the dimension
      const fullSize = dimension === 'height' ? contentEl.scrollHeight : contentEl.scrollWidth;

      // Set the dimension to 0 to start the animation
      contentEl.style[dimension] = '0px';

      // Force reflow to ensure the starting point is applied
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      contentEl.offsetHeight;

      // Set the transition property
      contentEl.style.transition = `${dimension} ${duration}ms ease`;

      // Set the dimension property
      contentEl.style[dimension] = `${fullSize}px`;

      // After the transition ends, cleanup the inline style
      const transitionEndHandler = () => {
        contentEl.style.transition = '';
        contentEl.style[dimension] = '';
        contentEl.removeEventListener('transitionend', transitionEndHandler);
      };
      contentEl.addEventListener('transitionend', transitionEndHandler);
    } else {
      // Closing: animate from current full size to 0, then hide the content
      const currentSize = dimension === 'height' ? contentEl.scrollHeight : contentEl.scrollWidth;
      contentEl.style[dimension] = `${currentSize}px`;

      // Force reflow to ensure the current size is applied
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      contentEl.offsetHeight;

      // Set the transition property
      contentEl.style.transition = `${dimension} ${duration}ms ease`;

      // Animate to 0
      contentEl.style[dimension] = '0px';

      // After the transition ends, hide the content and cleanup inline styles
      const transitionEndHandler = () => {
        contentEl.style.display = 'none';
        contentEl.style.transition = '';
        contentEl.style[dimension] = '';
        contentEl.removeEventListener('transitionend', transitionEndHandler);
      };
      contentEl.addEventListener('transitionend', transitionEndHandler);
    }
  }
}
