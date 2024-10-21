import { createRef } from 'react';
import { Button } from '../button';
import { IContainableProps, Containable, IContainableState } from '../containable/Containable';
import { HorizontalStack } from '../container/HorizontalStack';
import { VerticalStack } from '../container/VerticalStack';
import { Progress } from '../progress';
import { TForegroundColor } from '../theme';
import { Typography } from '../typography/Typography';
import { IFilePickerOptions } from '../filePicker';
import { Icon } from '../icon';
import { TDidUpdateSnapshot } from '../containable';

// Fourni sur File par Electron, là pour éviter les erreurs de typing en son absence
interface FileWithPath extends File {
  path: string;
}

export interface IFile {
  name: File['name'];
  path?: FileWithPath['path'];
  size?: File['size'];
  type?: File['type'];
  extension?: string;
  url?: string;
}

export interface IFileUploaderProps extends IContainableProps {
  progressColor?: TForegroundColor;
  uploadBtnColor?: TForegroundColor;
  resetBtnColor?: TForegroundColor;

  files?: IFile[];
  multiple?: boolean;
  accept?: string; // Uniquement pour le filePicker, penser à vérifier file.type manuellement en cas de drag-and-drop
  imageMimeType?: string; // Uniquement pour le filePicker
  imageQuality?: number; // Uniquement pour le filePicker
  onFilesChanged: (files: IFile[]) => void | Promise<void>;
}

interface IFileUploaderState extends IContainableState {
  files: IFile[];
  loadingFiles: boolean;
  loadingProgress: number;
  loadingTotal: number;
}

export class FileUploader extends Containable<IFileUploaderProps, IFileUploaderState> {
  private fileUploaderRef = createRef<HTMLDivElement>();

  public static get defaultProps(): Partial<IFileUploaderProps> {
    return {
      ...super.defaultProps,
      files: [],
      multiple: false,
      uploadBtnColor: 'positive',
      resetBtnColor: 'negative',
    };
  }

  public constructor(props: IFileUploaderProps) {
    super(props);
    if (props.files)
      this.state = {
        loaded: true,
        files: props.files,
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
    if (this.props.files !== this.state.files) {
      this.setState({ files: this.props.files! });
    }
  }

  private fireOnFilesChanged() {
    if (this.props.onFilesChanged) app.$errorManager.handlePromise(this.props.onFilesChanged(this.state.files));
  }

  private async onFileListImported(fileList: FileList) {
    if (!fileList) return;
    let files: IFile[] = [];
    const fileListArray = Array.from(fileList);

    if (fileListArray.length) {
      const loopPromise = new Promise<void>((resolve) => {
        this.setState({ loadingFiles: true, loadingProgress: 0, loadingTotal: fileListArray.length }, async () => {
          for (const orgFile of fileListArray) {
            this.setState({ loadingProgress: this.state.loadingProgress + 1 });
            try {
              const url = await app.$api.fileToDataURL(orgFile);
              const match = orgFile.name?.match(/\.[0-9a-z]+$/i);
              const file: IFile = {
                url,
                name: orgFile.name,
                path: (orgFile as FileWithPath).path,
                size: orgFile.size,
                type: orgFile.type,
                extension: match ? match[0] : '',
              };
              files.push(file);
              if (files.length && !this.props.multiple) break;
            } catch (e) {
              app.$errorManager.trigger(e as Error);
            }
          }
          resolve();
        });
      });
      await loopPromise;
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

  public override render() {
    return (
      <div
        {...this.renderAttributes()}
        ref={this.fileUploaderRef}
        onDragEnter={(e) => {
          e.preventDefault();
          this.fileUploaderRef?.current?.classList?.add('dragged-over');
        }}
        onDragEnterCapture={(e) => {
          e.preventDefault();
          this.fileUploaderRef?.current?.classList?.add('dragged-over');
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragOverCapture={(e) => e.preventDefault()}
        onDragLeave={(e: React.DragEvent<HTMLDivElement>) => this.checkOnDragLeave(e)}
        onDragLeaveCapture={(e: React.DragEvent<HTMLDivElement>) => this.checkOnDragLeave(e)}
        onDrop={(e: React.DragEvent<HTMLDivElement>) => app.$errorManager.handlePromise(this.onDropFiles(e))}
      >
        {!this.state.loadingFiles && !this.state.files.length && (
          <Button
            color={this.props.uploadBtnColor}
            icon='toolkit-upload'
            label='Choisir un fichier'
            onTap={() => this.onPickFile()}
          />
        )}

        {!this.state.loadingFiles && !this.state.files.length && (
          <Typography variant='help' content='	Glissez-déposez votre fichier ici, ou cliquez pour sélectionner' />
        )}

        {!!this.state.files.length && (
          <VerticalStack gutter itemAlignment='center'>
            <VerticalStack gutter itemAlignment='right'>
              {this.state.files.map((file, i) => (
                <HorizontalStack key={`file-uploader-file-${i}`} gutter width='100%'>
                  <HorizontalStack itemAlignment='center' width='100%'>
                    <Typography variant='label' content={file.name} />
                  </HorizontalStack>

                  <HorizontalStack>
                    <Icon icon='toolkit-close' disabled={this.state.loadingFiles} onTap={() => this.onRemoveFile(i)} />
                  </HorizontalStack>
                </HorizontalStack>
              ))}
            </VerticalStack>

            {!this.state.loadingFiles && (
              <HorizontalStack gutter itemAlignment='center'>
                <Button
                  color={this.props.resetBtnColor}
                  icon='toolkit-trash'
                  label='Tout supprimer'
                  onTap={() => this.onRemoveAll()}
                />

                {this.props.multiple && (
                  <Button
                    color={this.props.uploadBtnColor}
                    icon='toolkit-upload'
                    label='Choisir un fichier'
                    onTap={() => this.onPickFile()}
                  />
                )}
              </HorizontalStack>
            )}
          </VerticalStack>
        )}

        {this.state.loadingFiles && (
          <Progress
            progress={this.state.loadingProgress}
            total={this.state.loadingTotal}
            message='Chargement en cours...'
            color={this.props.progressColor}
          />
        )}
      </div>
    );
  }

  private checkOnDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!this.fileUploaderRef?.current || !e.target) return;
    if (this.fileUploaderRef?.current !== e.target && this.fileUploaderRef.current.contains(e.target as Node)) return;
    this.fileUploaderRef?.current?.classList.remove('dragged-over');
  }

  private async onDropFiles(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (this.fileUploaderRef?.current?.classList) this.fileUploaderRef.current.classList.remove('dragged-over');
    await this.onFileListImported((event.dataTransfer as DataTransfer).files);
  }

  private async onPickFile() {
    const options: IFilePickerOptions = {
      multiple: this.props.multiple,
      accept: this.props.accept,
    };
    const files = await app.$filePicker.pickFileList(options);
    if (!files) return;
    await this.onFileListImported(files);
  }
}
