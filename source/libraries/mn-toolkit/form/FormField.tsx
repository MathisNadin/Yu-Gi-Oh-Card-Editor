import { classNames, isEmpty, isUndefined, Observable } from 'mn-tools';
import { IFormFieldListener } from '.';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { HorizontalStack } from '../container';
import { TIconId, Icon } from '../icon';
import { TForegroundColor } from '../themeSettings';
import { Typography } from '../typography';
import { ReactElement } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TFormField = FormField<any, IFormFieldProps<any>, IFormFieldState<any>>;

export enum ValidationState {
  validating = 'validating',
  validated = 'validated',
}

export interface IFormFieldProps<DATA_TYPE> extends IContainableProps {
  /** Function when user validate. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValidate?: (field: IFormField) => void | Promise<void>;

  /** Enter has be pressed or something like this */
  onSubmit?: (event: React.KeyboardEvent) => void | Promise<void>;

  /** Set the default value. */
  defaultValue?: DATA_TYPE;
  /** Function when changes was detected. */
  onChange?: (value: DATA_TYPE) => void | Promise<void>;
  /** Text to help the user. */
  helper?: string;
  helperColor?: TForegroundColor;
  helperIcon?: TIconId;
  /** Text in front of the field. */
  label?: string;
  /** Set requirement. */
  required?: boolean;
  /** Set disable. */
  disabled?: boolean;
  /** Set autofocus. */
  autofocus?: boolean;
  /** Set icon. */
  icon?: TIconId;
  /** Set default icon color. */
  defaultIconColor?: TForegroundColor;
  /** Set placeholder. */
  placeholder?: string;
  /** Set errorMessage. */
  errorMessage?: string;
  name?: string;
  notAnimated?: boolean;
  showLabel: boolean;
  showDecoration: boolean;

  showInfoIcon?: boolean;
  infoTIconId?: TIconId;
  infoIconClassName?: string;
  infoIconSize?: number;
  infoIconHint?: string;
  onTapInfoIcon?: () => void | Promise<void>;
  validationDelay: number;
}

export interface IFormFieldState<K> extends IContainableState {
  value: K;
  focus: boolean;
  autofill: boolean;
  error: boolean;
  errorMessage: string;
  validationState: ValidationState;
  showDecoration: boolean;
  showLabel: boolean;
}

class Validator<DATA_TYPE> implements IFormField {
  private field: TFormField;
  private resolve: (value?: void | Promise<void>) => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(field: any, resolve: (value?: void | Promise<void>) => void) {
    this.field = field;
    this.resolve = resolve;
  }

  public addError(message: string) {
    this.field.addError(message);
    this.resolve();
  }

  public validate() {
    this.field.validate();
    this.resolve();
  }

  public invalidate() {
    this.field.invalidate();
    this.resolve();
  }

  public get value(): DATA_TYPE {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-explicit-any
    return (this.field as any).value;
  }
}

export interface IFormField {
  addError(message: string): void;
  validate(): void;
}

