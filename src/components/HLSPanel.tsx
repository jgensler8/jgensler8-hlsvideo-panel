import React, { SetStateAction, useContext } from 'react';
import { InterpolateFunction, PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import Hls from 'hls.js';
import { CrosshairTimeRange } from './CrosshairTimeRange';
import {
  useMediaRef,
  MediaProvider,
} from 'media-chrome/dist/react/media-store';
import { SeekButton } from './SeekButton';

interface Props extends PanelProps<SimpleOptions> { }
interface VideoProps { options: SimpleOptions, replaceVariables: InterpolateFunction };

const getStyles = () => {
  return {
    video: css``,
  };
};

interface HlsState {
  hls: Hls | null,
  setHls: React.Dispatch<SetStateAction<Hls | null>>
}

export const HlsContext = React.createContext<HlsState>({ hls: null, setHls: () => { } })
const HlsProvider = ({ children }: { children: React.ReactNode }) => {
  const [value, setValue] = React.useState<Hls | null>(null);

  return (
    <HlsContext.Provider value={{ hls: value, setHls: setValue }}>
      {children}
    </HlsContext.Provider>
  );
};

const Video: React.FC<VideoProps> = ({ options, replaceVariables }) => {
  const { setHls } = useContext(HlsContext);
  const [interpolatedSrc, setInterpolatedSrc] = React.useState('');

  React.useEffect(() => {
    const src = replaceVariables(options.src);
    setInterpolatedSrc(src);
  }, [options.videoUrl, replaceVariables, options.src]);

  // const theme = useTheme2();
  const styles = useStyles2(getStyles);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const mediaRef = useMediaRef();

  React.useEffect(() => {
    if (videoRef.current) {
      let video: HTMLVideoElement = videoRef.current;
      if (options.autoplay) {
        video.setAttribute('autoplay', 'true');
      } else {
        video.removeAttribute('autoplay');
      }
      if (options.controlsOption !== 'notset') {
        if (options.controlsOption === 'controls') {
          video.setAttribute('controls', 'true');
        } else if (options.controlsOption === 'controlslist') {
          video.setAttribute('controlslist', options.controlslistConfig);
        }
      } else {
        video.removeAttribute('controls');
        video.removeAttribute('controlslist');
      }
      if (options.crossorigin !== 'notset') {
        video.setAttribute('crossorigin', options.crossorigin);
      } else {
        video.removeAttribute('crossorigin');
      }
      let boolean_attributes = [
        'disablepictureinpicture',
        'disableremoteplayback',
        'loop',
        'muted',
        'playsinline'
      ];
      for (let attribute of boolean_attributes) {
        if (options[attribute] === true) {
          video.setAttribute(attribute, 'true');
        } else {
          video.removeAttribute(attribute);
        }
      }
      if (options.poster) {
        video.setAttribute('poster', options.poster);
      } else {
        video.removeAttribute('poster');
      }
      if (options.preload !== 'notset') {
        video.setAttribute('preload', options.preload);
      } else {
        video.removeAttribute('preload');
      }
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.on(Hls.Events.KEY_LOADED, () => {
          // console.debug("key loaded " + hls.playingDate)
        })
        hls.on(Hls.Events.FRAG_LOADED, () => {
          // console.debug("frag loaded " + hls.playingDate)
        })
        hls.on(Hls.Events.LEVEL_LOADED, () => {
          // console.debug("level loaded " + hls.playingDate)
        })
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // console.debug("level loaded " + hls.playingDate)
        })
        hls.loadSource(interpolatedSrc);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          // console.debug("media attached " + hls.playingDate)
        })
        hls.attachMedia(video);
        setHls(hls);
      } else if (video.canPlayType('application/vnd.apple.mpegURL')) {
        video.src = interpolatedSrc;
      } else {
        console.error('Your browser does not support HLS.');
      }
    }
  }, [options, videoRef, setHls, interpolatedSrc]);

  return (
    <video data-testid='hlsvideo' slot="media" className={cx(styles.video, css`${options.style}`)} ref={(el) => {
      mediaRef(el);
      if (el) {
        videoRef.current = el;
      }
      return el;
    }}>Your browser does not support HLS</video>
  );
};

export const HLSPanel: React.FC<Props> = ({ eventBus, options, replaceVariables, data, width, height, fieldConfig, id, timeRange }) => {
  return (
    <MediaProvider>
      <HlsProvider>
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: '100%', flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
            <Video options={options} replaceVariables={replaceVariables}></Video>
          </div>
          {options.enablecrosshairtimerange ? <div style={{ height: '70px' }}>
            <div style={{ height: '40px', overflow: 'hidden' }}>
              <CrosshairTimeRange eventBus={eventBus} timeRange={timeRange}></CrosshairTimeRange>
            </div>
            <div style={{ height: '30px', overflow: 'hidden' }}>
              <SeekButton seekDelta={options.seekDelta}>forward</SeekButton>
              <SeekButton seekDelta={options.seekDelta * -1.0}>backward</SeekButton>
            </div>
          </div> : <></>}
        </div>
      </HlsProvider>
    </MediaProvider>
  );
};
