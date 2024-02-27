import {closeButtonId, soundButtonId, soundOffIconId, soundOnIconId, videoPlayerId} from './consts';
import {closeIcon, soundOffIcon, soundOnIcon} from './icons';

export interface VideoAdParams {
  src: string;
  companionMarkup: string;
  link: string;
  debug?: boolean;
}
export function videoAd({companionMarkup, src, link, debug = false}: VideoAdParams) {
  const html = String.raw;

  return html`
    ${companionMarkup}
    <video
      id="${videoPlayerId}"
      style="
        position:absolute;
        top:0;
        left:0;
        z-index:9999;
        background-color:black;
        width:100%;
        height:100%;
        cursor:pointer;
      "
      src="${src}"
      muted
      autoplay
    ></video>
    <button
      id="${soundButtonId}"
      style="display: none; position: absolute; top: 1px; left: 1px; padding: 0; border-radius: 50%; border: 0; background-color: transparent; cursor: pointer; z-index:9999;"
    >
      <span id="${soundOffIconId}">${soundOffIcon()}</span>
      <span id="${soundOnIconId}" style="display: none;">${soundOnIcon()}</span>
    </button>
    <script>
      const debug = ${debug};
      const player = document.getElementById('${videoPlayerId}');
      const soundButton = document.getElementById('${soundButtonId}');
      const soundOnIcon = document.getElementById('${soundOnIconId}');
      const soundOffIcon = document.getElementById('${soundOffIconId}');

      if (player) {
        player.onplay = () => {
          try {
            player.muted = false;
            if (soundButton) {
              soundButton.style.display = 'block';
            }
          } catch (e) {
            if (debug) console.warn('Failed to unmute ad video.');
          }
        };
        player.onended = () => {
          if (soundButton) {
            soundButton.style.display = 'none';
          }
          player.remove();
        };
        player.onclick = () => {
          window.open('${link}', '_blank', 'noopener,noreferrer');
        };
        player.onvolumechange = () => {
          if (soundOnIcon && soundOffIcon) {
            if (player.muted) {
              soundOnIcon.style.display = 'none';
              soundOffIcon.style.display = 'block';
            } else {
              soundOnIcon.style.display = 'block';
              soundOffIcon.style.display = 'none';
            }
          }
        };
      }

      if (soundButton) {
        soundButton.onclick = () => {
          player.muted = !player.muted;
        };
      }
    </script>
  `;
}

export interface IframeContentParams {
  iframe: HTMLIFrameElement;
  adId: string;
  adContent: string;
}
export function iframeContent({iframe, adId, adContent}: IframeContentParams) {
  const html = String.raw;

  return html`
    <style>
      body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        padding: 0;
        background-color: var(--tg-theme-bg-color);
      }
    </style>
    ${adContent}
    <button
      id="${closeButtonId}"
      style="position: absolute; top: 1px; right: 1px; padding: 0; border-radius: 50%; border: 0; background-color: transparent; cursor: pointer; z-index:9999;"
    >
      ${closeIcon()}
    </button>
    <script>
      const btn = document.getElementById('${closeButtonId}');
      if (btn) {
        btn.onclick = () => {
          window.parent.postMessage({adId: '${adId}', event: 'close'});
          window.parent.document.body.removeChild(
            window.parent.document.getElementById('${iframe.id}')
          );
        };
      }
    </script>
  `;
}
