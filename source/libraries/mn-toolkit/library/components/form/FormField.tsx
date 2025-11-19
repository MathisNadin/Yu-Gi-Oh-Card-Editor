import { classNames, isEmpty } from 'mn-tools';
import { TJSXElementChildren, TForegroundColor } from '../../system';
import { Containable, IContainableProps, IContainableState, TDidUpdateSnapshot } from '../containable';
import { HorizontalStack, VerticalStack } from '../container';
import { TIconId, Icon } from '../icon';
import { Typography } from '../typography';
import { FormContext } from './FormContext';

type TFormFieldData = string | number | boolean | object | undefined;
export type TFormFieldDataType = TFormFieldData | TFormFieldData[];

export type TFormField = FormField<TFormFieldDataType, IFormFieldProps<TFormFieldDataType>, IFormFieldState>;

export interface IFormField {
  addError(message: string): Promise<void>;
  validate(): Promise<void>;
  unvalidate(): Promise<void>;
}

export interface IFormFieldProps<TFormFieldDataType> extends IContainableProps {
  autofocus?: boolean;

  value: TFormFieldDataType;
  onChange: (value: TFormFieldDataType) => void | Promise<void>;

  required?: boolean;
  onValidate?: (field: IFormField) => void | Promise<void>;

  fieldId: string;
  fieldName: string;

  hideLabel?: boolean;
  label: string;

