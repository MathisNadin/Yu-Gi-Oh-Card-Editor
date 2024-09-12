import { IAbstractPopupProps, IAbstractPopupState, AbstractPopup } from '../../popup';
import { TimeChooser } from './TimeChooser';

export interface ITimeChooserDialogProps extends IAbstractPopupProps<Date> {
  defaultValue?: Date;
}

interface ITimeChooserDialogState extends IAbstractPopupState {
  time?: Date;
}

export class TimeChooserDialog extends AbstractPopup<Date, ITimeChooserDialogProps, ITimeChooserDialogState> {
  public static async show(options: ITimeChooserDialogProps = {}) {
    options.title = options.title || 'Choisissez une heure';
    options.width = options.width || '90%';
    return await app.$popup.show<Date, ITimeChooserDialogProps>({
      type: 'time-chooser',
      Component: TimeChooserDialog,
      componentProps: options,
    });
  }

  protected override async onInitializePopup() {
    const buttons = this.state.buttons;
    buttons.push({
      label: 'Valider',
      color: 'primary',
      onTap: () => this.close(this.state.time),
    });
    await this.setStateAsync({ buttons, time: this.props.defaultValue });
  }

  public override renderContent() {
    return [
      <TimeChooser
        key='time-chooser'
        mode='grid'
        defaultValue={this.state.time}
        onChoose={(time) => this.setStateAsync({ time })}
      />,
    ];
  }
}
