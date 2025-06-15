import { IAbstractPopupProps, IAbstractPopupState, AbstractPopup } from '../../popup';
import { WeekChooser } from './WeekChooser';

export interface IWeekChooserDialogProps extends IAbstractPopupProps<Date> {
  defaultValue?: Date;
  yearRange?: [number, number];
}

interface IWeekChooserDialogState extends IAbstractPopupState {
  date?: Date;
}

export class WeekChooserDialog extends AbstractPopup<Date, IWeekChooserDialogProps, IWeekChooserDialogState> {
  public static async show(options: IWeekChooserDialogProps = {}) {
    options.title = options.title || 'Choisissez une semaine';
    options.width = options.width || '90%';
    return await app.$popup.show<Date, IWeekChooserDialogProps>({
      type: 'week-chooser',
      Component: WeekChooserDialog,
      componentProps: options,
    });
  }

  protected override async onInitializePopup() {
    const buttons = this.state.buttons;
    buttons.push({
      name: 'Valider la semaine choisie',
      label: 'Valider',
      color: 'primary',
      onTap: () => this.close(this.state.date),
    });
    await this.setStateAsync({ buttons, date: this.props.defaultValue });
  }

  public override renderContent() {
    return [
      <WeekChooser
        key='week-chooser'
        yearRange={this.props.yearRange}
        defaultValue={this.state.date}
        onChoose={(date) => this.setStateAsync({ date })}
      />,
    ];
  }
}
