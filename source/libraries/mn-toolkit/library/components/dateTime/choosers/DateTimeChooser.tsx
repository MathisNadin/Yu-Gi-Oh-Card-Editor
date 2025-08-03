import { classNames } from 'mn-tools';
import { TJSXElementChildren } from '../../../system';
import { IContainerProps, Container, IContainerState, HorizontalStack, VerticalStack } from '../../container';
import { Icon } from '../../icon';
import { DateChooser, TDateChooserChangeSource } from './DateChooser';
import { TimeChooser, TTimeChooserChangeSource } from './TimeChooser';

type TDateTimeTab = 'date' | 'time';

export type TDateTimeChooserChangeSource = TDateChooserChangeSource | TTimeChooserChangeSource;

export interface IDateTimeChooserProps extends IContainerProps {
  mode: 'scroller' | 'tabs';
  yearRange?: [number, number];
  value: Date;
  onChange: (value: Date, source: TDateTimeChooserChangeSource) => void | Promise<void>;
}

interface IDateTimeChooserState extends IContainerState {
  tab: TDateTimeTab;
}

export class DateTimeChooser extends Container<IDateTimeChooserProps, IDateTimeChooserState> {
  public static override get defaultProps(): Omit<IDateTimeChooserProps, 'value' | 'onChange'> {
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
      tab: 'date',
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-date-time-chooser'] = true;
    return classes;
  }

  public override get children(): TJSXElementChildren {
    if (this.props.mode === 'tabs') {
      const tabIsDate = this.state.tab === 'date';
      return [
        <VerticalStack key='choosers' fill gutter>
          <HorizontalStack key='tabs' className='tabs'>
            <HorizontalStack
              className={classNames('tab', { selected: tabIsDate })}
              fill
              paddingY='small'
              itemAlignment='center'
              onTap={() => this.setStateAsync({ tab: 'date' })}
            >
              <Icon size={24} icon='toolkit-calendar' color={tabIsDate ? 'primary' : undefined} />
            </HorizontalStack>

            <HorizontalStack
              className={classNames('tab', { selected: !tabIsDate })}
              fill
              paddingY='small'
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
              value={this.props.value}
              onChange={(dateTime, source) => this.props.onChange(dateTime, source)}
            />
          )}

          {!tabIsDate && (
            <TimeChooser
              key='time-chooser'
              mode='grid'
              value={this.props.value}
              onChange={(dateTime, source) => this.props.onChange(dateTime, source)}
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
          value={this.props.value}
          onChange={(dateTime, source) => this.props.onChange(dateTime, source)}
        />,
        <TimeChooser
          key='time-chooser'
          fill={false}
          mode='scroller'
          value={this.props.value}
          onChange={(dateTime, source) => this.props.onChange(dateTime, source)}
        />,
      ];
    }
  }
}
