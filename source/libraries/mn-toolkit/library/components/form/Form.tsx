import { Container, IContainerProps, IContainerState } from '../container';
import { IFormFieldListener, TFormField } from './FormField';

export interface IFormProps extends IContainerProps<HTMLFormElement> {
  onFieldChange?: (field: TFormField) => void | Promise<void>;
  onFieldSubmit?: (field: TFormField) => void | Promise<void>;
}

interface IFormState extends IContainerState {}

export class Form extends Container<IFormProps, IFormState, HTMLFormElement> implements IFormFieldListener {
  private fields: TFormField[] = [];

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
    return true;
  }

  public static override get defaultProps(): IFormProps {
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

  public override componentDidMount() {
    super.componentDidMount();
    if (!this.base.current) return;

    this.base.current.addEventListener('submit', this.defaultSubmitListener);

    const children = this.base.current.querySelectorAll<HTMLDivElement>('.mn-form-field');
    const childrenComponents: TFormField[] = [];
    children.forEach((child) => {
      const reactComponent = this.findReactComponent<TFormField>(child);
      if (reactComponent) childrenComponents.push(reactComponent);
    });

    for (const field of childrenComponents) {
      this.fields.push(field);
      field.addListener(this);
    }
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    this.fields = [];
    if (this.base.current) {
      this.base.current.removeEventListener('submit', this.defaultSubmitListener);
    }
  }

  private defaultSubmitListener = (e: Event) => {
    e.preventDefault();
    return false;
  };

  private findReactComponent<T>(domNode: HTMLDivElement): T | null {
    const key = Object.keys(domNode).find(
      (key) => key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')
    );
    if (!key) return null;

    const internalInstance = (
      domNode as unknown as Record<
        typeof key,
        {
          return?: {
            stateNode: T;
          };
        }
      >
    )[key];
    if (internalInstance?.return?.stateNode) return internalInstance.return.stateNode;
    return null;
  }

  public async validate() {
    for (const field of this.fields) {
      await field.doValidation();
    }
  }

  public formFieldValidated(field: TFormField) {
    if (!this.props.onFieldChange) return;
    app.$errorManager.handlePromise(this.props.onFieldChange(field));
  }

  public formFieldSubmit(field: TFormField) {
    if (!this.props.onFieldSubmit) return;
    app.$errorManager.handlePromise(this.props.onFieldSubmit(field));
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-form'] = true;
    return classes;
  }

  public override render() {
    return (
      <form ref={this.base} {...this.renderAttributes()}>
        {this.inside}
      </form>
    );
  }
}
