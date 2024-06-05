import { IContainableProps, IContainableState, Containable } from '../containable';
import { TForegroundColor } from '../themeSettings';
import { isUndefined, markdownToHtml } from 'mn-tools';

export type TControlTextContentType = 'html' | 'markdown' | 'text';

export type TVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'document' | 'help' | 'paragraph' | 'bullet';

interface ITypographyProps extends IContainableProps {
  variant: TVariant;
  alignment: 'left' | 'right' | 'center';
  content?: string;
  contentType: TControlTextContentType;
  fill: boolean;
  noWrap: boolean;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  color?: TForegroundColor;
  className: string;
}

interface ITypographyState extends IContainableState {}

export class Typography extends Containable<ITypographyProps, ITypographyState> {
  public constructor(props: ITypographyProps) {
    super(props);
    this.state = {
      loaded: true,
    };
  }

  public static get defaultProps(): Partial<ITypographyProps> {
    return {
      ...super.defaultProps,
      variant: 'document',
      alignment: 'left',
      contentType: 'text',
      color: '1',
    };
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-typography'] = true;
    classes['mn-typography-no-wrap'] = this.props.noWrap;
    classes[`mn-content-type-${this.props.contentType}`] = true;
    classes[`mn-typography-${this.props.variant}`] = true;
    classes[`mn-typography-${this.props.alignment}`] = true;
    classes[`mn-color-${this.props.color}`] = true;
    classes['bold-weight'] = !!this.props.bold;
    classes['italic-style'] = !!this.props.italic;
    classes['underline-decoration'] = !!this.props.underlined;
    return classes;
  }

  public render() {
    if (isUndefined(this.props.content)) {
      return <div {...this.renderAttributes()}>{this.props.children}</div>;
    } else {
      let content: string;
      if (this.props.contentType === 'markdown') {
        content = markdownToHtml(this.props.content, this.props.variant.indexOf('document') === -1);
      } else {
        content = this.props.content.replace(/<a/g, '<a target="_blank"');
      }
      switch (this.props.variant) {
        case 'h1':
          return <h1 {...this.renderAttributes()}>{content}</h1>;

        case 'h2':
          return <h2 {...this.renderAttributes()}>{content}</h2>;

        case 'h3':
          return <h3 {...this.renderAttributes()}>{content}</h3>;

        case 'h4':
          return <h4 {...this.renderAttributes()}>{content}</h4>;

        case 'h5':
          return <h5 {...this.renderAttributes()}>{content}</h5>;

        case 'h6':
          return <h6 {...this.renderAttributes()}>{content}</h6>;

        case 'bullet':
          return <div {...this.renderAttributes()} dangerouslySetInnerHTML={{ __html: `• ${content}` }} />;

        default:
          return <div {...this.renderAttributes()} dangerouslySetInnerHTML={{ __html: content }} />;
      }
    }
  }
}
