import {closeButtonId} from './consts';

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
    <script>
      const debug = ${debug};
      const player = document.getElementsByTagName('video')[0];
      if (player) {
        player.onplay = () => {
          try {
            player.muted = false;
          } catch (e) {
            if (debug) console.warn('Failed to unmute ad video.');
          }
        };
        player.onended = () => {
          player.remove();
        };
        player.onclick = () => {
          window.open('${link}', '_blank', 'noopener,noreferrer');
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
      style="position: absolute; top: 15px; right: 15px; cursor: pointer;z-index:9999;"
    >
      Close
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
