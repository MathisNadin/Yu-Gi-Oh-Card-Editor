import { classNames } from 'mn-tools';
import { IMemberEntity } from 'api/main';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { TForegroundColor } from '../themeSettings';

export type BadgeShape = 'circle' | 'square';

interface IMemberBadgeProps extends IContainableProps {
  member: IMemberEntity;
  shape?: BadgeShape;
  size?: number;
  color?: TForegroundColor;
  badge?: number;
}

interface IMemberBadgeState extends IContainableState {}

export class MemberBadge extends Containable<IMemberBadgeProps, IMemberBadgeState> {
  public static get defaultProps(): Partial<IMemberBadgeProps> {
    return {
      ...super.defaultProps,
      shape: 'circle',
      size: 32,
      color: 'primary',
    };
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-member-badge'] = true;
    if (this.props.shape) classes[`mn-shape-${this.props.shape}`] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;
    return classes;
  }

  public render() {
    if (!this.props.member) return null!;

    const picture = app.$api.getFileUrl({
      oid: this.props.member.picture,
      effects: this.props.member.pictureEffects,
      derivative: 'avatar',
    })!;

    return (
      <div
        id={this.props.nodeId}
        title={this.props.hint}
        style={{
          width: this.props.size,
          minWidth: this.props.size,
          height: this.props.size,
          minHeight: this.props.size,
          fontSize: this.props.size! / 2,
        }}
        className={classNames(this.renderClasses())}
        onClick={(e: React.MouseEvent) => {
          if (this.props.onTap) app.$errorManager.handlePromise(this.props.onTap(e));
        }}
      >
        {!!this.props.badge && <span className='mn-badge'>{this.props.badge}</span>}

        {picture ? (
          <div className='content photo' style={{ backgroundImage: `url(${picture})` }} />
        ) : (
          <div className='content letter'>{`${this.props.member.firstName[0]}${this.props.member.lastName[0]}`}</div>
        )}
      </div>
    );
  }
}
