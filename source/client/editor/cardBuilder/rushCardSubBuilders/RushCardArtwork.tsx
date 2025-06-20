import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState, TDidUpdateSnapshot } from 'mn-toolkit';
import { getCroppedArtworkBase64, isDefined, preloadImage } from 'mn-tools';
import { ICard } from '../../card';

interface IRushCardArtworkProps extends IToolkitComponentProps {
  card: ICard;
  artworkBg: string;
  onReady: () => void;
}

interface IRushCardArtworkState extends IToolkitComponentState {
  url: string;
  x: number;
  y: number;
  height: number;
  width: number;
  pendulum: boolean;
  artworkBg: string;
  loadArtwork: boolean;
  artworkData: string | undefined;
}

export class RushCardArtwork extends ToolkitComponent<IRushCardArtworkProps, IRushCardArtworkState> {
  public constructor(props: IRushCardArtworkProps) {
    super(props);
    this.state = {
      url: props.card.artwork.url,
      x: props.card.artwork.x,
      y: props.card.artwork.y,
      height: props.card.artwork.height,
      width: props.card.artwork.width,
      pendulum: props.card.artwork.pendulum,
      artworkBg: props.artworkBg,
      loadArtwork: true,
      artworkData: undefined,
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    requestAnimationFrame(() => requestAnimationFrame(() => app.$errorManager.handlePromise(this.loadArtwork())));
  }

  public static getDerivedStateFromProps(
    nextProps: IRushCardArtworkProps,
    prevState: IRushCardArtworkState
  ): Partial<IRushCardArtworkState> | null {
    if (
      prevState.url !== nextProps.card.artwork.url ||
      prevState.x !== nextProps.card.artwork.x ||
      prevState.y !== nextProps.card.artwork.y ||
      prevState.height !== nextProps.card.artwork.height ||
      prevState.width !== nextProps.card.artwork.width ||
      prevState.pendulum !== nextProps.card.artwork.pendulum ||
      prevState.artworkBg !== nextProps.artworkBg
    ) {
      return {
        loadArtwork: true,
        url: nextProps.card.artwork.url,
        x: nextProps.card.artwork.x,
        y: nextProps.card.artwork.y,
        height: nextProps.card.artwork.height,
        width: nextProps.card.artwork.width,
        pendulum: nextProps.card.artwork.pendulum,
        artworkBg: nextProps.artworkBg,
        artworkData: undefined,
      };
    } else {
      return null;
    }
  }

  public override componentDidUpdate(
    prevProps: Readonly<IRushCardArtworkProps>,
    prevState: Readonly<IRushCardArtworkState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (this.state.loadArtwork) {
      requestAnimationFrame(() => requestAnimationFrame(() => app.$errorManager.handlePromise(this.loadArtwork())));
    } else {
      requestAnimationFrame(() => requestAnimationFrame(() => this.props.onReady()));
    }
  }

  private get isEmpty() {
    return !this.state.url;
  }

  private async loadArtwork() {
    if (this.isEmpty) return this.setState({ loadArtwork: false });

    const { url, x, y, height, width, artworkBg } = this.state;

    let artworkExists = false;
    let artworkData: string | undefined;
    if (app.$device.isElectron(window)) {
      try {
        artworkExists = await window.electron.ipcRenderer.invoke('checkFileExists', url);
      } catch (error) {
        console.error(error);
      }

      if (artworkExists) {
        artworkData = `file://${url}`;
        try {
          const src = await window.electron.ipcRenderer.invoke('createImgFromPath', url);
          if (isDefined(src)) artworkData = await getCroppedArtworkBase64({ src, x, y, height, width });
        } catch (error) {
          console.error(error);
        }
      }
    }

    if (!artworkExists || !artworkData) artworkData = artworkBg;

    if (artworkData) await preloadImage(artworkData);
    this.setState({ loadArtwork: false, artworkData });
  }

  public override render() {
    if (this.isEmpty) return null;
    return (
      <div className='card-layer artwork-container'>
        <img className='artwork' src={this.state.artworkData || undefined} alt='artwork' />
      </div>
    );
  }
}
