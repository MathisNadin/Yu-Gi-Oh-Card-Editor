import { classNames, isEmpty, Observable } from 'mn-tools';
import { TJSXElementChildren, TForegroundColor } from '../../system';
import { Containable, IContainableProps, IContainableState, TDidUpdateSnapshot } from '../containable';
import { HorizontalStack, VerticalStack } from '../container';
import { TIconId, Icon } from '../icon';
import { Typography } from '../typography';

type TFormFieldData = string | number | boolean | object;
export type TFormFieldDataType = TFormFieldData | TFormFieldData[];

export type TFormField = FormField<
  TFormFieldDataType,
  IFormFieldProps<TFormFieldDataType>,
  IFormFieldState<TFormFieldDataType>
>;

export interface IFormFieldListener {
  formFieldValidated(field: TFormField): void;
  formFieldSubmit(field: TFormField): void;
}

export interface IFormField {
  addError(message: string): Promise<void>;
  validate(): Promise<void>;
  invalidate(): Promise<void>;
}

export interface IFormFieldProps<TFormFieldDataType, FORM_ELEMENT extends HTMLElement = HTMLDivElement>
  extends IContainableProps {
  disabled?: boolean;
  autofocus?: boolean;

  defaultValue?: TFormFieldDataType;
  onChange?: (value: TFormFieldDataType) => void | Promise<void>;

  required?: boolean;
  onValidate?: (field: IFormField) => void | Promise<void>;
  onSubmit?: (event: React.KeyboardEvent<FORM_ELEMENT>) => void | Promise<void>;

  hideLabel?: boolean;
  label: string;

  infoIcon?: {
    icon: TIconId;
    hint: string;
    className?: string;
    size?: number;
    onTap?: (event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void | Promise<void>;
  };

  propIcon?: {
    icon: TIconId;
    color?: TForegroundColor;
    hint?: string;
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

export interface IFormFieldState<K> extends IContainableState {
  value: K;
  focus: boolean;
  error: boolean;
  errorMessage: string;
  validationState?: 'validating' | 'validated';
}

export abstract class FormField<
    TFormFieldDataType,
    PROPS extends IFormFieldProps<TFormFieldDataType, FORM_ELEMENT>,
    STATE extends IFormFieldState<TFormFieldDataType>,
    FORM_ELEMENT extends HTMLElement = HTMLDivElement,
  >
  extends Containable<PROPS, STATE>
  implements IFormField
{
  private type: string;
  protected validators: ((field: this) => void | Promise<void>)[];
  protected observers = new Observable<IFormFieldListener>();

  public get value() {
    return this.state.value;
  }

  public get hasValue() {
    return !isEmpty(this.value);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static override get defaultProps(): IFormFieldProps<any, any> {
    return {
      ...super.defaultProps,
      label: '',
    };
  }

  public constructor(props: PROPS, type: string) {
    super(props);
    this.state = {
      ...this.state,
      value: props.defaultValue!,
      error: false,
      focus: false,
      errorMessage: '',
      validationState: undefined,
    };

    this.type = type;
    this.validators = [];
    if (props.onValidate) this.validators.push(props.onValidate);
    this.validators.push((field) => {
      if (!field.isRequired || field.hasValue) field.validate();
      else field.addError('Nous avons besoin de quelque chose ici');
    });
  }

  public override componentDidMount() {
    super.componentDidMount();
    if (this.hasValue) app.$errorManager.handlePromise(this.doValidation());
  }

  public override componentDidUpdate(
    prevProps: Readonly<PROPS>,
    prevState: Readonly<STATE>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    app.$errorManager.handlePromise(this.updateFromNewProps(prevProps));
  }

  protected async updateFromNewProps(prevProps: Readonly<PROPS>) {
    if (prevProps === this.props) return;
    if (this.props.defaultValue === this.state.value) return;
    await this.setStateAsync({ value: this.props.defaultValue! });
    if (this.hasValue) await this.doValidation();
  }

  public addListener(listener: IFormFieldListener) {
    this.observers.addListener(listener);
  }

  protected async fireValueChanged() {
    await this.doValidation();
    this.observers.dispatch('formFieldValidated', this);
  }

  public get isRequired() {
    return !!this.props.required;
  }

  public get hasError() {
    return this.state.validationState === 'validated' && !!this.state.error;
  }

  public get isValid() {
    return this.state.validationState === 'validated' && !this.state.error;
  }

  public async doValidation() {
    await this.setStateAsync({ validationState: 'validating', error: false, errorMessage: '' });

    if (!this.validators.length) return await this.validate();

    for (const validator of this.validators) {
      await validator(this);
      if (this.hasError) break;
    }

    if (this.hasError) return;
    await this.setStateAsync({ validationState: 'validated' });
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

  public async invalidate() {
    await this.setStateAsync({
      validationState: undefined,
      error: false,
      errorMessage: '',
    });
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-form-field'] = true;
    if (this.type) classes[`mn-field-${this.type}`] = true;
    classes['mn-focus'] = this.state.focus;
    classes['has-value'] = this.hasValue;
    classes['required'] = !!this.isRequired;
    classes['error'] = this.hasError;
    if (this.state.validationState) classes[this.state.validationState] = true;
    return classes;
  }

  public override get children() {
    return [
      <VerticalStack key='field-wrapper' className='field-wrapper' fill>
        {!this.props.hideLabel && this.renderLabel()}

        <HorizontalStack fill className='input-wrapper' verticalItemAlignment='middle'>
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
        size={this.props.propIcon.size}
        onTap={this.props.propIcon.onTap}
      />
    );
  }

  protected abstract renderControl(): TJSXElementChildren;

  protected renderStatusIcon(): TJSXElementChildren {
    if (!this.props.onValidate) return;
    let statusIcon: TIconId;
    switch (this.state.validationState) {
      case 'validating':
        statusIcon = 'toolkit-sync';
        break;
      case 'validated':
        statusIcon = this.state.error ? 'toolkit-close-disc' : 'toolkit-check-disc';
        break;
      default:
        return null;
    }
    return (
      <Icon
        key='status-icon'
        className='status-icon'
        icon={statusIcon}
        onTap={!this.onStatusIconTap ? undefined : (e) => this.onStatusIconTap!(e)}
      />
    );
  }

  protected onStatusIconTap?(_e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>): Promise<void>;

  protected renderLabel() {
    if (!this.props.label) return null;
    return (
      <HorizontalStack verticalItemAlignment='middle' className='form-label'>
        <Typography
          fill={!this.props.infoIcon}
          bold
          variant='document'
          content={this.props.label}
          className={classNames({ 'form-label-with-info-icon': !!this.props.infoIcon })}
        />

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
              onTap={this.props.infoIcon.onTap}
            />
          </HorizontalStack>
        )}
      </HorizontalStack>
    );
  }

  protected async onBlur() {
    await this.setStateAsync({ focus: false });
  }

  protected async onFocus() {
    await this.setStateAsync({ focus: true });
  }

  protected async onChange(value: TFormFieldDataType) {
    await this.setStateAsync({ value });
    if (this.props.onChange) await this.props.onChange(this.state.value);
    await this.fireValueChanged();
  }
}
