import {MiniAppTheme} from './client-server-protocol';
import {
  closeButtonId,
  playbackProgress,
  soundButtonId,
  soundOffIconId,
  soundOnIconId
} from './consts';
import {IconParams, closeIcon, closeIconNoBg, soundOffIcon, soundOnIcon} from './icons';

export interface BannerAdParams {
  markup: string;
  theme: MiniAppTheme;
}

export function bannerAd({markup}: BannerAdParams) {
  const html = String.raw;

  return html`
    ${markup}
    <button
      id="${closeButtonId}"
      style="
        position: absolute;
        top: 0;
        right: 0;
        padding: 0;
        border-radius: 50%;
        border: 0;
        background-color: transparent;
        cursor: pointer;
        z-index:9999;
      "
    >
      ${closeIconNoBg()}
    </button>
  `;
}

export interface VideoAdParams {
  src: string;
  companionMarkup: string;
  link: string;
  theme: MiniAppTheme;
  debug?: boolean;
}

export function videoAd({companionMarkup, src, link, theme, debug = false}: VideoAdParams) {
  const html = String.raw;
  const iconParams: IconParams = {
    backgroundColor: theme.buttonColor,
    iconColor: theme.buttonTextColor
  };

  return html`
    ${companionMarkup}
    <video
      style="
        position: absolute;
        top: 0;
        left: 0;
        z-index: 9999;
        background-color: ${theme.backgroundColor};
        width: 100%;
        height: 100%;
        cursor: pointer;
      "
      src="${src}"
      muted
      playsinline
      autoplay
    >
      ></video
    >
    <div
      id="${playbackProgress}"
      style="
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 2px;
        background-color: ${theme.buttonColor};
        z-index:9999;
      "
    ></div>
    <button
      id="${soundButtonId}"
      style="
        display: none;
        position: absolute;
        top: 5px;
        left: 5px;
        padding: 0;
        border-radius: 50%;
        border: 0;
        background-color: transparent;
        cursor: pointer;
        z-index:9999;
      "
    >
      <span id="${soundOffIconId}">${soundOffIcon(iconParams)}</span>
      <span id="${soundOnIconId}" style="display: none;">${soundOnIcon(iconParams)}</span>
    </button>
    <button
      id="${closeButtonId}"
      style="
        display: none;
        position: absolute;
        top: 5px;
        right: 5px;
        padding: 0;
        border-radius: 50%;
        border: 0;
        background-color: transparent;
        cursor: pointer;
        z-index:9999;
      "
    >
      ${closeIcon(iconParams)}
    </button>
    <script>
      const debug = ${debug};
      const player = document.getElementsByTagName('video')[0];
      const playbackProgress = document.getElementById('${playbackProgress}');
      const soundButton = document.getElementById('${soundButtonId}');
      const closeButton = document.getElementById('${closeButtonId}');
      const soundOnIcon = document.getElementById('${soundOnIconId}');
      const soundOffIcon = document.getElementById('${soundOffIconId}');
      const closeButtonTimeout = 10;
      let closeButtonShown = false;
      const showCloseButton = () => {
        closeButton.style.display = 'block';
        closeButtonShown = true;
      };
      // in case video won't play, show close button after by timeout
      let fallbackCloseButtonTimer = setTimeout(showCloseButton, closeButtonTimeout * 1000);

      if (player) {
        player.onplay = () => {
          if (soundButton) {
            soundButton.style.display = 'block';
            playbackProgress.style.display = 'block';
          }
        };
        player.onended = () => {
          if (soundButton) {
            soundButton.style.display = 'none';
            playbackProgress.style.display = 'none';
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
        player.ontimeupdate = () => {
          // playback works, cancel fallback close button timer
          if (fallbackCloseButtonTimer) {
            clearTimeout(fallbackCloseButtonTimer);
            fallbackCloseButtonTimer = null;
          }

          playbackProgress.style.width = (player.currentTime / player.duration) * 100 + '%';

          if (!closeButtonShown) {
            if (
              player.duration >= closeButtonTimeout
                ? player.currentTime >= closeButtonTimeout
                : player.currentTime >= player.duration
            ) {
              showCloseButton();
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
        background-color: transparent;
      }
    </style>
    ${adContent}
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
