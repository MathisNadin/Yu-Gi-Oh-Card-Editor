import { classNames } from 'mn-tools';
import { IFormFieldListener, TFormField } from '.';
import { Container, IContainerProps, IContainerState } from '../container';

export interface IFormProps extends IContainerProps {
  onSubmit?: () => void | Promise<void>;
  onChange?: (form: Form) => void | Promise<void>;
}

export interface IFormState extends IContainerState {
  valid: boolean;
}

export class Form extends Container<IFormProps, IFormState> implements IFormFieldListener {
  private formElement!: HTMLFormElement;
  private fields: TFormField[] = [];

  public static get defaultProps(): Partial<IFormProps> {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      fill: true,
      scroll: true,
      gutter: true,
    };
  }

  public constructor(props: IFormProps) {
    super(props);
  }

  public componentDidMount() {
    const children = this.formElement!.querySelectorAll('.mn-form-field *');
    const childrenComponents: TFormField[] = [];
    children.forEach((x) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((x as any)._component) childrenComponents.push((x as any)._component as TFormField);
    });
    for (const field of childrenComponents) {
      this.fields.push(field);
      field.addListener(this);
    }
  }

  public componentWillUnmount() {
    this.fields = [];
    this.formElement.removeEventListener('submit', this.defaultSubmitListener);
  }

  public registerFormElement(e: HTMLFormElement | null) {
    if (!e) return;
    this.formElement = e;
    e.addEventListener('submit', this.defaultSubmitListener);
  }

  private defaultSubmitListener = (e: Event) => {
    e.preventDefault();
    return false;
  };

  public formFieldValidated(_field: TFormField) {
    if (this.props.onChange) app.$errorManager.handlePromise(this.props.onChange(this));
  }

  public formFieldSubmit(_field: TFormField) {}

  public async validate() {
    for (const field of this.fields) {
      await field.doValidation();
    }
  }

  public submit() {
    if (this.props.onSubmit) app.$errorManager.handlePromise(this.props.onSubmit());
  }

  public get hasError() {
    for (const field of this.fields) {
      if (field.hasError) return true;
    }
    return false;
  }

  public get isValid() {
    for (const field of this.fields) {
      if (!field.isValid) return false;
    }
    return !this.hasError;
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-form'] = true;
    classes['mn-fieldset'] = true;
    if (this.hasError) classes['has-error'] = true;
    if (this.isValid) classes['is-valid'] = true;
    return classes;
  }

  public render() {
    return (
      <form
        ref={(c) => this.registerFormElement(c)}
        name={this.props.name}
        id={this.props.nodeId}
        title={this.props.hint}
        className={classNames(this.renderClasses())}
      >
        {this.inside}
      </form>
    );
  }
}
