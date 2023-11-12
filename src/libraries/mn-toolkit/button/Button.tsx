import './styles.css';
import { IContainableProps, Containable, IContainableState } from "../containable/Containable";

export type TForegroundColor = 'primary' | 'secondary' | 'neutral' | 'positive' | 'calm' | 'balanced' | 'energized' | 'assertive' | 'royal' | '1' | '2' | '3' | '4';

interface IButtonProps extends IContainableProps {
  label: string;
  color?: TForegroundColor;
  block?: boolean;
}

interface IButtonState extends IContainableState {
}

export class Button extends Containable<IButtonProps, IButtonState> {

  public static get defaultProps(): Partial<IButtonProps> {
    return {
      ...super.defaultProps,
      block: false,
      disabled: false,
      color: 'neutral',
    };
  }

  public constructor(props: IButtonProps) {
    super(props);
  }

  public renderClasses(name?: string){
    let classes = super.renderClasses(name);
    if (this.props.block) classes['mn-button-block'] = true;
    if (this.props.color) classes[`mn-button-color-${this.props.color}`] = true;
    return classes;
  }

  public render() {
    return this.renderAttributes(<div>
      <span className="label">{this.props.label}</span>
    </div>, 'mn-button');
  }

}
