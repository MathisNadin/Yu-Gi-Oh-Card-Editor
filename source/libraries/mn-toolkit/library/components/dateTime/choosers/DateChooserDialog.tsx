import { IAbstractPopupProps, IAbstractPopupState, AbstractPopup } from '../../popup';
import { DateChooser } from './DateChooser';

export interface IDateChooserDialogProps extends IAbstractPopupProps<Date> {
  defaultValue: Date;
  yearRange?: [number, number];
}

interface IDateChooserDialogState extends IAbstractPopupState {
  date: Date;
}

export class DateChooserDialog extends AbstractPopup<Date, IDateChooserDialogProps, IDateChooserDialogState> {
  public static async show(options: IDateChooserDialogProps) {
    options.title = options.title || 'Choisissez une date';
    options.width = options.width || '90%';
    return await app.$popup.show<Date, IDateChooserDialogProps>({
      type: 'date-chooser',
      Component: DateChooserDialog,
      componentProps: options,
    });
  }

  protected override async onInitializePopup() {
    const buttons = this.state.buttons;
    buttons.push({
      name: 'Valider la date choisie',
      label: 'Valider',
      color: 'primary',
      onTap: () => this.close(this.state.date),
    });
    await this.setStateAsync({
      buttons,
      date: this.props.defaultValue ? new Date(this.props.defaultValue) : new Date(),
    });
  }

  protected override renderContent() {
    return [
      <DateChooser
        key='date-chooser'
        yearRange={this.props.yearRange}
        value={this.state.date}
        onChange={(date) => this.setStateAsync({ date })}
      />,
    ];
  }
}
