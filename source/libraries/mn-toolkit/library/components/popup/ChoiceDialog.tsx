import { TForegroundColor } from '../../system';
import { HorizontalStack } from '../container';
import { TControlTextContentType, Typography } from '../typography';
import { ButtonLink } from '../button';
import { IAbstractPopupProps, IAbstractPopupState, AbstractPopup } from './AbstractPopup';

export interface IChoiceDialogChoice<ID = string> {
  id: ID;
  label: string;
  name?: string;
  hint?: string;
  color?: TForegroundColor;
}

export interface IChoiceDialogProps<ID = string> extends IAbstractPopupProps<ID> {
  message: string;
  messageType?: TControlTextContentType;
  choices: IChoiceDialogChoice<ID>[];
}

interface IChoiceDialogState extends IAbstractPopupState {}

export class ChoiceDialog<ID = string> extends AbstractPopup<ID, IChoiceDialogProps<ID>, IChoiceDialogState> {
  public static override get defaultProps(): Omit<IChoiceDialogProps<string>, 'message' | 'choices'> {
    return {
      ...super.defaultProps,
      messageType: 'text',
    };
  }

  public override renderContent() {
    if (!this.props.message) return null;
    return [
      <Typography key='message' variant='document' contentType={this.props.messageType} content={this.props.message} />,
      <HorizontalStack key='choices' gutter itemAlignment='right'>
        {this.props.choices.map((choice, i) => (
          <ButtonLink
            key={`choice-${i}`}
            hint={choice.hint}
            name={choice.name}
            label={choice.label}
            color={choice.color}
            onTap={() => this.close(choice.id)}
          />
        ))}
      </HorizontalStack>,
    ];
  }
}
