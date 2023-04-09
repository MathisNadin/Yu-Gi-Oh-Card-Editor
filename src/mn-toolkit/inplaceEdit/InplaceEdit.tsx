/* eslint-disable no-return-assign */
/* eslint-disable lines-between-class-members */
/* eslint-disable no-unused-vars */
/* eslint-disable react/self-closing-comp */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */
import { IContainableProps, IContainableState, Containable } from 'mn-toolkit/containable/Containable';
import { VerticalStack } from 'mn-toolkit/container/VerticalStack';
import { classNames } from 'mn-toolkit/tools';
import { ChangeEvent, MouseEvent, createRef } from 'react';

interface InplaceEditProps extends IContainableProps {
  value: string;
  onChange?: (newValue: string) => void;
  onSingleClick?: (e: MouseEvent) => void;
}

interface InplaceEditState extends IContainableState {
  isFocused: boolean;
}

export class InplaceEdit extends Containable<InplaceEditProps, InplaceEditState> {
  private inputRef = createRef<HTMLInputElement>();
  private clickTimer: ReturnType<typeof setTimeout> | undefined;
  private tempValue: string;

  public constructor(props: InplaceEditProps) {
    super(props);

    this.state = {
      loaded: true,
      isFocused: false,
    };
    this.tempValue = props.value;
  }

  public componentDidUpdate(prevProps: Readonly<InplaceEditProps>, prevState: Readonly<InplaceEditState>, snapshot?: any) {
    setTimeout(() => {
      if (this.state.isFocused) this.inputRef.current?.focus();
    }, 100);
  }

  private onBlur() {
    this.clickTimer = undefined;
    this.setState({ isFocused: false });
    if (this.props.onChange) this.props.onChange(this.tempValue);
  }

  private onSingleClick(e: MouseEvent) {
    if (this.clickTimer) return;
    this.clickTimer = setTimeout(() => {
      if (this.props.onSingleClick) this.props.onSingleClick(e);
      this.clickTimer = undefined;
    }, 200);
  }

  private onDoubleClick() {
    clearTimeout(this.clickTimer);
    this.setState({ isFocused: true }, () => {
      if (this.inputRef.current) {
        this.inputRef.current.focus();
      }
    });
    this.clickTimer = undefined;
  }

  public render() {
    return <VerticalStack className={classNames('inplace-edit-container', this.props.className)}>
      {this.state.isFocused
        ? <input
          className='inplace-edit-value inplace-edit-input'
          type='text'
          ref={this.inputRef}
          defaultValue={this.tempValue}
          onChange={e => this.tempValue = e.target.value}
          onBlur={() => this.onBlur()} />
        : <div className='inplace-edit-value inplace-edit-div' onClick={e => this.onSingleClick(e)} onDoubleClick={() => this.onDoubleClick()}>
          {this.tempValue}
        </div>
      }
    </VerticalStack>;
  }
}