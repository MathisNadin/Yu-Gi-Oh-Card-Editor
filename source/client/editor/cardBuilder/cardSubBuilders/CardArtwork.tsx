import { ICard } from 'client/editor/card/card-interfaces';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from 'mn-toolkit';
import { getCroppedArtworkBase64 } from 'mn-tools';

interface ICardArtworkProps extends IToolkitComponentProps {
  card: ICard;
  artworkBg: string;
  hasPendulumFrame: boolean;
  includesLink: boolean;
  onReady: () => void;
}

interface ICardArtworkState extends IToolkitComponentState {
  url: string;
  x: number;
  y: number;
  height: number;
  width: number;
  pendulum: boolean;
  artworkBg: string;
  hasPendulumFrame: boolean;
  includesLink: boolean;
  loadArtwork: boolean;
  artworkData: string;
}

export class CardArtwork extends ToolkitComponent<ICardArtworkProps, ICardArtworkState> {
  public constructor(props: ICardArtworkProps) {
    super(props);
    this.state = {
      url: props.card.artwork.url,
      x: props.card.artwork.x,
      y: props.card.artwork.y,
      height: props.card.artwork.height,
      width: props.card.artwork.width,
      pendulum: props.card.artwork.pendulum,
      artworkBg: props.artworkBg,
      hasPendulumFrame: props.hasPendulumFrame,
      includesLink: props.includesLink,
      loadArtwork: true,
      artworkData: '',
    };
  }

  public componentDidMount() {
    app.$errorManager.handlePromise(this.loadArtwork());
  }

  public static getDerivedStateFromProps(
    nextProps: ICardArtworkProps,
    prevState: ICardArtworkState
  ): Partial<ICardArtworkState> | null {
    if (
      prevState.hasPendulumFrame !== nextProps.hasPendulumFrame ||
      prevState.includesLink !== nextProps.includesLink ||
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
        hasPendulumFrame: nextProps.hasPendulumFrame,
        includesLink: nextProps.includesLink,
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

    const { pendulum, hasPendulumFrame, includesLink, artworkData } = this.state;

    let artworkClass = 'card-layer artwork-container';
    if (hasPendulumFrame) {
      if (includesLink) {
        artworkClass = `${artworkClass} artwork-pendulum-link`;
      } else {
        artworkClass = `${artworkClass} artwork-pendulum`;
      }

      if (pendulum) {
        artworkClass = `${artworkClass} in-pendulum-effect`;
      }
    }

    return (
      <div className={artworkClass}>
        <img className='artwork' src={artworkData} alt='artwork' />
      </div>
    );
  }
}
