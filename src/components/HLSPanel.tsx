import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import Hls from 'hls.js';

interface Props extends PanelProps<SimpleOptions> {}

const getStyles = () => {
  return {
    video: css``,
  };
};

export const HLSPanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }) => {
  // const theme = useTheme2();
  const styles = useStyles2(getStyles);
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    if (videoRef.current) {
      let video: HTMLVideoElement = videoRef.current;
      if(options.autoplay) {
        video.setAttribute('autoplay', 'true');
      } else {
        video.removeAttribute('autoplay');
      }
      if(options.controlsOption !== 'notset') {
        if(options.controlsOption === 'controls') {
          video.setAttribute('controls', 'true');
        } else if (options.controlsOption === 'controlslist') {
          video.setAttribute('controlslist', options.controlslistConfig);
        }
      } else {
        video.removeAttribute('controls');
        video.removeAttribute('controlslist');
      }
      if(options.crossorigin !== 'notset') {
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
      for(let attribute of boolean_attributes) {
        if(options[attribute] === true) {
          video.setAttribute(attribute, 'true');
        } else {
          video.removeAttribute(attribute);
        }
      }
      if(options.poster) {
        video.setAttribute('poster', options.poster);
      } else {
        video.removeAttribute('poster');
      }
      if(options.preload !== 'notset') {
        video.setAttribute('preload', options.preload);
      } else {
        video.removeAttribute('preload');
      }
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(options.src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegURL')) {
        video.src = options.src;
      } else {
        console.error('Your browser does not support HLS.');
      }
    }
  }, [options]);

  return (
    <>
      <video data-testid='hlsvideo' ref={videoRef} className={cx(styles.video, css`${options.style}`)}>Your browser does not support HLS</video>
    </>
  );
};
