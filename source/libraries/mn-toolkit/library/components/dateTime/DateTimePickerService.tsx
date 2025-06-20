import { useState } from 'react';
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

    function DateChooserPopoverContent(props: { onChoose: (date: Date) => void }) {
      const [date, setDate] = useState<Date>(new Date(options.defaultValue));
      return (
        <DateChooser
          padding
          value={date}
          onChange={(newDate, source) => {
            setDate(newDate);
            if (source !== 'day') return;
            props.onChoose(newDate);
          }}
        />
      );
    }

    return await new Promise<Date | undefined>((resolve) => {
      const id = app.$popover.bubble(eventOrRect, {
        preferBottom: true,
        width: app.$device.isMediumScreen ? app.$device.screenWidth / 2 : app.$device.screenWidth / 4,
        onClose: (onBlur) => {
          if (onBlur) resolve(undefined);
        },
        content: (
          <DateChooserPopoverContent
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

    function TimeChooserPopoverContent(props: { onChoose: (date: Date) => void }) {
      const [time, setTime] = useState<Date>(new Date(options.defaultValue));
      return (
        <VerticalStack padding gutter>
          <TimeChooser value={time} onChange={(newTime) => setTime(newTime)} />
          <HorizontalStack itemAlignment='right' verticalItemAlignment='middle'>
            <Button name="Valider l'heure choisie" label='OK' onTap={() => props.onChoose(time)} />
          </HorizontalStack>
        </VerticalStack>
      );
    }

    return await new Promise<Date | undefined>((resolve) => {
      const id = app.$popover.bubble(eventOrRect, {
        preferBottom: true,
        width: 150,
        onClose: (onBlur) => {
          if (onBlur) resolve(undefined);
        },
        content: (
          <TimeChooserPopoverContent
            onChoose={(time) => {
              app.$popover.remove(id);
              resolve(time);
            }}
          />
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

    function DateTimeChooserPopoverContent(props: { onChoose: (date: Date) => void }) {
      const [dateTime, setDateTime] = useState<Date>(new Date(options.defaultValue));
      return (
        <VerticalStack padding gutter>
          <DateTimeChooser value={dateTime} onChange={(newDateTime) => setDateTime(newDateTime)} />
          <HorizontalStack itemAlignment='right' verticalItemAlignment='middle'>
            <Button name="Valider la date et l'heure choisies" label='OK' onTap={() => props.onChoose(dateTime)} />
          </HorizontalStack>
        </VerticalStack>
      );
    }

    return await new Promise<Date | undefined>((resolve) => {
      const id = app.$popover.bubble(eventOrRect, {
        preferBottom: true,
        width,
        onClose: (onBlur) => {
          if (onBlur) resolve(undefined);
        },
        content: (
          <DateTimeChooserPopoverContent
            onChoose={(dateTime) => {
              app.$popover.remove(id);
              resolve(dateTime);
            }}
          />
        ),
      });
    });
  }

  public async pickWeek(eventOrRect: React.MouseEvent | DOMRect, options: IWeekChooserDialogProps) {
    if (app.$device.isTouch) return await WeekChooserDialog.show(options);

    function WeekChooserPopoverContent(props: { onChoose: (date: Date) => void }) {
      const [date, setDate] = useState<Date>(new Date(options.defaultValue));
      return (
        <WeekChooser
          padding
          yearRange={options.yearRange}
          value={date}
          onChange={(newDate, source) => {
            setDate(newDate);
            if (source !== 'week') return;
            props.onChoose(newDate);
          }}
        />
      );
    }

    return await new Promise<Date | undefined>((resolve) => {
      const id = app.$popover.bubble(eventOrRect, {
        preferBottom: true,
        width: app.$device.isMediumScreen ? app.$device.screenWidth / 2 : app.$device.screenWidth / 4,
        onClose: (onBlur) => {
          if (onBlur) resolve(undefined);
        },
        content: (
          <WeekChooserPopoverContent
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
