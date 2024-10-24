import { Typography } from '../typography';
import { ButtonLink } from '../button';
import { HorizontalStack } from '../container';
import { IAbstractPopupProps, IAbstractPopupState, AbstractPopup } from './AbstractPopup';

export interface IChoiceDialogChoice<ID = string> {
  id: ID;
  label: string;
}

export interface IChoiceDialogProps<ID = string> extends IAbstractPopupProps<ID> {
  message: string;
  choices: IChoiceDialogChoice<ID>[];
}

interface IChoiceDialogState extends IAbstractPopupState {}

export class ChoiceDialog<ID = string> extends AbstractPopup<ID, IChoiceDialogProps<ID>, IChoiceDialogState> {
  public override renderContent() {
    if (!this.props.message) return null;
    return [
      <Typography key='message' variant='document' content={this.props.message} />,
      <HorizontalStack key='choices' gutter itemAlignment='right'>
        {this.props.choices.map((choice, i) => (
          <ButtonLink key={`choice-${i}`} label={choice.label} onTap={() => this.close(choice.id)} />
        ))}
      </HorizontalStack>,
    ];
  }
}
