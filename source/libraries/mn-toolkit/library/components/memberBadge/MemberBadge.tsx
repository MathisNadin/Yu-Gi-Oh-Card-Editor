import { isDefined } from 'mn-tools';
import { IMemberEntity } from 'api/main';
import { TJSXElementChildren, TForegroundColor } from '../../system';
import { Containable, IContainableProps, IContainableState } from '../containable';

export type TMemberBadgeShape = 'circle' | 'square';

interface IMemberBadgeProps extends IContainableProps {
  member: Pick<IMemberEntity, 'userName' | 'firstName' | 'lastName' | 'picture' | 'pictureEffects'>;
  shape?: TMemberBadgeShape;
  size?: number;
  color?: TForegroundColor;
  derivative?: TDerivative;
  display?: 'personNames' | 'userName';
}

interface IMemberBadgeState extends IContainableState {}

export class MemberBadge extends Containable<IMemberBadgeProps, IMemberBadgeState> {
  public static override get defaultProps(): Omit<IMemberBadgeProps, 'member'> {
    return {
      ...super.defaultProps,
      shape: 'circle',
      size: 32,
      derivative: 'default',
      color: 'primary',
      display: 'personNames',
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-member-badge'] = true;
    if (this.props.shape) classes[`mn-shape-${this.props.shape}`] = true;
    if (this.props.color) classes[`mn-color-${this.props.color}`] = true;
    return classes;
  }

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    if (isDefined(this.props.size)) {
      attributes.style = {
        width: this.props.size,
        minWidth: this.props.size,
        height: this.props.size,
        minHeight: this.props.size,
        fontSize: this.props.size / 2,
      };
    }
    return attributes;
  }

  public override get children(): TJSXElementChildren {
    const { member, derivative } = this.props;
    if (!member) return [];

    const picture = app.$api.getFileUrl({
      oid: member.picture,
      effects: member.pictureEffects,
      derivative,
    });

    let alt: string;
    let letters: string;
    if (this.props.display === 'userName') {
      const userName = member.userName || '';
      alt = userName;
      letters = `${userName[0] || '?'}${userName[1] || ''}`;
    } else if (!member.firstName && !member.lastName) {
      alt = 'Member Photo';
      letters = '??';
    } else {
      alt = `${member.firstName || ''} ${member.lastName || ''}`;
      letters = `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`;
    }

    return [
      !!picture && (
        <div key='photo' className='content photo'>
          <img src={picture} alt={alt} title={alt} />
        </div>
      ),
      !picture && (
        <div key='letter' className='content letter'>
          {letters}
        </div>
      ),
    ];
  }
}
