import { TJSXElementChild } from '../../system';
import { Button } from '../button';
import { HorizontalStack, IContainerProps } from '../container';
import { Form } from '../form';
import { TextAreaInputField } from '../textAreaInput';
import { TextInputField } from '../textInput';
import { IAbstractPopupProps, IAbstractPopupState, AbstractPopup } from './AbstractPopup';

export interface IPromptDialogProps extends IAbstractPopupProps<string> {
  defaultValue?: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'textarea';
}

interface IPromptDialogState extends IAbstractPopupState {
  value: string;
}

export class PromptDialog extends AbstractPopup<string, IPromptDialogProps, IPromptDialogState> {
  // By default there is no title, and in this Popup there is no need for the close button
  protected override renderHeader(): TJSXElementChild {
    return !!this.props.title ? super.renderHeader() : null;
  }

  protected override get contentContainerGutter(): IContainerProps['gutter'] {
    return 'default';
  }

  protected override renderContent() {
    return [
      <Form key='form' fill={false} scroll={false}>
        {this.props.type === 'textarea' ? (
          <TextAreaInputField
            autofocus
            fieldId='prompt-textarea'
            fieldName='prompt-textarea'
            label={this.props.label}
            placeholder={this.props.placeholder}
            value={this.state.value}
            onChange={(value) => this.setStateAsync({ value })}
          />
        ) : (
          <TextInputField
            autofocus
            fieldId='prompt-text'
            fieldName='prompt-text'
            label={this.props.label}
            placeholder={this.props.placeholder}
            value={this.state.value}
            onChange={(value) => this.setStateAsync({ value })}
            onSubmit={() => this.close(this.state.value)}
          />
        )}
      </Form>,
      <HorizontalStack key='button' gutter itemAlignment='right'>
        <Button name='Annuler' label='Annuler' color='neutral' onTap={() => this.close()} />
        <Button name='Valider' label='Valider' color='primary' onTap={() => this.close(this.state.value)} />
      </HorizontalStack>,
    ];
  }
}
