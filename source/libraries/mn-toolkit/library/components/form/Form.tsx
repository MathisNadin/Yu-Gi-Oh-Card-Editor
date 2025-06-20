import { Container, IContainerProps, IContainerState } from '../container';
import { FormContext, IFormContext } from './FormContext';
import { TFormField } from './FormField';

export interface IFormProps extends IContainerProps<HTMLFormElement> {
  onFieldChange?: (field: TFormField) => void | Promise<void>;
  onFieldSubmit?: (field: TFormField) => void | Promise<void>;
}

export interface IFormState extends IContainerState {}

export class Form<PROPS extends IFormProps = IFormProps, STATE extends IFormState = IFormState> extends Container<
  PROPS,
  STATE,
  HTMLFormElement
> {
  private fields = new Set<TFormField>();
  private contextValue: IFormContext;

  public static override get defaultProps(): IFormProps {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      fill: true,
      scroll: true,
      gutter: true,
    };
  }

  public constructor(props: PROPS) {
    super(props);
    // bind context methods
    this.contextValue = {
      registerField: this.registerField,
      unregisterField: this.unregisterField,
      notifyFieldChange: this.handleFieldChange,
      notifyFieldSubmit: this.handleFieldSubmit,
    };
  }

  // register a field
  private registerField = (field: TFormField) => {
    this.fields.add(field);
  };

  // unregister a field
  private unregisterField = (field: TFormField) => {
    this.fields.delete(field);
  };

  // called by fields when their value or validation changes
  private handleFieldChange = (field: TFormField) => {
    if (this.props.onFieldChange) {
      app.$errorManager.handlePromise(this.props.onFieldChange(field));
    }
  };

  // called by fields on submit (e.g. Enter key)
  private handleFieldSubmit = (field: TFormField) => {
    if (this.props.onFieldSubmit) {
      app.$errorManager.handlePromise(this.props.onFieldSubmit(field));
    }
  };

  public get hasError() {
    return Array.from(this.fields).some((field) => field.hasError);
  }

  public get isValid() {
    return Array.from(this.fields).every((field) => field.isValid);
  }

  public async validate() {
    for (const field of this.fields) {
      await field.doValidation();
    }
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-form'] = true;
    return classes;
  }

  public override render() {
    return (
      <FormContext.Provider value={this.contextValue}>
        <form
          ref={this.base as React.RefObject<HTMLFormElement>}
          {...(this.renderAttributes() as React.AllHTMLAttributes<HTMLFormElement>)}
          onSubmit={(e) => e.preventDefault()}
        >
          {this.inside}
        </form>
      </FormContext.Provider>
    );
  }
}
