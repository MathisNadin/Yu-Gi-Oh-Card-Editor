import { TJSXElementChild, TForegroundColor } from '../../system';
import { TControlTextContentType, Typography } from '../typography';
import { Icon, TIconId } from '../icon';
import { IAbstractPopupProps, IAbstractPopupState, AbstractPopup } from './AbstractPopup';
import { HorizontalStack, VerticalStack } from '../container';
import { TextInputField } from '../textInput';

export interface IConfirmationDialogProps extends IAbstractPopupProps<boolean> {
  message?: string;
  messageContentType?: TControlTextContentType;
  confirmationWord?: string;
  icon?: TIconId;
  iconColor?: TForegroundColor;
}

interface IConfirmationDialogState extends IAbstractPopupState {
  confirmationLabel: string;
  confirmationResponse: string;
  confirmationError: string;
}

export class ConfirmationDialog extends AbstractPopup<boolean, IConfirmationDialogProps, IConfirmationDialogState> {
  public static override get defaultProps(): IConfirmationDialogProps {
    return {
      ...super.defaultProps,
      messageContentType: 'markdown',
    };
  }

  protected override async onInitializePopup() {
    const buttons = this.state.buttons;
    buttons.push({
      label: 'Annuler',
      color: 'neutral',
      onTap: () => this.close(false),
    });
    buttons.push({
      label: 'Valider',
      color: 'primary',
      onTap: async () => {
        if (
          this.props.confirmationWord &&
          this.state.confirmationResponse.toLowerCase() !== this.props.confirmationWord.toLowerCase()
        ) {
          await this.setStateAsync({ confirmationError: "Vous n'avez pas saisi le même mot, veuillez recommencer" });
        } else {
          await this.close(true);
        }
      },
    });

    let confirmationLabel = '';
    if (this.props.confirmationWord) {
      confirmationLabel = `Tapez le mot&nbsp;: **${this.props.confirmationWord}**`;
    }

    await this.setStateAsync({ buttons, confirmationLabel, confirmationResponse: '', confirmationError: '' });
  }

  // By default there is no title, and in this Popup there is no need for the close button
  protected override renderHeader(): TJSXElementChild {
    return !!this.props.title ? super.renderHeader() : null;
  }

  public override renderContent() {
    const { message, messageContentType, icon, iconColor, confirmationWord } = this.props;
    if (!message) return null;

    const { confirmationError, confirmationLabel, confirmationResponse } = this.state;
    return [
      <HorizontalStack gutter key='message'>
        {!!icon && <Icon icon={icon} color={iconColor} size={128} />}
        <Typography fill variant='document' contentType={messageContentType} content={message} />
      </HorizontalStack>,
      !!confirmationWord && (
        <VerticalStack gutter className='confirmator' key='confirmator'>
          <Typography
            className='confirmation-message'
            variant='label'
            contentType='markdown'
            content={confirmationLabel}
          />
          <TextInputField
            autofocus
            hideLabel
            defaultValue={confirmationResponse}
            onChange={(confirmationResponse) => this.setState({ confirmationResponse })}
          />
          {!!confirmationError && (
            <Typography className='confirmation-error' variant='help' contentType='html' content={confirmationError} />
          )}
        </VerticalStack>
      ),
    ];
  }
}
