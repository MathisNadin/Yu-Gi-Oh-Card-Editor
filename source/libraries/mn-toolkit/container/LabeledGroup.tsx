import { Container, IContainerProps, IContainerState, TContainerLayout } from './Container';
import { Group } from './Group';
import { Typography } from '../typography';

interface ILabeledGroupProps extends IContainerProps {
  label: string;
  groupLayout?: TContainerLayout;
  groupWrap?: boolean;
}

interface ILabeledGroupState extends IContainerState {}

export class LabeledGroup extends Container<ILabeledGroupProps, ILabeledGroupState> {
  public static get defaultProps(): Partial<ILabeledGroupProps> {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      groupLayout: 'vertical',
      padding: true,
      gutter: true,
      label: '',
      bg: '1',
    };
  }

  public get children() {
    return [
      <Container key='labeled-group-label' className='group-label-container' bg={this.props.bg}>
        <Typography variant='label' content={this.props.label} />
      </Container>,

      <Group
        key='labeled-group-content'
        className='labeled-group-content'
        fill
        padding={false}
        layout={this.props.groupLayout}
        wrap={this.props.groupWrap}
      >
        {this.props.children}
      </Group>,
    ];
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-labeled-group'] = true;
    return classes;
  }
}
