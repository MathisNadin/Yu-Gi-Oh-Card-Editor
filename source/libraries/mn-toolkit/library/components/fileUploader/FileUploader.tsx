import { formatFileSize } from 'mn-tools';
import { TForegroundColor } from '../../system';
import { IContainerProps, Container, IContainerState, HorizontalStack, VerticalStack } from '../container';
import { Progress } from '../progress';
import { Typography } from '../typography';
import { Button } from '../button';
import { Icon } from '../icon';

export interface IFile {
  name: File['name'];
  path?: string;
  size?: File['size'];
  type?: File['type'];
  extension?: string;
  url?: string;
}

export interface IFileUploaderProps extends IContainerProps {
  progressColor?: TForegroundColor;
  uploadBtnColor: TForegroundColor;
  resetBtnColor: TForegroundColor;

  multiple: boolean;
  accept?: string; // Only for filePicker, remember to check file.type manually for drag-and-drop
  /** In octets (bytes) */
  maxFileSize?: number;
  imageMimeType?: string; // Only for filePicker
  imageQuality?: number; // Only for filePicker
  value: IFile[];
  onChange: (files: IFile[]) => void | Promise<void>;
}

interface IFileUploaderState extends IContainerState {
  loadingFiles: boolean;
  loadingProgress: number;
  loadingTotal: number;
}

export class FileUploader extends Container<IFileUploaderProps, IFileUploaderState> {
  public static override get defaultProps(): Omit<IFileUploaderProps, 'value' | 'onChange'> {
    return {
      ...super.defaultProps,
      gutter: true,
      padding: 'huge',
      layout: 'vertical',
      itemAlignment: 'center',
      multiple: false,
      uploadBtnColor: 'positive',
      resetBtnColor: 'negative',
      maxFileSize: app.conf.maxFileUploadSize,
    };
  }

  public constructor(props: IFileUploaderProps) {
    super(props);
    this.state = {
      ...this.state,
      loadingFiles: false,
      loadingProgress: 0,
      loadingTotal: 0,
    };
  }

  private async onFileListImported(fileList: FileList) {
    if (!fileList) return;

    let files: IFile[] = [];
    const fileListArray = Array.from(fileList);

    if (fileListArray.length) {
      await this.setStateAsync({ loadingFiles: true, loadingProgress: 0, loadingTotal: fileListArray.length });

      for (const orgFile of fileListArray) {
        // Check max size
        if (app.conf.maxFileUploadSize && orgFile.size > app.conf.maxFileUploadSize) {
          app.$toaster.error(
            `Le fichier "${orgFile.name}" dépasse la taille maximale autorisée (${formatFileSize(app.conf.maxFileUploadSize)}).`
          );
          continue;
        }

        try {
          this.setState((prevState) => ({ loadingProgress: prevState.loadingProgress + 1 }));

          const match = orgFile.name?.match(/\.[0-9a-z]+$/i);
          let path: string | undefined;
          if (app.$device.isElectron(window)) {
            path = window.electron.ipcRenderer.getPathForFile(orgFile);
          }

          const file: IFile = {
            url: await app.$api.fileToDataURL(orgFile),
            name: orgFile.name,
            size: orgFile.size,
            type: orgFile.type,
            extension: match?.[0] || '',
            path,
          };

          files.push(file);
          if (files.length && !this.props.multiple) break;
        } catch (e) {
          app.$errorManager.trigger(e as Error);
        }
      }
    }

    let nextFiles: IFile[];
    if (this.props.multiple) {
      nextFiles = [...(this.props.value ?? []), ...files];
    } else {
      nextFiles = files;
    }

    this.setState({ loadingFiles: false, loadingProgress: 0, loadingTotal: 0 });
    await this.props.onChange(nextFiles);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-file-uploader'] = true;
    return classes;
  }

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    attributes.onDragEnter = (e) => {
      e.preventDefault();
      if (this.base.current) this.base.current.classList.add('dragged-over');
      if (this.props.onDragEnter) app.$errorManager.handlePromise(this.props.onDragEnter(e));
    };
    attributes.onDragOver = (e) => {
      e.preventDefault();
      if (this.props.onDragOver) app.$errorManager.handlePromise(this.props.onDragOver(e));
    };
    attributes.onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      this.checkOnDragLeave(e);
      if (this.props.onDragLeave) app.$errorManager.handlePromise(this.props.onDragLeave(e));
    };
    attributes.onDrop = (e: React.DragEvent<HTMLDivElement>) => app.$errorManager.handlePromise(this.onDropFiles(e));
    return attributes;
  }

  public override get children() {
    return [
      !this.state.loadingFiles && !this.props.value.length && (
        <Button
          key='upload-btn'
          color={this.props.uploadBtnColor}
          icon='toolkit-upload'
          name='Choisir un fichier'
          label='Choisir un fichier'
          onTap={() => this.onPickFile()}
        />
      ),

      !this.state.loadingFiles && !this.props.value.length && (
        <VerticalStack key='instructions' className='upload-instructions' gutter='tiny' verticalItemAlignment='middle'>
          <Typography variant='help' content='Glissez-déposez votre fichier ici, ou cliquez pour sélectionner' />
          {!!this.props.maxFileSize && (
            <Typography
              variant='help'
              fontSize='tiny'
              content={`Taille maximum autorisée : ${formatFileSize(this.props.maxFileSize)}`}
            />
          )}
        </VerticalStack>
      ),

      !!this.props.value.length && (
        <VerticalStack key='files' gutter itemAlignment='center'>
          <VerticalStack gutter itemAlignment='right'>
            {this.props.value.map((file, i) => (
              <HorizontalStack key={`file-uploader-file-${i}`} gutter width='100%'>
                <HorizontalStack itemAlignment='center' width='100%'>
                  <Typography variant='label' content={file.name} />
                </HorizontalStack>

                <HorizontalStack>
                  <Icon
                    icon='toolkit-close'
                    disabled={this.state.loadingFiles}
                    name='Supprimer le fichier'
                    onTap={() => this.props.onChange(this.props.value.filter((_, index) => index !== i))}
                  />
                </HorizontalStack>
              </HorizontalStack>
            ))}
          </VerticalStack>

          {!this.state.loadingFiles && (
            <HorizontalStack gutter itemAlignment='center'>
              <Button
                color={this.props.resetBtnColor}
                icon='toolkit-trash'
                name='Supprimer tous les fichiers'
                label='Tout supprimer'
                onTap={() => this.props.onChange([])}
              />

              {this.props.multiple && (
                <Button
                  color={this.props.uploadBtnColor}
                  icon='toolkit-upload'
                  name='Choisir un fichier'
                  label='Choisir un fichier'
                  onTap={() => this.onPickFile()}
                />
              )}
            </HorizontalStack>
          )}
        </VerticalStack>
      ),

      this.state.loadingFiles && (
        <Progress
          key='progress'
          progress={this.state.loadingProgress}
          total={this.state.loadingTotal}
          message='Chargement en cours...'
          color={this.props.progressColor}
        />
      ),
    ];
  }

  private checkOnDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!this.base.current) return;
    const rect = this.base.current.getBoundingClientRect();
    const { clientX: x, clientY: y } = e;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      this.base.current?.classList.remove('dragged-over');
    }
  }

  private async onDropFiles(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (this.base.current?.classList) this.base.current.classList.remove('dragged-over');
    await this.onFileListImported(event.dataTransfer.files);
  }

  private async onPickFile() {
    const files = await app.$filePicker.pickFileList({
      multiple: this.props.multiple,
      accept: this.props.accept,
    });
    if (files?.length) await this.onFileListImported(files);
  }
}
