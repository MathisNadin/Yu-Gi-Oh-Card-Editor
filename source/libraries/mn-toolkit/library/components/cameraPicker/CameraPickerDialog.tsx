import { createRef } from 'react';
import { VerticalStack } from '../container';
import { ISelectItem, Select } from '../select';
import { IAbstractPopupProps, IAbstractPopupState, AbstractPopup } from '../popup';

export interface ICameraPickerDialogProps extends IAbstractPopupProps<string> {
  quality?: number;
  mimeType?: string;
}

interface ICameraPickerDialogState extends IAbstractPopupState {
  selected: string;
  deviceItems: ISelectItem<string>[];
}

export class CameraPickerDialog extends AbstractPopup<string, ICameraPickerDialogProps, ICameraPickerDialogState> {
  private videoRef = createRef<HTMLVideoElement>();
  private canvasRef = createRef<HTMLCanvasElement>();
  private cameraStream?: MediaStream;

  public static async show(options: ICameraPickerDialogProps = {}) {
    options.title = options.title || 'Prenez une photo';
    options.width = options.width || (app.$device.isSmallScreen ? '100%' : '50%');
    options.height = options.height || (app.$device.isSmallScreen ? '100%' : '70%');
    return await app.$popup.show({
      type: 'camera-picker',
      Component: CameraPickerDialog,
      componentProps: options,
    });
  }

  protected override async onInitializePopup() {
    const buttons = this.state.buttons;
    buttons.push({
      name: 'Prendre la photo',
      label: 'Prendre la photo',
      color: 'primary',
      onTap: () => this.takePicture(),
    });
    await this.setStateAsync({ buttons, deviceItems: [] });
  }

  protected override async initialize() {
    await super.initialize();
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
        (device) => device.kind === 'videoinput'
      );
      const deviceItems: ISelectItem<string>[] = devices.map((device) => ({
        id: device.deviceId,
        label: device.label,
      }));
      const selected = deviceItems[0]?.id || '';
      await this.setStateAsync({ deviceItems, selected });
      await this.start();
    } catch (error) {
      app.$errorManager.trigger(error as Error);
      app.$toaster.error("Impossible d'accéder à la caméra");
    }
  }

  private async start() {
    this.stop();
    if (!this.videoRef.current) return;
    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: {
            exact: this.state.selected,
          },
        },
        audio: false,
      });
      this.videoRef.current.srcObject = this.cameraStream;
      await new Promise<void>((resolve) => (this.videoRef.current!.oncanplay = () => resolve()));
      await this.videoRef.current.play();
    } catch (error) {
      app.$errorManager.trigger(error as Error);
      app.$toaster.error("Impossible d'accéder à la caméra");
    }
  }

  private stop() {
    if (this.cameraStream) {
      for (const track of this.cameraStream.getTracks()) {
        track.stop();
      }
    }
    this.cameraStream = undefined;
  }

  private async takePicture() {
    const video = this.videoRef.current;
    const canvas = this.canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL(this.props.mimeType, this.props.quality);

    this.stop();

    await this.close(dataUrl);
  }

  public override async close(dataUrl?: string) {
    this.stop();
    await super.close(dataUrl);
  }

  public override renderContent() {
    return [
      <VerticalStack key='video' fill itemAlignment='center' verticalItemAlignment='middle'>
        <video ref={this.videoRef}>
          <track kind='captions' />
        </video>
      </VerticalStack>,
      <Select<string>
        key='devices'
        items={this.state.deviceItems}
        value={this.state.selected}
        onChange={async (selected) => {
          await this.setStateAsync({ selected });
          await this.start();
        }}
      />,
      <canvas key='canvas' ref={this.canvasRef} style={{ display: 'none' }}></canvas>,
    ];
  }
}