  infoIcon?: {
    icon: TIconId;
    hint: string;
    name?: string;
    className?: string;
    size?: number;
    onTap?: (event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void | Promise<void>;
  };

  propIcon?: {
    icon: TIconId;
    color?: TForegroundColor;
    hint?: string;
    name?: string;
    className?: string;
    size?: number;
    onTap?: (event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void | Promise<void>;
  };

  helper?: {
    text: string;
    color?: TForegroundColor;
    icon?: TIconId;
  };
}

export interface IFormFieldState extends IContainableState {
  focus: boolean;
  error: boolean;
  errorMessage: string;
  validationState?: 'validating' | 'validated';
}

export abstract class FormField<
    TFormFieldDataType,
    PROPS extends IFormFieldProps<TFormFieldDataType>,
    STATE extends IFormFieldState,
  >
  extends Containable<PROPS, STATE>
  implements IFormField
{
  public static override contextType = FormContext;
  declare public context: React.ContextType<typeof FormContext>;

  private type: string;
  protected validators: ((field: this) => void | Promise<void>)[];
  private shouldValidateValue = false;

  public static override get defaultProps(): Omit<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    IFormFieldProps<any>,
    'label' | 'value' | 'onChange' | 'fieldId' | 'fieldName'
  > {
    return {
      ...super.defaultProps,
    };
  }

  public constructor(props: PROPS, type: string) {
    super(props);
    this.state = {
      ...this.state,
      error: false,
      focus: false,
      errorMessage: '',
      validationState: undefined,
    };

    this.type = type;

    this.validators = [];
    if (props.onValidate) this.validators.push(props.onValidate);

    // built-in required check
    this.validators.push(async (field) => {
      if (field.props.required && !field.hasValue) {
        await field.addError('Nous avons besoin de quelque chose ici');
      }
    });
  }

  public override componentDidMount() {
    super.componentDidMount();
    if (this.context?.registerField) this.context.registerField(this as unknown as TFormField);
    if (this.hasValue) app.$errorManager.handlePromise(this.doValidation());
  }

  public override componentDidUpdate(
    prevProps: Readonly<PROPS>,
    prevState: Readonly<STATE>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (this.shouldValidateValue) {
      this.shouldValidateValue = false;
      app.$errorManager.handlePromise(this.fireValueChanged());
    }
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    if (this.context?.unregisterField) this.context.unregisterField(this as unknown as TFormField);
  }

  public get value(): PROPS['value'] {
    return this.props.value;
  }

  public get hasValue(): boolean {
    return !isEmpty(this.value);
  }

  public get hasError(): boolean {
    return this.state.validationState === 'validated' && !!this.state.error;
  }

  public get isValid(): boolean {
    return this.state.validationState === 'validated' && !this.state.error;
  }

  public async doValidation() {
    await this.setStateAsync({ validationState: 'validating', error: false, errorMessage: '' });

    if (!this.validators.length) return await this.validate();

    for (const validator of this.validators) {
      await validator(this);
      if (this.hasError) return;
    }

    await this.validate();
  }

  public async addError(errorMessage: string) {
    await this.setStateAsync({
      validationState: 'validated',
      error: true,
      errorMessage,
    });
  }

  public async validate() {
    await this.setStateAsync({
      validationState: 'validated',
      error: false,
      errorMessage: '',
    });
  }

  public async unvalidate() {
    await this.setStateAsync({
      validationState: undefined,
      error: false,
      errorMessage: '',
    });
  }

  protected async onBlur() {
    await this.setStateAsync({ focus: false });
  }

  protected async onFocus() {
    await this.setStateAsync({ focus: true });
  }

  protected async onChange(value: TFormFieldDataType) {
    this.shouldValidateValue = true;
    await this.props.onChange(value);
  }

  // notify form of validation result
  protected async fireValueChanged() {
    await this.doValidation();
    if (this.context?.notifyFieldChange) this.context.notifyFieldChange(this as unknown as TFormField);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-form-field'] = true;
    if (this.type) classes[`mn-field-${this.type}`] = true;
    classes['mn-focus'] = this.state.focus;
    classes['has-value'] = this.hasValue;
    classes['required'] = !!this.props.required;
    classes['error'] = this.hasError;
    if (this.state.validationState) classes[this.state.validationState] = true;
    return classes;
  }

  public override get children() {
    return [
      <VerticalStack key='field-wrapper' className='field-wrapper' fill>
        {!this.props.hideLabel && this.renderLabel()}

        <HorizontalStack fill className='input-wrapper' padding='small' gutter='small' verticalItemAlignment='middle'>
          {this.renderPropIcon()}
          {this.renderControl()}
          {this.renderStatusIcon()}
        </HorizontalStack>
      </VerticalStack>,

      !this.state.error && !!this.props.helper?.text && (
        <HorizontalStack key='form-helper' className='form-helper helper-message'>
          {!!this.props.helper.icon && <Icon icon={this.props.helper.icon} color={this.props.helper.color} />}
          <Typography variant='help' color={this.props.helper.color} content={this.props.helper.text} />
        </HorizontalStack>
      ),

      !!this.state.error && !!this.state.errorMessage && (
        <HorizontalStack key='form-error-message' className='form-helper helper-error'>
          <Typography color='negative' variant='help' content={this.state.errorMessage} />
        </HorizontalStack>
      ),
    ];
  }

  protected renderPropIcon(): TJSXElementChildren {
    if (!this.props.propIcon) return null;
    return (
      <Icon
        className={classNames('prop-icon', this.props.propIcon.className)}
        icon={this.props.propIcon.icon}
        color={this.props.propIcon.color}
        hint={this.props.propIcon.hint}
        name={this.props.propIcon.name}
        size={this.props.propIcon.size}
        onTap={this.props.propIcon.onTap}
      />
    );
  }

  protected abstract renderControl(): TJSXElementChildren;

  protected renderStatusIcon(): TJSXElementChildren {
    if (!this.props.onValidate) return null;
    let statusIcon: TIconId;
    let statusName: string;
    switch (this.state.validationState) {
      case 'validating':
        statusIcon = 'toolkit-sync';
        statusName = 'En cours de validation';
        break;
      case 'validated':
        statusIcon = this.state.error ? 'toolkit-close-disc' : 'toolkit-check-disc';
        statusName = this.state.error ? 'Le champ a une erreur' : 'Le champ est valide';
        break;
      default:
        return null;
    }
    return (
      <Icon
        key='status-icon'
        className='status-icon'
        name={statusName}
        icon={statusIcon}
        onTap={!this.onStatusIconTap ? undefined : (e) => this.onStatusIconTap!(e)}
      />
    );
  }

  protected onStatusIconTap?(_e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>): Promise<void>;

  protected renderLabel() {
    if (!this.props.label) return null;
    return (
      <HorizontalStack verticalItemAlignment='middle' className='form-label-container'>
        <label
          htmlFor={this.props.fieldId}
          className={classNames('form-label', {
            'with-info-icon': !!this.props.infoIcon,
            'mn-fill': !this.props.infoIcon,
          })}
        >
          {this.props.label}
        </label>

        {!!this.props.infoIcon && (
          <HorizontalStack
            fill
            hint={this.props.infoIcon.hint}
            className='form-field-info-icon-tip'
            height={this.props.infoIcon.size || 18}
          >
            <Icon
              className={classNames('form-field-info-icon', this.props.infoIcon.className)}
              icon={this.props.infoIcon.icon || 'toolkit-info-circle'}
              size={this.props.infoIcon.size || 18}
              name={this.props.infoIcon.name}
              onTap={this.props.infoIcon.onTap}
            />
          </HorizontalStack>
        )}
      </HorizontalStack>
    );
  }
}
