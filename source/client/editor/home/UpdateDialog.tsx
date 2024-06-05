import {
  IAbstractPopupProps,
  IAbstractPopupState,
  AbstractPopup,
  IButtonProps,
  Typography,
  HorizontalStack,
  VerticalStack,
} from 'mn-toolkit';

export interface IVersionInfos {
  version: string;
  link: string;
  note: string;
}

interface IUpdateDialogProps extends IAbstractPopupProps<void> {
  infos: IVersionInfos;
}

interface IUpdateDialogState extends IAbstractPopupState {}

export class UpdateDialog extends AbstractPopup<void, IUpdateDialogProps, IUpdateDialogState> {
  public constructor(props: IUpdateDialogProps) {
    super(props);
    this.state = {
      ...this.state,
      loaded: true,
    };
  }

  public static async show(options: IUpdateDialogProps) {
    options.title = options.title || 'Nouvelle mise à jour';
    options.width = options.width || '40%';
    options.height = options.height || '40%';
    return await app.$popup.show<void, IUpdateDialogProps>({
      type: 'update',
      Component: UpdateDialog,
      componentProps: options,
    });
  }

  protected get buttons(): IButtonProps[] {
    const { link } = this.props.infos;
    if (!link) return [];
    return [
      {
        label: 'Mettre à jour',
        color: 'positive',
        onTap: () => app.$device.openExternalLink(link),
      },
    ];
  }

  public renderContent() {
    const { version, note } = this.props.infos;
    return [
      <HorizontalStack key='content' itemAlignment='center'>
        <Typography key='version' bold variant='h2' color='primary' content={`V. ${version}`} />
      </HorizontalStack>,
      !note && <Typography key='no-note' variant='document' content='Pas de notes de mise à jour.' />,
      !!note && (
        <VerticalStack key='notes' gutter padding>
          <Typography key='notes-title' bold variant='label' content='Notes de mise à jour :' />
          {note.split('\n').map((line, i) => (
            <Typography key={i} variant='bullet' contentType='text' content={line} />
          ))}
        </VerticalStack>
      ),
    ];
  }
}
