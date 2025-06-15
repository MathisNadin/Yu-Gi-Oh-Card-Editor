import { MediaHTMLAttributes, SyntheticEvent, VideoHTMLAttributes } from 'react';
import { IContainableProps, Containable, IContainableState } from '../containable';

export interface IVideoSource {
  src: string | undefined;
  mimeType?: string; // Ex: 'video/mp4', 'video/webm'
}

export interface IVideoTrack {
  src: string;
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
  srcLang?: string;
  label?: string;
  default?: boolean;
}

export interface IVideoPlayerProps extends IContainableProps<HTMLVideoElement> {
  thumbnail: VideoHTMLAttributes<HTMLVideoElement>['poster'];
  sources: IVideoSource[];
  tracks?: IVideoTrack[];

  // VideoHTMLAttributes
  autoPlay?: MediaHTMLAttributes<HTMLVideoElement>['autoPlay'];
  controls?: MediaHTMLAttributes<HTMLVideoElement>['controls'];
  crossOrigin?: MediaHTMLAttributes<HTMLVideoElement>['crossOrigin'];
  loop?: MediaHTMLAttributes<HTMLVideoElement>['loop'];
  mediaGroup?: MediaHTMLAttributes<HTMLVideoElement>['mediaGroup'];
  muted?: MediaHTMLAttributes<HTMLVideoElement>['muted'];
  preload?: MediaHTMLAttributes<HTMLVideoElement>['preload'];
  playsInline?: VideoHTMLAttributes<HTMLVideoElement>['playsInline'];

  // Video Events
  onAbort?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onAbortCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onCanPlay?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onCanPlayCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onCanPlayThrough?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onCanPlayThroughCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onDurationChange?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onDurationChangeCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onEmptied?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onEmptiedCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onEncrypted?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onEncryptedCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onEnded?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onEndedCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onError?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onErrorCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onLoadedData?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onLoadedDataCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onLoadedMetadata?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onLoadedMetadataCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onLoadStart?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onLoadStartCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onPause?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onPauseCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onPlay?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onPlayCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onPlaying?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onPlayingCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onProgress?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onProgressCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onRateChange?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onRateChangeCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onResize?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onResizeCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onSeeked?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onSeekedCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onSeeking?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onSeekingCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onStalled?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onStalledCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onSuspend?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onSuspendCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onTimeUpdate?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onTimeUpdateCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onVolumeChange?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onVolumeChangeCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onWaiting?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
  onWaitingCapture?: (event: SyntheticEvent<HTMLVideoElement, Event>) => void;
}

interface IVideoPlayerState extends IContainableState {}

export class VideoPlayer extends Containable<IVideoPlayerProps, IVideoPlayerState, HTMLVideoElement> {
  public static override get defaultProps(): IVideoPlayerProps {
    return {
      ...super.defaultProps,
      bg: '4',
      thumbnail: '',
      sources: [],
      controls: true,
      preload: 'metadata',
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-video-player'] = true;
    return classes;
  }

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    attributes.poster = this.props.thumbnail;

    // VideoHTMLAttributes
    attributes.autoPlay = this.props.autoPlay;
    attributes.controls = this.props.controls;
    attributes.crossOrigin = this.props.crossOrigin;
    attributes.loop = this.props.loop;
    attributes.mediaGroup = this.props.mediaGroup;
    attributes.muted = this.props.muted;
    attributes.preload = this.props.preload;
    attributes.playsInline = this.props.playsInline;

    // Video Events
    attributes.onAbort = this.props.onAbort;
    attributes.onAbortCapture = this.props.onAbortCapture;
    attributes.onCanPlay = this.props.onCanPlay;
    attributes.onCanPlayCapture = this.props.onCanPlayCapture;
    attributes.onCanPlayThrough = this.props.onCanPlayThrough;
    attributes.onCanPlayThroughCapture = this.props.onCanPlayThroughCapture;
    attributes.onDurationChange = this.props.onDurationChange;
    attributes.onDurationChangeCapture = this.props.onDurationChangeCapture;
    attributes.onEmptied = this.props.onEmptied;
    attributes.onEmptiedCapture = this.props.onEmptiedCapture;
    attributes.onEncrypted = this.props.onEncrypted;
    attributes.onEncryptedCapture = this.props.onEncryptedCapture;
    attributes.onEnded = this.props.onEnded;
    attributes.onEndedCapture = this.props.onEndedCapture;
    attributes.onError = this.props.onError;
    attributes.onErrorCapture = this.props.onErrorCapture;
    attributes.onLoadedData = this.props.onLoadedData;
    attributes.onLoadedDataCapture = this.props.onLoadedDataCapture;
    attributes.onLoadedMetadata = this.props.onLoadedMetadata;
    attributes.onLoadedMetadataCapture = this.props.onLoadedMetadataCapture;
    attributes.onLoadStart = this.props.onLoadStart;
    attributes.onLoadStartCapture = this.props.onLoadStartCapture;
    attributes.onPause = this.props.onPause;
    attributes.onPauseCapture = this.props.onPauseCapture;
    attributes.onPlay = this.props.onPlay;
    attributes.onPlayCapture = this.props.onPlayCapture;
    attributes.onPlaying = this.props.onPlaying;
    attributes.onPlayingCapture = this.props.onPlayingCapture;
    attributes.onProgress = this.props.onProgress;
    attributes.onProgressCapture = this.props.onProgressCapture;
    attributes.onRateChange = this.props.onRateChange;
    attributes.onRateChangeCapture = this.props.onRateChangeCapture;
    attributes.onResize = this.props.onResize;
    attributes.onResizeCapture = this.props.onResizeCapture;
    attributes.onSeeked = this.props.onSeeked;
    attributes.onSeekedCapture = this.props.onSeekedCapture;
    attributes.onSeeking = this.props.onSeeking;
    attributes.onSeekingCapture = this.props.onSeekingCapture;
    attributes.onStalled = this.props.onStalled;
    attributes.onStalledCapture = this.props.onStalledCapture;
    attributes.onSuspend = this.props.onSuspend;
    attributes.onSuspendCapture = this.props.onSuspendCapture;
    attributes.onTimeUpdate = this.props.onTimeUpdate;
    attributes.onTimeUpdateCapture = this.props.onTimeUpdateCapture;
    attributes.onVolumeChange = this.props.onVolumeChange;
    attributes.onVolumeChangeCapture = this.props.onVolumeChangeCapture;
    attributes.onWaiting = this.props.onWaiting;
    attributes.onWaitingCapture = this.props.onWaitingCapture;

    return attributes;
  }

  public override render() {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video ref={this.base} {...this.renderAttributes()}>
        {this.props.sources.map((source, i) => (
          <source key={i} src={source.src} type={source.mimeType} />
        ))}
        {!!this.props.tracks?.length &&
          this.props.tracks.map((track, i) => (
            <track
              key={i}
              src={track.src}
              kind={track.kind}
              srcLang={track.srcLang}
              label={track.label}
              default={track.default}
            />
          ))}
        {/* Fallback text */}
        Votre navigateur ne supporte pas la lecture vidéo.
        {this.children}
      </video>
    );
  }
}
