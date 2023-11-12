import './styles.css';
import { classNames } from "libraries/mn-tools";
import { IContainableProps, IContainableState, Containable } from "../containable/Containable";
import { TForegroundColor } from "./Button";

interface IButtonOutlineProps extends IContainableProps {
  /** Set the text in front of the button. */
  label: string;
  /** Set the position of the icon on the button. syntax :  "right" | "left" | "top" | "bottom" */
  color?: TForegroundColor;
  /* set the button to the specific style mn-button-block. */
  block?: boolean;
}

interface IButtonOutlineState extends IContainableState {
}

export class ButtonOutline extends Containable<IButtonOutlineProps, IButtonOutlineState> {

  public static get defaultProps() : Partial<IButtonOutlineProps> {
    return {
      ...super.defaultProps,
      color: 'neutral',
      block: false,
      disabled: false,
    };
  }

  public constructor(props: IButtonOutlineProps) {
    super(props);
  }

  public render() {
    return <div
      id={this.props.nodeId}
      title={this.props.hint}
      className={classNames(this.renderClasses('mn-button-outline'), { 'mn-button-block': this.props.block }, `mn-button-color-${this.props.color}`)}
      onClick={e => { if (this.props.onTap) app.$errorManager.handlePromise(this.props.onTap(e)); }}
    >
      {!!this.props.label && <span className="label">{this.props.label}</span>}
    </div>;
  }

}
