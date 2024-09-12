import { JSXElementChildren } from '../../react';
import { IContainerProps, Container, IContainerState, HorizontalStack, VerticalStack } from '../../container';
import { TDidUpdateSnapshot } from '../../containable';
import { Icon } from '../../icon';
import { DateChooser } from './DateChooser';
import { TimeChooser } from './TimeChooser';
import { classNames } from 'mn-tools';

type TDateTimeTab = 'date' | 'time';

export interface IDateTimeChooserProps extends IContainerProps {
  mode?: 'scroller' | 'tabs';
  defaultValue?: Date;
  yearRange?: [number, number];
  onChoose?: (value: Date) => void | Promise<void>;
}

interface IDateTimeChooserState extends IContainerState {
  tab: TDateTimeTab;
  dateTime: Date;
}

export class DateTimeChooser extends Container<IDateTimeChooserProps, IDateTimeChooserState> {
  public static get defaultProps(): Partial<IDateTimeChooserProps> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      gutter: true,
      fill: true,
      scroll: false,
      maxWidth: '100%',
      maxHeight: '100%',
      mode: 'scroller',
    };
  }

  public constructor(props: IDateTimeChooserProps) {
    super(props);
    this.state = {
      ...this.state,
      dateTime: props.defaultValue || new Date(),
      tab: 'date',
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IDateTimeChooserProps>,
    prevState: Readonly<IDateTimeChooserState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps.defaultValue?.getTime() !== this.props.defaultValue?.getTime()) {
      this.setState({ dateTime: this.props.defaultValue || new Date() });
    }
  }

  private async onChange(dateTime: Date) {
    await this.setStateAsync({ dateTime });
    if (this.props.onChoose) this.props.onChoose(dateTime);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-date-time-chooser'] = true;
    return classes;
  }

  public override get children(): JSXElementChildren {
    const { dateTime, tab } = this.state;

    if (this.props.mode === 'tabs') {
      const tabIsDate = tab === 'date';
      return [
        <VerticalStack key='choosers' fill gutter>
          <HorizontalStack key='tabs' className='tabs'>
            <HorizontalStack
              className={classNames('tab', { selected: tabIsDate })}
              fill
              itemAlignment='center'
              onTap={() => this.setStateAsync({ tab: 'date' })}
            >
              <Icon size={24} icon='toolkit-calendar' color={tabIsDate ? 'primary' : undefined} />
            </HorizontalStack>

            <HorizontalStack
              className={classNames('tab', { selected: !tabIsDate })}
              fill
              itemAlignment='center'
              onTap={() => this.setStateAsync({ tab: 'time' })}
            >
              <Icon size={24} icon='toolkit-time' color={!tabIsDate ? 'primary' : undefined} />
            </HorizontalStack>
          </HorizontalStack>

          {tabIsDate && (
            <DateChooser
              key='date-chooser'
              yearRange={this.props.yearRange}
              defaultValue={dateTime}
              onChoose={(dateTime) => this.onChange(dateTime)}
            />
          )}

          {!tabIsDate && (
            <TimeChooser
              key='time-chooser'
              mode='grid'
              defaultValue={dateTime}
              onChoose={(dateTime) => this.onChange(dateTime)}
            />
          )}
        </VerticalStack>,
      ];
    } else {
      return [
        <DateChooser
          key='date-chooser'
          fill
          yearRange={this.props.yearRange}
          defaultValue={dateTime}
          onChoose={(dateTime) => this.onChange(dateTime)}
        />,
        <TimeChooser
          key='time-chooser'
          fill={false}
          mode='scroller'
          defaultValue={dateTime}
          onChoose={(dateTime) => this.onChange(dateTime)}
        />,
      ];
    }
  }
}
