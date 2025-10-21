import { TJSXElementChild } from '../../system';
import { Button } from '../button';
import { HorizontalStack, IContainerProps } from '../container';
import { Typography } from '../typography';
import { IAbstractPopupProps, IAbstractPopupState, AbstractPopup } from './AbstractPopup';

export interface IInformDialogProps extends IAbstractPopupProps<void> {
  message: string;
}

interface IInformDialogState extends IAbstractPopupState {}

export class InformDialog extends AbstractPopup<void, IInformDialogProps, IInformDialogState> {
  // By default there is no title, and in this Popup there is no need for the close button
  protected override renderHeader(): TJSXElementChild {
    return !!this.props.title ? super.renderHeader() : null;
  }

  protected override get contentContainerGutter(): IContainerProps['gutter'] {
    return 'default';
  }

  protected override renderContent() {
    if (!this.props.message) return null;
    return [
      <Typography key='message' variant='document' content={this.props.message} />,
      <HorizontalStack key='button' itemAlignment='right'>
        <Button name='Compris' label='Compris' color='primary' onTap={() => this.close()} />
      </HorizontalStack>,
    ];
  }
}
