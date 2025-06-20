import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import { AnchorHTMLAttributes, RefObject } from 'react';
import { escapeHTML, isDefined, isString, isUndefined, markdownToHtml } from 'mn-tools';
import { IRouterHrefParams, TForegroundColor, TRouterState } from '../../system';
import { IContainableProps, IContainableState, Containable, TDidUpdateSnapshot } from '../containable';

export type TControlTextContentType = 'html' | 'markdown' | 'text';

export type TVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'document' | 'help' | 'paragraph' | 'bullet';

export type TTypographyHTMLElement = HTMLDivElement | HTMLAnchorElement | HTMLHeadingElement;

export type TTypographyFontSize = keyof Omit<IAppThemeScreensSizesFonts, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>;

export interface ITypographyProps<T extends TRouterState = TRouterState>
  extends IContainableProps<TTypographyHTMLElement> {
  fontSize?: TTypographyFontSize;
  variant: TVariant;
  sanitizeHTML?: boolean;
  alignment: 'left' | 'right' | 'center';
  content?: string;
  contentType: TControlTextContentType;
  noWrap: boolean;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  color?: TForegroundColor;
  href?: string | IRouterHrefParams<T>;
}

export interface ITypographyState extends IContainableState {
  hrefAttribute: AnchorHTMLAttributes<HTMLAnchorElement>['href'];
}

export class Typography<
  T extends TRouterState = TRouterState,
  PROPS extends ITypographyProps<T> = ITypographyProps<T>,
  STATE extends ITypographyState = ITypographyState,
> extends Containable<PROPS, STATE, TTypographyHTMLElement> {
  public static override get defaultProps(): ITypographyProps {
    return {
      ...super.defaultProps,
      variant: 'document',
      alignment: 'left',
      contentType: 'text',
      color: '1',
      noWrap: false,
      sanitizeHTML: false,
    };
  }

  public constructor(props: PROPS) {
    super(props);

    let hrefAttribute: ITypographyState['hrefAttribute'];
    if (props.href) {
      if (isString(props.href)) {
        hrefAttribute = props.href;
      } else {
        hrefAttribute = app.$router.getLink(props.href);
      }
    }

    this.state = {
      ...this.state,
      hrefAttribute,
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<PROPS>,
    prevState: Readonly<STATE>,
    snapshot?: TDidUpdateSnapshot
  ): void {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps.href === this.props.href) return;

    let hrefAttribute: ITypographyState['hrefAttribute'];
    if (this.props.href) {
      if (isString(this.props.href)) {
        hrefAttribute = this.props.href;
      } else {
        hrefAttribute = app.$router.getLink(this.props.href);
      }
    }
    this.setState({ hrefAttribute });
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
    classes['strikethrough-decoration'] = !!this.props.strikethrough;

    if (this.props.href && isDefined(this.props.content)) {
      classes['mn-typography-anchor'] = true;
    } else if (this.props.color) {
      classes[`mn-color-${this.props.color}`] = true;
    }

    return classes;
  }

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    if (this.state.hrefAttribute) attributes.href = this.state.hrefAttribute;
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

    if (this.state.hrefAttribute) {
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
      if (this.props.contentType !== 'html') {
        content = escapeHTML(content);
      } else if (this.props.sanitizeHTML) {
        content = DOMPurify.sanitize(content);
      }
    }

    const parsedNode = parse(content);
    const finalNode = this.props.variant === 'bullet' ? <>• {parsedNode}</> : parsedNode;

    if (this.state.hrefAttribute) {
      return (
        <a {...this.renderAttributes()} ref={this.base as RefObject<HTMLAnchorElement>}>
          {finalNode}
        </a>
      );
    }

    switch (this.props.variant) {
      case 'h1':
        return (
          <h1 {...this.renderAttributes()} ref={this.base as RefObject<HTMLHeadingElement>}>
            {finalNode}
          </h1>
        );

      case 'h2':
        return (
          <h2 {...this.renderAttributes()} ref={this.base as RefObject<HTMLHeadingElement>}>
            {finalNode}
          </h2>
        );

      case 'h3':
        return (
          <h3 {...this.renderAttributes()} ref={this.base as RefObject<HTMLHeadingElement>}>
            {finalNode}
          </h3>
        );

      case 'h4':
        return (
          <h4 {...this.renderAttributes()} ref={this.base as RefObject<HTMLHeadingElement>}>
            {finalNode}
          </h4>
        );

      case 'h5':
        return (
          <h5 {...this.renderAttributes()} ref={this.base as RefObject<HTMLHeadingElement>}>
            {finalNode}
          </h5>
        );

      case 'h6':
        return (
          <h6 {...this.renderAttributes()} ref={this.base as RefObject<HTMLHeadingElement>}>
            {finalNode}
          </h6>
        );

      case 'bullet':
      default:
        return (
          <div {...this.renderAttributes()} ref={this.base as RefObject<HTMLDivElement>}>
            {finalNode}
          </div>
        );
    }
  }
}
