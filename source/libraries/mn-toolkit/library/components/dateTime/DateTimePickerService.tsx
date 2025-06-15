import { HorizontalStack, VerticalStack } from '../container';
import { Button } from '../button';
import {
  DateChooser,
  DateChooserDialog,
  IDateChooserDialogProps,
  TimeChooser,
  TimeChooserDialog,
  ITimeChooserDialogProps,
  DateTimeChooser,
  DateTimeChooserDialog,
  IDateTimeChooserDialogProps,
  WeekChooser,
  WeekChooserDialog,
  IWeekChooserDialogProps,
} from './choosers';

export class DateTimePickerService {
  public async pickDate(eventOrRect: React.MouseEvent | DOMRect, options: IDateChooserDialogProps) {
    if (app.$device.isTouch) return await DateChooserDialog.show(options);
    return await new Promise<Date | undefined>((resolve) => {
      const id = app.$popover.bubble(eventOrRect, {
        preferBottom: true,
        width: app.$device.isMediumScreen ? app.$device.screenWidth / 2 : app.$device.screenWidth / 4,
        onClose: (onBlur) => {
          if (onBlur) resolve(undefined);
        },
        content: (
          <DateChooser
            padding
            defaultValue={options.defaultValue}
            onChoose={(date) => {
              app.$popover.remove(id);
              resolve(date);
            }}
          />
        ),
      });
    });
  }

  public async pickTime(eventOrRect: React.MouseEvent | DOMRect, options: ITimeChooserDialogProps) {
    if (app.$device.isTouch) return await TimeChooserDialog.show(options);
    let time: Date;
    return await new Promise<Date | undefined>((resolve) => {
      const id = app.$popover.bubble(eventOrRect, {
        preferBottom: true,
        width: 150,
        onClose: (onBlur) => {
          if (onBlur) resolve(undefined);
        },
        content: (
          <VerticalStack padding gutter>
            <TimeChooser
              defaultValue={options.defaultValue}
              onChoose={(newTime) => {
                time = newTime;
              }}
            />

            <HorizontalStack itemAlignment='right' verticalItemAlignment='middle'>
              <Button
                name="Valider l'heure choisie"
                label='OK'
                onTap={() => {
                  app.$popover.remove(id);
                  resolve(time);
                }}
              />
            </HorizontalStack>
          </VerticalStack>
        ),
      });
    });
  }

  public async pickDateTime(eventOrRect: React.MouseEvent | DOMRect, options: IDateTimeChooserDialogProps) {
    if (app.$device.isTouch) return await DateTimeChooserDialog.show(options);

    let width: number;
    switch (true) {
      case app.$device.isXXXLargeScreen:
        width = app.$device.screenWidth / 3;
        break;
      case app.$device.isXXLargeScreen:
        width = app.$device.screenWidth / 2.5;
        break;
      case app.$device.isXLargeScreen:
        width = app.$device.screenWidth / 2;
        break;
      case app.$device.isLargeScreen:
        width = app.$device.screenWidth * 0.75;
        break;
      default:
        width = app.$device.screenWidth * 0.9;
        break;
    }

    let dateTime: Date;
    return await new Promise<Date | undefined>((resolve) => {
      const id = app.$popover.bubble(eventOrRect, {
        preferBottom: true,
        width,
        onClose: (onBlur) => {
          if (onBlur) resolve(undefined);
        },
        content: (
          <VerticalStack padding gutter>
            <DateTimeChooser
              defaultValue={options.defaultValue}
              onChoose={(newDateTime) => {
                dateTime = newDateTime;
              }}
            />

            <HorizontalStack itemAlignment='right' verticalItemAlignment='middle'>
              <Button
                name="Valider la date et l'heure choisies"
                label='OK'
                onTap={() => {
                  app.$popover.remove(id);
                  resolve(dateTime);
                }}
              />
            </HorizontalStack>
          </VerticalStack>
        ),
      });
    });
  }

  public async pickWeek(eventOrRect: React.MouseEvent | DOMRect, options: IWeekChooserDialogProps) {
    if (app.$device.isTouch) return await WeekChooserDialog.show(options);
    return await new Promise<Date | undefined>((resolve) => {
      const id = app.$popover.bubble(eventOrRect, {
        preferBottom: true,
        width: app.$device.isMediumScreen ? app.$device.screenWidth / 2 : app.$device.screenWidth / 4,
        onClose: (onBlur) => {
          if (onBlur) resolve(undefined);
        },
        content: (
          <WeekChooser
            padding
            yearRange={options.yearRange}
            defaultValue={options.defaultValue}
            onChoose={(date) => {
              app.$popover.remove(id);
              resolve(date);
            }}
          />
        ),
      });
    });
  }
}
