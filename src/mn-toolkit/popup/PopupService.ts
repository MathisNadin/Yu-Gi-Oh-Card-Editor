import { IContainerProps } from "mn-toolkit/container/Container";
import { IPopupProps, Popup } from "./Popup";
import { createRoot } from "react-dom/client";

export interface IDialogProps<RESULT> extends IContainerProps {
  popupId?: string;
  resolve?: (value: RESULT | Promise<RESULT>) => void;
}

export class PopupService {

  public async show<RESULT>(props: IPopupProps) {
    return new Promise<RESULT>(resolve => {
      let newProps = {
        ...props,
        content: {
          ...props.content,
          props: {
            ...props.content.props,
            popupId: props.id,
            resolve: (result: RESULT) => resolve(result)
          }
        }
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
}
