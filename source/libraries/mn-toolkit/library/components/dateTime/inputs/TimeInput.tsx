import { createRef } from 'react';
import { integer } from 'mn-tools';
import { TJSXElementChildren } from '../../../system';
import { IContainableProps, Containable, IContainableState, TDidUpdateSnapshot } from '../../containable';

export interface ITimeInputProps extends IContainableProps {
  canReset: boolean;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void | Promise<void>;
}

interface ITimeInputState extends IContainableState {
  hour: string;
  minute: string;
  activeSection: 'hour' | 'minute';
}

export class TimeInput extends Containable<ITimeInputProps, ITimeInputState> {
  private inputRef = createRef<HTMLInputElement>();

  public static override get defaultProps(): Omit<ITimeInputProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      canReset: true,
    };
  }

  public constructor(props: ITimeInputProps) {
    super(props);
    this.state = {
      ...this.state,
      hour: props.value ? String(props.value.getHours()).padStart(2, '0') : '',
      minute: props.value ? String(props.value.getMinutes()).padStart(2, '0') : '',
      activeSection: 'hour',
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<ITimeInputProps>,
    prevState: Readonly<ITimeInputState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate?.(prevProps, prevState, snapshot);
    if (prevProps.value?.getTime() !== this.props.value?.getTime()) {
      this.setState({
        hour: this.props.value ? String(this.props.value.getHours()).padStart(2, '0') : '',
        minute: this.props.value ? String(this.props.value.getMinutes()).padStart(2, '0') : '',
      });
    }
  }

  private async onChange() {
    let { hour, minute } = this.state;
    if (hour.length === 2 && minute.length === 2) {
      const time = this.props.value ? new Date(this.props.value) : new Date().toBeginOfDay();
      time.setHours(integer(hour));
      time.setMinutes(integer(minute));
      await this.props.onChange(isNaN(time.getTime()) ? undefined : time);
    }
  }

  private async onFocusOut() {
    const { hour, minute } = this.state;
    const correction = this.correctTime(hour, minute);
    await this.setStateAsync({ hour: correction.hour, minute: correction.minute });
    await this.onChange();
  }

  private async onFocusIn(event: React.FocusEvent<HTMLInputElement>) {
    await this.updateActiveSection(event.target.selectionStart);
    this.setSelectionRange();
  }

  private async onTap(event: React.MouseEvent<HTMLInputElement>) {
    await this.updateActiveSection(event.currentTarget.selectionStart);
    this.setSelectionRange();
  }

  private async updateActiveSection(selectionStart: number | null) {
    if (selectionStart === null) return;

    let activeSection: 'hour' | 'minute' = 'hour';
    if (selectionStart >= 0 && selectionStart <= 2) {
      activeSection = 'hour';
    } else if (selectionStart >= 3 && selectionStart <= 5) {
      activeSection = 'minute';
    }

    await this.setStateAsync({ activeSection });
  }

  private async onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const { key } = e;
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      e.preventDefault();
      this.moveSection(key === 'ArrowLeft' ? -1 : 1);
    } else if (key === 'Backspace' && this.props.canReset) {
      e.preventDefault();
      await this.setStateAsync({ activeSection: 'hour', hour: '', minute: '' });
      await this.props.onChange(undefined);
    } else if (/^\d$/.test(key)) {
      e.preventDefault();
      this.handleDigitInput(key);
    }
  }

  private async handleDigitInput(digit: string) {
    let { activeSection, hour, minute } = this.state;
    let doCorrectTime = false;

    switch (activeSection) {
      case 'hour': {
        if (hour.length === 0 || hour.length === 2) {
          hour = digit;
        } else {
          hour += digit;
          if (integer(hour) > 23) hour = '0' + digit;
        }
        if (hour.length === 2) {
          activeSection = 'minute';
          doCorrectTime = true;
        }
        break;
      }

      case 'minute': {
        if (minute.length === 0 || minute.length === 2) {
          minute = digit;
        } else {
          minute += digit;
          if (integer(minute) > 59) minute = '0' + digit;
        }
        if (minute.length === 2) {
          doCorrectTime = true;
        }
        break;
      }
    }

    if (doCorrectTime) {
      const correction = this.correctTime(hour, minute);
      hour = correction.hour;
      minute = correction.minute;
    }

    await this.setStateAsync({ activeSection, hour, minute });
    this.setSelectionRange();
    await this.onChange();
  }

  private correctTime(hour: string, minute: string) {
    if (!hour || !minute) return { hour, minute };
    const correctTime = new Date();
    correctTime.setHours(integer(hour));
    correctTime.setMinutes(integer(minute));
    hour = String(correctTime.getHours()).padStart(2, '0');
    minute = String(correctTime.getMinutes()).padStart(2, '0');
    return { hour, minute };
  }

  private async moveSection(direction: number) {
    const sections = ['hour', 'minute'] as const;
    let { activeSection, hour, minute } = this.state;
    const correction = this.correctTime(hour, minute);
    hour = correction.hour;
    minute = correction.minute;

    const currentIndex = sections.indexOf(activeSection);
    let newIndex = currentIndex + direction;

    if (newIndex < 0) newIndex = 0;
    if (newIndex > sections.length - 1) newIndex = sections.length - 1;

    await this.setStateAsync({ activeSection: sections[newIndex]!, hour, minute });
    this.setSelectionRange();
    await this.onChange();
  }

  private setSelectionRange() {
    requestAnimationFrame(() => {
      const input = this.inputRef.current;
      if (!input) return;

      const { activeSection } = this.state;
      switch (activeSection) {
        case 'hour':
          input.setSelectionRange(0, 2);
          break;
        case 'minute':
          input.setSelectionRange(3, 5);
          break;
      }
    });
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-time-input'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    const { hour, minute } = this.state;
    let value = '';
    if (hour || minute) {
      value = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    }
    return [
      <input
        ref={this.inputRef}
        key='time-input'
        type='text'
        placeholder='HH:MM'
        value={value}
        onChange={() => {}} // Not used here but necessary for React
        onFocus={(e) => app.$errorManager.handlePromise(this.onFocusIn(e))}
        onBlur={() => app.$errorManager.handlePromise(this.onFocusOut())}
        onClick={(e) => app.$errorManager.handlePromise(this.onTap(e))}
        onKeyDown={(e) => app.$errorManager.handlePromise(this.onKeyDown(e))}
      />,
    ];
  }
}
