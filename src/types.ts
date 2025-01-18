type ControlsOption = 'notset' | 'controls' | 'controlslist';
type CrossoriginOption = 'notset' | 'anonymous' | 'use-credentials';
type PreloadOption = 'notset' | 'none' | 'metadata' | 'auto';

export interface SimpleOptions {
  src: string;
  style: string;
  autoplay: boolean;
  controlsOption: ControlsOption;
  controlslistConfig: string;
  crossorigin: CrossoriginOption;
  disablepictureinpicture: boolean;
  disableremoteplayback: boolean;
  loop: boolean;
  muted: boolean;
  playsinline: boolean;
  poster: string;
  preload: PreloadOption;
  enablecrosshairtimerange: boolean;
  [key: string]: string | boolean | undefined;
}
