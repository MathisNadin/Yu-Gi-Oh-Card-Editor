import { TJSXElementChild } from '../../system';
import { Typography } from '../typography';
import { IAbstractPopupProps, IAbstractPopupState, AbstractPopup } from './AbstractPopup';

export interface IInformDialogProps extends IAbstractPopupProps<void> {
  message: string;
}

interface IInformDialogState extends IAbstractPopupState {}

export class InformDialog extends AbstractPopup<void, IInformDialogProps, IInformDialogState> {
  protected override async onInitializePopup() {
    const buttons = this.state.buttons;
    buttons.push({
      name: 'Compris',
      label: 'Compris',
      color: 'primary',
      onTap: () => this.close(),
    });
    await this.setStateAsync({ buttons });
  }

  // By default there is no title, and in this Popup there is no need for the close button
  protected override renderHeader(): TJSXElementChild {
    return !!this.props.title ? super.renderHeader() : null;
  }

  public override renderContent() {
    if (!this.props.message) return null;
    return [<Typography key='message' variant='document' content={this.props.message} />];
  }
}
