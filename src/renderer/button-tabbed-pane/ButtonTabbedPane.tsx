import './styles.scss';
import { IContainableProps, IContainableState, Containable } from 'libraries/mn-toolkit/containable/Containable';
import { HorizontalStack } from 'libraries/mn-toolkit/container/HorizontalStack';
import { Spinner } from 'libraries/mn-toolkit/spinner/Spinner';
import { VerticalStack } from 'libraries/mn-toolkit/container/VerticalStack';
import { Button } from 'libraries/mn-toolkit/button/Button';
import { classNames } from 'libraries/mn-tools';
import { ReactNode } from 'react';
import { INodeWithProps } from 'libraries/mn-toolkit/tabs';
import { TForegroundColor } from 'libraries/mn-toolkit/themeSettings';

type TAbstractButtonTabIndex = string | undefined;

interface IButtonTab<TIndex extends TAbstractButtonTabIndex> {
  id: TIndex;
  label: string;
  selectedColor: TForegroundColor;
}

interface IButtonTabbedPaneProps<TIndex1 extends TAbstractButtonTabIndex, TIndex2 extends TAbstractButtonTabIndex> extends IContainableProps {
  tab1: IButtonTab<TIndex1> | undefined;
  tab2: IButtonTab<TIndex2> | undefined;
  defaultValue: TIndex1 | TIndex2;
  onChange?: (value: TIndex1 | TIndex2) => void | Promise<void>;
}

interface IButtonTabbedPaneState<TIndex1 extends TAbstractButtonTabIndex, TIndex2 extends TAbstractButtonTabIndex> extends IContainableState {
  value: TIndex1 | TIndex2;
}

export class ButtonTabbedPane<TIndex1 extends TAbstractButtonTabIndex, TIndex2 extends TAbstractButtonTabIndex>
  extends Containable<IButtonTabbedPaneProps<TIndex1, TIndex2>, IButtonTabbedPaneState<TIndex1, TIndex2>> {

  public constructor(props: IButtonTabbedPaneProps<TIndex1, TIndex2>) {
    super(props);
    this.state = {
      loaded: true,
      value: props.defaultValue,
    };
  }

  private onTabChange(value: TIndex1 | TIndex2) {
    this.setState({ value }, () => this.props.onChange && app.$errorManager.handlePromise(this.props.onChange(value)));
  }

  public render() {
    if (!this.state.loaded) return <Spinner />;

    const { tab1, tab2, children } = this.props;
    const { value } = this.state;
    const firstChildIsSelected = value === tab1?.id;
    const child = (children as ReactNode[]).filter(node => (node as INodeWithProps).props.id === value);

    return this.renderAttributes(<VerticalStack margin gutter itemAlignment='center'>
      <HorizontalStack className='button-tabs' gutter itemAlignment='center'>
        {!!tab1 && <Button
          className={classNames('button-tab', tab1.id, { 'selected': firstChildIsSelected })}
          color={firstChildIsSelected ? tab1.selectedColor : '4'}
          label={tab1.label}
          onTap={() => this.onTabChange(tab1.id)}
        />}
        {!!tab2 && <Button
          className={classNames('button-tab', tab2.id, { 'selected': !firstChildIsSelected })}
          color={!firstChildIsSelected ? tab2.selectedColor : '4'}
          label={tab2.label}
          onTap={() => this.onTabChange(tab2.id)}
        />}
      </HorizontalStack>
      {child}
    </VerticalStack>, 'button-tabbed-pane');
  }
}
