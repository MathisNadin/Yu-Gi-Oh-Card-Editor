/* eslint-disable import/no-dynamic-require */
/* eslint-disable lines-between-class-members */
/* eslint-disable global-require */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react/default-props-match-prop-types */
/* eslint-disable react/sort-comp */
/* eslint-disable react/static-property-placement */
/* eslint-disable no-use-before-define */
/* eslint-disable react/require-default-props */
/* eslint-disable no-useless-constructor */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable import/prefer-default-export */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { IContainableProps, IContainableState, Containable } from 'mn-toolkit/containable/Containable';
import './styles.css';
import { HorizontalStack } from 'mn-toolkit/container/HorizontalStack';
import { VerticalStack } from 'mn-toolkit/container/VerticalStack';
import { handlePromise } from 'mn-toolkit/error-manager/ErrorManager';
import { integer, isEmpty } from 'mn-toolkit/tools';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/src/ReactCrop.scss'

interface IArtworkEditDialogProps extends IContainableProps {
  artworkURL: string;
  hasPendulumFrame: boolean;
  hasLinkFrame: boolean;
}

interface IArtworkEditDialogState extends IContainableState {
  artwork: string;
  crop: Crop;
}

export class ArtworkEditDialog extends Containable<IArtworkEditDialogProps, IArtworkEditDialogState> {

  public constructor(props: IArtworkEditDialogProps) {
    super(props);
    this.state = {
      loaded: false,
      artwork: '',
      crop: {
        x: 0,
        y: 0,
        height: 100,
        width: 100,
        unit: '%'
      }
    }
    handlePromise(this.load());
  }

  private async load() {
    let artwork = '';

    let needForceUpdate = false;
    let artworkExists = false;
    if (!isEmpty(this.props.artworkURL)) {
      needForceUpdate = true;
      artworkExists = await window.electron.ipcRenderer.checkFileExists(this.props.artworkURL);
    }

    if (artworkExists) {
      artwork = `file://${this.props.artworkURL}`;
      artwork = await window.electron.ipcRenderer.createImgFromPath(this.props.artworkURL);
    }

    this.setState({
      loaded: true,
      artwork,
    });
  }

  private onRectangleRef(div: HTMLDivElement) {
    if (!div) return;
    let isResizing = false;
    let startX: number;
    let startY: number;
    let startWidth: number;
    let startHeight: number;

    div.addEventListener('mousedown', e => {
      const target = e.target as Element;
      if (target.classList.contains('resize-rectangle')) {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = integer(
          window.getComputedStyle(div).getPropertyValue('width')
        );
        startHeight = integer(
          window.getComputedStyle(div).getPropertyValue('height')
        );
      }
    });

    div.addEventListener('mousemove', e => {
      if (isResizing) {
        const width = startWidth + e.clientX - startX;
        const height = startHeight + e.clientY - startY;
        if (width > 0 && height > 0) {
          div.style.width = `${width}px`;
          div.style.height = `${height}px`;
        }
      } else if ((e.target as Element).classList.contains('resize-rectangle')) {
        div.style.cursor = 'move';
      } else {
        div.style.cursor = 'auto';
      }
    });

    div.addEventListener('mouseup', e => {
      isResizing = false;
    });
  }

  public render() {
    if (!this.state?.loaded) return <div></div>;
    return this.renderAttributes(<HorizontalStack>
      <VerticalStack className='artwork-edit'>
        {!!this.state.artwork.length && <ReactCrop crop={this.state.crop} onChange={(crop: Crop) => this.setState({ crop })}>
          <img className='artwork-img' src={this.state.artwork} alt='artwork' />
        </ReactCrop>}
{/*         {!!this.state.artwork.length && <img className='artwork-img' src={this.state.artwork} alt='artwork' />}
        <div className='resize-rectangle' ref={(ref: HTMLDivElement) => this.onRectangleRef(ref)} ></div> */}
      </VerticalStack>

      <VerticalStack className='artwork-details'>
      </VerticalStack>
    </HorizontalStack>, 'artwork-edit-dialog');
  }
}
