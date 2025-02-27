import { AnchorHTMLAttributes, RefObject } from 'react';
import { escapeHTML, isDefined, isString, isUndefined, markdownToHtml } from 'mn-tools';
import { IRouterHrefParams, TForegroundColor, TRouterState } from '../../system';
import { IContainableProps, IContainableState, Containable, TDidUpdateSnapshot } from '../containable';

export type TControlTextContentType = 'html' | 'markdown' | 'text';

export type TVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'document' | 'help' | 'paragraph' | 'bullet';

export type TTypographyHTMLElement = HTMLDivElement | HTMLAnchorElement | HTMLHeadingElement;

export type TTypographyFontSize = keyof Omit<IAppThemeScreensSizesFonts, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>;

interface ITypographyProps<T extends TRouterState = TRouterState> extends IContainableProps<TTypographyHTMLElement> {
  fontSize?: TTypographyFontSize;
  variant: TVariant;
  alignment: 'left' | 'right' | 'center';
  content?: string;
  contentType: TControlTextContentType;
  noWrap: boolean;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  color?: TForegroundColor;
  href?: string | IRouterHrefParams<T>;
}

interface ITypographyState extends IContainableState {
  href: AnchorHTMLAttributes<HTMLAnchorElement>['href'];
}

export class Typography<T extends TRouterState = TRouterState> extends Containable<
  ITypographyProps<T>,
  ITypographyState,
  TTypographyHTMLElement
> {
  public static override get defaultProps(): ITypographyProps {
    return {
      ...super.defaultProps,
      variant: 'document',
      alignment: 'left',
      contentType: 'text',
      color: '1',
      noWrap: false,
    };
  }

  public constructor(props: ITypographyProps<T>) {
    super(props);

    let href: ITypographyState['href'];
    if (props.href) {
      if (isString(props.href)) {
        href = props.href;
      } else {
        href = app.$router.getLink(props.href);
      }
    }

    this.state = {
      ...this.state,
      href,
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<ITypographyProps<T>>,
    prevState: Readonly<ITypographyState>,
    snapshot?: TDidUpdateSnapshot
  ): void {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps.href === this.props.href) return;

    let href: ITypographyState['href'];
    if (this.props.href) {
      if (isString(this.props.href)) {
        href = this.props.href;
      } else {
        href = app.$router.getLink(this.props.href);
      }
    }
    this.setState({ href });
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-typography'] = true;
    classes['no-wrap'] = this.props.noWrap;

    if (this.props.contentType) classes[`mn-content-type-${this.props.contentType}`] = true;
    if (this.props.variant) classes[`mn-typography-${this.props.variant}`] = true;
    if (this.props.fontSize) classes[`mn-typography-${this.props.fontSize}-font-size`] = true;
    if (this.props.alignment) classes[`mn-typography-${this.props.alignment}`] = true;

    classes['bold-weight'] = !!this.props.bold;
    classes['italic-style'] = !!this.props.italic;
    classes['underline-decoration'] = !!this.props.underlined;

    if (this.props.href && isDefined(this.props.content)) {
      classes['mn-typography-anchor'] = true;
    } else if (this.props.color) {
      classes[`mn-color-${this.props.color}`] = true;
    }

    return classes;
  }

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    attributes.href = this.state.href;
    return attributes;
  }

  public override render() {
    if (isDefined(this.props.content)) {
      return this.renderWithContent();
    }
    return this.renderWithChildren();
  }

  private renderWithChildren() {
    if (isDefined(this.props.content)) return null;

    if (this.state.href) {
      return (
        <a {...this.renderAttributes()} ref={this.base as RefObject<HTMLAnchorElement>}>
          {this.children}
        </a>
      );
    }

    switch (this.props.variant) {
      case 'h1':
        return (
          <h1 {...this.renderAttributes()} ref={this.base as RefObject<HTMLHeadingElement>}>
            {this.children}
          </h1>
        );

      case 'h2':
        return (
          <h2 {...this.renderAttributes()} ref={this.base as RefObject<HTMLHeadingElement>}>
            {this.children}
          </h2>
        );

      case 'h3':
        return (
          <h3 {...this.renderAttributes()} ref={this.base as RefObject<HTMLHeadingElement>}>
            {this.children}
          </h3>
        );

      case 'h4':
        return (
          <h4 {...this.renderAttributes()} ref={this.base as RefObject<HTMLHeadingElement>}>
            {this.children}
          </h4>
        );

      case 'h5':
        return (
          <h5 {...this.renderAttributes()} ref={this.base as RefObject<HTMLHeadingElement>}>
            {this.children}
          </h5>
        );

      case 'h6':
        return (
          <h6 {...this.renderAttributes()} ref={this.base as RefObject<HTMLHeadingElement>}>
            {this.children}
          </h6>
        );

      default:
        return (
          <div ref={this.base as RefObject<HTMLDivElement>} {...this.renderAttributes()}>
            {this.children}
          </div>
        );
    }
  }

  private renderWithContent() {
    if (isUndefined(this.props.content)) return null;

    let content: string;
    if (this.props.contentType === 'markdown') {
      content = markdownToHtml(this.props.content, this.props.variant !== 'document');
    } else {
      content = this.props.content.replace(/<a/g, '<a target="_blank"');
      if (this.props.contentType !== 'html') content = escapeHTML(content);
    }

    if (this.state.href) {
      return (
        <a
          {...this.renderAttributes()}
          ref={this.base as RefObject<HTMLAnchorElement>}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    switch (this.props.variant) {
      case 'h1':
        return (
          <h1
            {...this.renderAttributes()}
            ref={this.base as RefObject<HTMLHeadingElement>}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );

      case 'h2':
        return (
          <h2
            {...this.renderAttributes()}
            ref={this.base as RefObject<HTMLHeadingElement>}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );

      case 'h3':
        return (
          <h3
            {...this.renderAttributes()}
            ref={this.base as RefObject<HTMLHeadingElement>}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );

      case 'h4':
        return (
          <h4
            {...this.renderAttributes()}
            ref={this.base as RefObject<HTMLHeadingElement>}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );

      case 'h5':
        return (
          <h5
            {...this.renderAttributes()}
            ref={this.base as RefObject<HTMLHeadingElement>}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );

      case 'h6':
        return (
          <h6
            {...this.renderAttributes()}
            ref={this.base as RefObject<HTMLHeadingElement>}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );

      case 'bullet':
        return (
          <div
            {...this.renderAttributes()}
            ref={this.base as RefObject<HTMLDivElement>}
            dangerouslySetInnerHTML={{ __html: `• ${content}` }}
          />
        );

      default:
        return (
          <div
            {...this.renderAttributes()}
            ref={this.base as RefObject<HTMLDivElement>}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );
    }
  }
}
