import { TForegroundColor } from '../../system';
import { TDidUpdateSnapshot, IContainableProps, Containable, IContainableState } from '../containable';
import { HorizontalStack, VerticalStack } from '../container';
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

export interface IFileUploaderProps extends IContainableProps {
  progressColor?: TForegroundColor;
  uploadBtnColor?: TForegroundColor;
  resetBtnColor?: TForegroundColor;

  defaultValue?: IFile[];
  multiple?: boolean;
  accept?: string; // Uniquement pour le filePicker, penser à vérifier file.type manuellement en cas de drag-and-drop
  imageMimeType?: string; // Uniquement pour le filePicker
  imageQuality?: number; // Uniquement pour le filePicker
  onChange?: (files: IFile[]) => void | Promise<void>;
}

interface IFileUploaderState extends IContainableState {
  files: IFile[];
  loadingFiles: boolean;
  loadingProgress: number;
  loadingTotal: number;
}

export class FileUploader extends Containable<IFileUploaderProps, IFileUploaderState> {
  public static override get defaultProps(): IFileUploaderProps {
    return {
      ...super.defaultProps,
      defaultValue: [],
      multiple: false,
      uploadBtnColor: 'positive',
      resetBtnColor: 'negative',
    };
  }

  public constructor(props: IFileUploaderProps) {
    super(props);
    this.state = {
      ...this.state,
      loaded: true,
      files: props.defaultValue!,
      loadingFiles: false,
      loadingProgress: 0,
      loadingTotal: 0,
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<IFileUploaderProps>,
    prevState: Readonly<IFileUploaderState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    if (this.props.defaultValue !== this.state.files) {
      this.setState({ files: this.props.defaultValue! });
    }
  }

  private fireOnFilesChanged() {
    if (this.props.onChange) app.$errorManager.handlePromise(this.props.onChange(this.state.files));
  }

  private async onFileListImported(fileList: FileList) {
    if (!fileList) return;

    let files: IFile[] = [];
    const fileListArray = Array.from(fileList);

    if (fileListArray.length) {
      await this.setStateAsync({ loadingFiles: true, loadingProgress: 0, loadingTotal: fileListArray.length });

      for (const orgFile of fileListArray) {
        try {
          this.setState((prevState) => ({ loadingProgress: prevState.loadingProgress + 1 }));

          const match = orgFile.name?.match(/\.[0-9a-z]+$/i);
          let path: string | undefined;
          if (app.$device.isElectron(window)) {
            path = await window.electron.ipcRenderer.getPathForFile(orgFile);
          }

          const file: IFile = {
            url: await app.$api.fileToDataURL(orgFile),
            name: orgFile.name,
            size: orgFile.size,
            type: orgFile.type,
            extension: match ? match[0] : '',
            path,
          };

          files.push(file);
          if (files.length && !this.props.multiple) break;
        } catch (e) {
          app.$errorManager.trigger(e as Error);
        }
      }
    }

    if (this.props.multiple) files = [...this.state.files, ...files];

    await this.setStateAsync({ files, loadingFiles: false, loadingProgress: 0, loadingTotal: 0 });
    this.fireOnFilesChanged();
  }

  private async onRemoveFile(index: number) {
    this.state.files.splice(index, 1);
    await this.forceUpdateAsync();
    this.fireOnFilesChanged();
  }

  private async onRemoveAll() {
    await this.setStateAsync({ files: [] });
    this.fireOnFilesChanged();
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
      !this.state.loadingFiles && !this.state.files.length && (
        <Button
          key='upload-btn'
          color={this.props.uploadBtnColor}
          icon='toolkit-upload'
          name='Choisir un fichier'
          label='Choisir un fichier'
          onTap={() => this.onPickFile()}
        />
      ),

      !this.state.loadingFiles && !this.state.files.length && (
        <Typography
          key='instruction'
          variant='help'
          content='Glissez-déposez votre fichier ici, ou cliquez pour sélectionner'
        />
      ),

      !!this.state.files.length && (
        <VerticalStack key='files' gutter itemAlignment='center'>
          <VerticalStack gutter itemAlignment='right'>
            {this.state.files.map((file, i) => (
              <HorizontalStack key={`file-uploader-file-${i}`} gutter width='100%'>
                <HorizontalStack itemAlignment='center' width='100%'>
                  <Typography variant='label' content={file.name} />
                </HorizontalStack>

                <HorizontalStack>
                  <Icon
                    icon='toolkit-close'
                    disabled={this.state.loadingFiles}
                    name='Supprimer le fichier'
                    onTap={() => this.onRemoveFile(i)}
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
                onTap={() => this.onRemoveAll()}
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
