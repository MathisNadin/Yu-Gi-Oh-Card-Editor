/* eslint-disable react/no-danger */
import './styles.css';
import {
  IContainableProps,
  IContainableState,
  Containable
} from 'libraries/mn-toolkit/containable/Containable';
import { markdownToHtml } from 'libraries/mn-tools';

export type TControlTextContentType = 'html' | 'markdown' | 'text';

export type TVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'label'
  | 'paragraph'
  | 'caption'
  | 'help'
  | 'bullet'
  | 'document'
  | 'attention';

interface ITypographyProps extends IContainableProps {
  /** Set the variant. */
  variant: TVariant;
  /** Set align. syntax : 'left' | 'right' | 'center' */
  alignment: 'left' | 'right' | 'center';
  /** Set content of typography. */
  content: string;
  /** syntax : 'html' | 'markdown' | 'text'   */
  contentType: TControlTextContentType;
  fill: boolean;
  /** Block wrapping. */
  noWrap: boolean;
  className: string;
}

interface ITypographyState extends IContainableState {}

export class Typography extends Containable<
  ITypographyProps,
  ITypographyState
> {
  public constructor(props: ITypographyProps) {
    super(props);

    this.state = {
      loaded: true
    };
  }

  public static get defaultProps(): Partial<ITypographyProps> {
    return {
      ...super.defaultProps,
      variant: 'paragraph',
      alignment: 'left',
      contentType: 'markdown'
    };
  }

  public renderClasses(name?: string) {
    const classes = super.renderClasses(name);
    classes['mn-typography-no-wrap'] = this.props.noWrap;
    classes[`mn-content-type-${this.props.contentType}`] = true;
    classes[`mn-typography-${this.props.variant}`] = true;
    classes[`mn-typography-${this.props.alignment}`] = true;
    return classes;
  }

  public render() {
    if (typeof this.props.content === 'undefined') {
      return this.renderAttributes(
        <div>{this.props.children}</div>,
        'mn-typography'
      );
    } else {
      return this.renderAttributes(
        <div
          dangerouslySetInnerHTML={{
            __html:
              this.props.contentType === 'markdown'
                ? markdownToHtml(
                    this.props.content,
                    this.props.variant.indexOf('document') === -1
                  )
                : this.props.content.replace(/<a/g, '<a target="_blank"')
          }}
        />,
        'mn-typography'
      );
    }
  }
}
