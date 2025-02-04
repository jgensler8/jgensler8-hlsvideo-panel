import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { HLSPanel } from './components/HLSPanel';

export const plugin = new PanelPlugin<SimpleOptions>(HLSPanel).setPanelOptions((builder) => {
  return builder
    .addTextInput({
      path: 'src',
      name: 'Video Source',
      description: 'Example: http://server:port/playlist.m3u8',
      defaultValue: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    })
    .addTextInput({
      path: 'style',
      name: 'style',
      defaultValue: 'height: 100%; width: 100%;'
    })
    .addBooleanSwitch({
      path: 'autoplay',
      name: 'autoplay',
      defaultValue: false
    })
    .addRadio({
      path: 'controlsOption',
      name: 'Enable Controls',
      description: 'set controls (play, volume, playback speed) or controlslist tag',
      defaultValue: 'notset',
      settings: {
        options: [
          {
            value: 'notset',
            label: 'not set'
          },
          {
            value: 'controls',
            label: 'controls'
          },
          {
            value: 'controlslist',
            label: 'controlslist'
          }
        ]
      }
    })
    .addTextInput({
      path: 'controlslistConfig',
      name: 'controlslist Config',
      description: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#controlslist',
      defaultValue: '',
      showIf: (config) => config.controlsOption === 'controlslist'
    })
    .addRadio({
      path: 'crossorigin',
      name: 'crossorigin',
      description: '',
      defaultValue: 'notset',
      settings: {
        options: [
          {
            value: 'notset',
            label: 'not set'
          },
          {
            value: 'anonymous',
            label: 'anonymous'
          },
          {
            value: 'use-credentials',
            label: 'use-credentials'
          }
        ]
      }
    })
    .addBooleanSwitch({
      path: 'disablepictureinpicture',
      name: 'Disable Picture-in-Picture',
      defaultValue: false
    })
    .addBooleanSwitch({
      path: 'disableremoteplayback',
      name: 'Disable Remote Playback',
      defaultValue: false
    })
    .addBooleanSwitch({
      path: 'loop',
      name: 'Loop the video upon completion',
      defaultValue: false
    })
    .addBooleanSwitch({
      path: 'muted',
      name: 'Muted',
      defaultValue: false
    })
    .addBooleanSwitch({
      path: 'playsinline',
      name: 'Plays Inline',
      defaultValue: false
    })
    .addTextInput({
      path: 'poster',
      name: 'Poster',
      description: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#poster'
    })
    .addRadio({
      path: 'preload',
      name: 'preload',
      description: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#preload',
      defaultValue: 'notset',
      settings: {
        options: [
          {
            value: 'notset',
            label: 'not set'
          },
          {
            value: 'none',
            label: 'none'
          },
          {
            value: 'metadata',
            label: 'metadata'
          },
          {
            value: 'auto',
            label: 'auto'
          }
        ]
      }
    })
    .addBooleanSwitch({
      path: 'enablecrosshairtimerange',
      name: 'Enable Crosshair Timerange',
      description: 'enable a seekable time range that will publish and subscribe to hover events. only works with playlists that expose Date data (EXT-X-PROGRAM-DATE-TIME)',
      defaultValue: false,
    })
    .addNumberInput({
      path: 'seekDelta',
      name: 'Seek Delta',
      description: 'forward and backward seek duration',
      defaultValue: 10,
    })
});
