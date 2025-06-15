import { Form } from '../form';
import { TextAreaField } from '../textAreaInput';
import { TextInputField } from '../textInput';
import { IAbstractPopupProps, IAbstractPopupState, AbstractPopup } from './AbstractPopup';

export interface IPromptDialogProps extends IAbstractPopupProps<string> {
  defaultValue?: string;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'textarea';
}

interface IPromptDialogState extends IAbstractPopupState {
  value: string;
}

export class PromptDialog extends AbstractPopup<string, IPromptDialogProps, IPromptDialogState> {
  protected override async onInitializePopup() {
    const buttons = this.state.buttons;
    buttons.push({
      name: 'Valider',
      label: 'Valider',
      color: 'primary',
      onTap: () => this.close(this.state.value),
    });
    await this.setStateAsync({ buttons, value: this.props.defaultValue || '' });
  }

  public override renderContent() {
    return (
      <Form fill={false} scroll={false}>
        {this.props.type === 'textarea' ? (
          <TextAreaField
            autofocus
            label={this.props.label}
            placeholder={this.props.placeholder}
            defaultValue={this.state.value}
            onChange={(value) => this.setStateAsync({ value })}
          />
        ) : (
          <TextInputField
            autofocus
            label={this.props.label}
            placeholder={this.props.placeholder}
            defaultValue={this.state.value}
            onChange={(value) => this.setStateAsync({ value })}
            onSubmit={() => this.close(this.state.value)}
          />
        )}
      </Form>
    );
  }
}
