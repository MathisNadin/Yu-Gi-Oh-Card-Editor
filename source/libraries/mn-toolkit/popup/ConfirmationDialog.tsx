import { Typography } from 'mn-toolkit/typography';
import { IAbstractPopupProps, IAbstractPopupState, AbstractPopup } from './AbstractPopup';

interface IConfirmationDialogProps extends IAbstractPopupProps<boolean> {
  message?: string;
}

interface IConfirmationDialogState extends IAbstractPopupState {}

export class ConfirmationDialog extends AbstractPopup<boolean, IConfirmationDialogProps, IConfirmationDialogState> {
  public static async show(options: IConfirmationDialogProps) {
    options.title = options.title || 'Confirmez';
    options.height = options.height || '150px';
    options.width = options.width || '325px';
    return await app.$popup.show<boolean, IConfirmationDialogProps>({
      type: 'confirmation',
      Component: ConfirmationDialog,
      componentProps: options,
    });
  }

  protected onInitializePopup = async () => {
    const buttons = this.state.buttons;
    buttons.push({
      label: 'Annuler',
      onTap: () => this.close(false),
    });
    buttons.push({
      label: 'Valider',
      color: 'primary',
      onTap: () => this.close(true),
    });
    await this.setStateAsync({ buttons });
  };

  public renderContent() {
    if (!this.props.message) return null;
    return <Typography content={this.props.message} />;
  }
}
