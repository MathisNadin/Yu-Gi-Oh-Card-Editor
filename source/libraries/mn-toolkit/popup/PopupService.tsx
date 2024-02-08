import { IContainerProps } from 'libraries/mn-toolkit/container/Container';
import { IPopupProps, Popup } from './Popup';
import { createRoot } from 'react-dom/client';
import { HorizontalStack } from '../container';
import { Icon } from '../icon';
import { Typography } from '../typography';
import { AbstractPopupComponent, IPopup, IPopupAskOptions } from '.';

export interface IDialogProps<RESULT> extends IContainerProps {
  popupId?: string;
  resolve?: (value: RESULT | Promise<RESULT>) => void;
}

export class PopupService {
  public async show<RESULT>(props: IPopupProps) {
    return new Promise<RESULT>((resolve) => {
      let newProps = {
        ...props,
        content: {
          ...props.content,
          props: {
            ...props.content.props,
            popupId: props.id,
            resolve: (result: RESULT) => resolve(result),
          },
        },
      };
      let popup = new Popup<RESULT>(newProps, resolve);
      const rootElement = document.getElementById('root') as HTMLElement;
      const popupContainer = document.createElement('div');
      popupContainer.className = 'mn-popup-container';
      popupContainer.id = props.id;
      rootElement.appendChild(popupContainer);
      createRoot(popupContainer).render(popup.render());
    });
  }

  public remove(id: string) {
    const popupElement = document.getElementById(id) as HTMLElement;
    if (popupElement && popupElement.parentNode) {
      popupElement.parentNode.removeChild(popupElement);
    }
  }

  public ask(optionsOrMessage: IPopupAskOptions | string) {
    let options: IPopupAskOptions;
    if (typeof optionsOrMessage === 'string') {
      options = { message: optionsOrMessage } as IPopupAskOptions;
    } else {
      options = optionsOrMessage;
    }

    interface InformDialogState {}

    class InformDialog extends AbstractPopupComponent<IPopupAskOptions, InformDialogState, boolean> {
      public constructor(props: IPopupAskOptions) {
        super(props);
      }

      public onInitializePopup(popup: IPopup<boolean>): void {
        popup.addButtons({
          label: 'Oui',
          validate: true,
          onTap: () => this.doValidate(),
        });

        popup.addButtons({
          label: 'Annuler',
          cancel: true,
          onTap: () => this.doCancel(),
        });
      }

      private doValidate() {
        this.popup.close(true);
      }
      private doCancel() {
        this.popup.close(false);
      }

      public render() {
        return (
          <HorizontalStack gutter={!!this.props.icon}>
            {!!this.props.icon && <Icon iconId={this.props.icon} size={128} />}
            <Typography fill variant='document' content={options.message} />
          </HorizontalStack>
        );
      }
    }

    return this.show<boolean>({
      id: '',
      type: 'dialog-prompt',
      width: 300,
      height: options.height,
      title: options.title as string,
      content: <InformDialog {...options} />,
    }).catch((e) => app.$errorManager.trigger(e));
  }
}