export abstract class FormField<
    DATA_TYPE,
    PROPS extends IFormFieldProps<DATA_TYPE>,
    STATE extends IFormFieldState<DATA_TYPE>,
  >
  extends Containable<PROPS, STATE>
  implements IFormField
{
  private type: string;
  private validationTimeout!: NodeJS.Timeout;
  protected validators: ((field: IFormField, value?: void | Promise<void>) => void | Promise<void>)[] = [];
  protected observers = new Observable<IFormFieldListener>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static get defaultProps(): IFormFieldProps<any> {
    return {
      disabled: false,
      required: false,
      autofocus: false,
      showDecoration: true,
      showLabel: true,
      validationDelay: 0,
      defaultIconColor: undefined,
    };
  }

  public constructor(props: PROPS, type?: string) {
    super(props);
    this.type = type!;
    if (props.onValidate) this.validators.push(props.onValidate);
  }

  public get hasValue() {
    return !isEmpty(this.state.value);
  }

  public get value() {
    return this.state.value;
  }

  private get showDecoration() {
    if (isUndefined(this.props.showDecoration)) {
      return false;
    } else {
      return this.props.showDecoration;
    }
  }

  public addListener(listener: IFormFieldListener) {
    this.observers.addListener(listener);
  }

  public fireValueChanged() {
    const validate = async () => {
      await this.doValidation();
      this.observers.dispatch('formFieldValidated', this);
    };

    if (this.props.validationDelay) {
      clearTimeout(this.validationTimeout);
      this.validationTimeout = setTimeout(() => {
        validate().catch((e) => app.$errorManager.trigger(e));
      }, 500);
    } else {
      return app.$errorManager.handlePromise(validate());
    }
  }

  public async doValidation() {
    this.setState({ validationState: ValidationState.validating, error: false, errorMessage: undefined! });

    if (!this.validators.length) {
      this.validate();
      return;
    }

    for (const validator of this.validators) {
      this.setState({ validationState: ValidationState.validating });
      const promise = new Promise<void>((resolve) => {
        app.$errorManager.handlePromise(validator(new Validator(this, resolve)));
      });
      await promise;
      if (this.hasError) break;
    }
    if (!this.hasError) {
      this.setState({ validationState: ValidationState.validated });
    }
  }

  public addError(errorMessage: string) {
    this.setState({
      validationState: ValidationState.validated,
      error: true,
      errorMessage,
    });
  }

  public validate() {
    this.setState({
      validationState: ValidationState.validated,
      error: false,
      errorMessage: undefined!,
    });
  }

  public invalidate() {
    this.setState({
      validationState: undefined!,
      error: false,
      errorMessage: undefined!,
    });
  }

  public get hasError() {
    return !!this.state.error;
  }

  public get isValid() {
    return this.state.validationState === ValidationState.validated;
  }

  protected onBlur() {
    this.setState({ focus: false });
  }

  protected onFocus() {
    this.setState({ focus: true });
  }

  public onAutoFill(value: boolean) {
    if (this.state.autofill === value) return;
    this.setState({ autofill: value });
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-form-field'] = true;
    if (!!this.type) classes[`mn-field-${this.type}`] = true;
    classes['focus'] = this.state.focus;
    classes['autofill'] = this.state.autofill;
    classes['has-value'] = this.hasValue || !!this.props.placeholder;
    classes['mn-control-disabled'] = !!this.props.disabled;
    classes['required'] = !!this.props.required;
    classes['error'] = this.state.error;
    classes['not-animated'] = !!this.props.notAnimated;
    classes['has-validator'] = !!this.props.onValidate;
    classes['validating'] = this.state.validationState === ValidationState.validating;
    classes['validated'] = this.state.validationState === ValidationState.validated;
    classes['mn-containable-item-fill'] = !!this.props.fill;
    return classes;
  }

  protected abstract renderControl(): ReactElement;

  public renderStatusIcon() {
    let statusIcon!: TIconId;
    if (this.props.onValidate) {
      if (this.state.validationState === ValidationState.validating) {
        statusIcon = 'toolkit-sync';
      } else if (this.state.validationState === ValidationState.validated) {
        if (this.state.error) {
          statusIcon = 'toolkit-close-disc';
        } else {
          statusIcon = 'toolkit-check-disc';
        }
      }
    }
    if (statusIcon) {
      return [
        <Icon
          key={`status-icon-${this.props.nodeId}`}
          style={{ position: 'relative', top: -3 }}
          iconId={statusIcon}
          className='status-icon'
          onTap={(e) => this.onStatusIconClick(e)}
        />,
      ];
    }
    return null;
  }

  public renderIcon() {
    return (
      !!this.props.icon && <Icon className='prop-icon' color={this.props.defaultIconColor} iconId={this.props.icon} />
    );
  }

  public render() {
    return (
      <div {...this.renderAttributes()} onClick={(e) => this.doClickItem(e)}>
        <div
          id={this.props.nodeId}
          title={this.props.hint}
          className={classNames('field-wrapper', { decorated: this.showDecoration })}
        >
          {this.renderLabel()}

          <div className='input-wrapper'>
            {this.renderIcon()}
            {this.renderControl()}
            {this.renderStatusIcon()}
          </div>
        </div>

        {!!this.state.error && <div className='form-helper'>{this.state.errorMessage}</div>}

        {!this.state.error && this.props.helper && (
          <HorizontalStack className='form-helper'>
            {this.props.helperIcon && <Icon size={128} iconId={this.props.helperIcon} color={this.props.helperColor} />}
            <Typography variant='help' color={this.props.helperColor} content={this.props.helper} />
          </HorizontalStack>
        )}
      </div>
    );
  }

  protected renderLabel() {
    if (!this.props.label || !this.props.showLabel) return undefined;
    return (
      <HorizontalStack verticalItemAlignment='middle' className='form-label'>
        <Typography
          fill={!this.props.showInfoIcon}
          bold
          variant='document'
          content={this.props.label}
          className={this.props.showInfoIcon ? 'form-label-with-info-icon' : ''}
        />

        {this.props.showInfoIcon && (
          <HorizontalStack
            fill
            hint={this.props.infoIconHint}
            className='form-field-info-icon-tip'
            height={this.props.infoIconSize || 18}
          >
            <Icon
              className={classNames('form-field-info-icon', this.props.infoIconClassName)}
              iconId={this.props.infoTIconId || 'toolkit-info-circle'}
              size={this.props.infoIconSize || 18}
              onTap={
                this.props.onTapInfoIcon
                  ? () => app.$errorManager.handlePromise(this.props.onTapInfoIcon!())
                  : undefined
              }
            />
          </HorizontalStack>
        )}
      </HorizontalStack>
    );
  }

  protected doClickItem(_e: React.MouseEvent): void {}

  protected onStatusIconClick(_e: React.MouseEvent): void {}
}
