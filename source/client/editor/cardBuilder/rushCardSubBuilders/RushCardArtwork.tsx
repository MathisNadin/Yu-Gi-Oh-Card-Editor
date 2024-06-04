import { ICard } from 'client/editor/card/card-interfaces';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from 'mn-toolkit';
import { getCroppedArtworkBase64 } from 'mn-tools';

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
  artworkData: string;
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
      artworkData: '',
    };
  }

  public componentDidMount() {
    setTimeout(() => app.$errorManager.handlePromise(this.loadArtwork()), 100);
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
        artworkData: '',
      };
    } else {
      return null;
    }
  }

  public componentDidUpdate() {
    if (this.state.loadArtwork) {
      app.$errorManager.handlePromise(this.loadArtwork());
    } else {
      this.props.onReady();
    }
  }

  private get isEmpty() {
    const { url } = this.state;
    return !url;
  }

  private async loadArtwork() {
    if (this.isEmpty) {
      this.props.onReady();
      this.setState({ loadArtwork: false });
    }

    const { url, x, y, height, width, artworkBg } = this.state;

    let artworkExists = false;
    if (app.$device.isDesktop) {
      try {
        artworkExists = await window.electron.ipcRenderer.checkFileExists(url);
      } catch (error) {
        console.error(error);
      }
    }

    let artworkData: string;
    if (artworkExists) {
      artworkData = `file://${url}`;
      try {
        const img = await window.electron.ipcRenderer.createImgFromPath(url);
        artworkData = await getCroppedArtworkBase64(img, { x, y, height, width });
      } catch (error) {
        console.error(error);
      }
    } else {
      artworkData = artworkBg;
    }

    this.setState({ loadArtwork: false, artworkData });
  }

  public render() {
    if (this.isEmpty) return null;

    const { artworkData } = this.state;
    return (
      <div className='card-layer artwork-container'>
        <img className='artwork' src={artworkData} alt='artwork' />
      </div>
    );
  }
}
