import {OpenRTB25} from '@clearcodehq/openrtb';

export type AdType = 'video' | 'banner';
type StatsAction = 'view' | 'click';

const iframeId = 'tg-ads-mediation--ads';

function calcScreenDPI() {
  const element = document.createElement('div');
  element.style.width = '1in';
  document.body.appendChild(element);

  const dpi = element.offsetWidth * devicePixelRatio;

  element.remove();
  return dpi;
}

interface Subscribers {
  [key: string]: {
    onClose: () => void;
  };
}

export interface AdsParams {
  key: string;
  userId?: string;
  language?: string;
  apiVersion?: 1;
  test?: true | string;
}

export interface Placement {
  width: number;
  height: number;
}

interface AdResponse {
  id: string;
  ad: string;
}

export interface AdEvents {
  onNotFound?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export class Ads {
  private subscribers: Subscribers = {};
  private onPostMessage: (event: MessageEvent) => void;

  private readonly publisherKey: string;
  private readonly device: OpenRTB25.Device;
  private readonly user: OpenRTB25.User;
  private readonly sspUrl: string;
  private readonly apiVersion: number;
  private readonly testMode: boolean;

  constructor(params: AdsParams) {
    const {key, userId, language, test, apiVersion = 1} = params;

    this.publisherKey = key;
    this.device = {
      ua: navigator.userAgent,
      pxratio: window.devicePixelRatio,
      ppi: calcScreenDPI(),
      w: screen.width,
      h: screen.height,
      language: language || navigator.language
    };
    this.user = {
      id: userId
    };
    this.sspUrl = test
      ? test === true
        ? 'https://test.ssp.tgadhub.com'
        : test
      : 'https://ssp.tgadhub.com';
    this.apiVersion = apiVersion;
    this.testMode = Boolean(test);

    this.onPostMessage = (event: MessageEvent) => {
      this.handlePostMessage(event);
    };
    window.addEventListener('message', this.onPostMessage);
  }

  public showRewardedVideo(listeners?: AdEvents): Promise<boolean> {
    return this.show('video', listeners);
  }

  public showBottomBanner(listeners?: AdEvents): Promise<boolean> {
    return this.show('banner', listeners);
  }

  public destroy() {
    window.removeEventListener('message', this.onPostMessage);
    this.onPostMessage = () => {};
    this.subscribers = {};
  }

  private async show(type: AdType = 'video', listeners?: AdEvents): Promise<boolean> {
    const noop = () => {};
    const {onNotFound = noop, onOpen = noop, onClose = noop} = listeners || {};

    const placement: Placement = {
      width: window.innerWidth,
      height: type === 'video' ? window.innerHeight : 100
    };

    const response = await fetch(`${this.sspUrl}/api/v${this.apiVersion}/ad`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        adType: type,
        publisherKey: this.publisherKey,
        device: this.device,
        user: this.user,
        placement
      })
    });
    if (response.status !== 200) {
      console.error('Failed to fetch an ad.');
      onNotFound();
      return false;
    }

    let {id: adId, ad: adContent}: AdResponse = await response.json();
    if (adContent.indexOf('<HTMLResource') !== -1) {
      adContent = adContent
        .substring(adContent.indexOf('<HTMLResource'), adContent.indexOf('</HTMLResource>'))
        .replace('</html>]]>', '');
    }

    const iframe = this.createPlacement(type, adId);

    // todo try UI elements stopPropagation to not count clicks on them
    iframe.srcdoc = `
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
        style="position: absolute; top: 15px; right: 15px; cursor: pointer;z-index:9999;"
        onclick="(function(){window.parent.postMessage({adId: '${adId}', event: 'close'});window.parent.document.body.removeChild(window.parent.document.getElementById('${iframe.id}'));})()">
        Close
      </button>
    `;
    document.body.appendChild(iframe);

    onOpen();
    this.subscribers[adId] = {onClose};

    return true;
  }

  private createPlacement(type: AdType, adId: string): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.id = iframeId + '__' + String(Math.random()).substring(2);
    iframe.style.position = 'fixed';
    iframe.style.width = '100%';
    iframe.style.zIndex = '9999';
    iframe.style.backgroundColor = 'white';
    iframe.style.border = 'none';

    if (type === 'video') {
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.height = '100%';
    } else {
      iframe.style.bottom = '0';
      iframe.style.left = '0';
      iframe.style.height = '100px';
    }

    iframe.onload = () => {
      this.sendStats({impressionId: adId, action: 'view'});

      const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDocument) {
        iframeDocument.body.addEventListener(
          'click',
          (event) => {
            // todo improve the logic
            if ((event.target as HTMLElement).tagName === 'DIV') {
              this.sendStats({impressionId: adId, action: 'click'});
            }
          },
          true
        );
      }
    };

    return iframe;
  }

  private async sendStats(params: {impressionId: string; action: StatsAction}) {
    fetch(`${this.sspUrl}/api/v${this.apiVersion}/stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    }).catch((error) => {
      if (this.testMode) {
        console.warn('Failed to send stats.', error);
      }
    });
  }

  private handlePostMessage(event: MessageEvent<{adId: string; event: string}>) {
    if (event.origin !== window.location.origin || event.data == null) {
      return;
    }

    const data = event.data;
    const subscriber = this.subscribers[data.adId];
    if (data.event !== 'close' || subscriber == null) {
      return;
    }
    subscriber.onClose();
    delete this.subscribers[data.adId];
  }
}
