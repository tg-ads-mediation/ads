import {OpenRTB25} from '@clearcodehq/openrtb';
import {AdResponse, AdType, AdPlacement, AdRequest} from './client-server-protocol';
import {iframeContent, videoAd} from './ads-templates';
import {idPrefix} from './consts';

type StatsAction = 'view' | 'click';

function calcScreenDPI() {
  const element = document.createElement('div');
  element.style.width = '1in';
  document.body.appendChild(element);

  const dpi = element.offsetWidth * devicePixelRatio;

  element.remove();
  return dpi;
}

export interface Subscribers {
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

    const placement: AdPlacement = {
      width: window.innerWidth,
      height: type === 'video' ? window.innerHeight : 100
    };

    const requestBody: AdRequest = {
      adType: type,
      publisherKey: this.publisherKey,
      device: this.device,
      user: this.user,
      placement
    };
    if (this.testMode) {
      requestBody['debug'] = {
        responseStub: (window as any)['tgAdsMediation']?.['responseStub'],
        customPayload: (window as any)['tgAdsMediation']?.['customPayload']
      };
    }

    const response = await fetch(`${this.sspUrl}/api/v${this.apiVersion}/ad`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    if (response.status !== 200) {
      console.error('Failed to fetch an ad.');
      onNotFound();
      return false;
    }

    const adResponse: AdResponse = await response.json();
    const adContent =
      adResponse.type === 'video'
        ? videoAd({
            src: adResponse.ad.video.creative.src,
            link: adResponse.ad.video.creative.clickThrough,
            companionMarkup: adResponse.ad.companion.markup,
            debug: this.testMode
          })
        : adResponse.ad.markup;

    const iframe = this.createPlacement(type, adResponse.id);
    iframe.srcdoc = iframeContent({iframe, adId: adResponse.id, adContent});
    document.body.appendChild(iframe);

    onOpen();
    this.subscribers[adResponse.id] = {onClose};

    return true;
  }

  private createPlacement(type: AdType, adId: string): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.id = idPrefix + '__' + String(Math.random()).substring(2);
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
            if (
              event.target !== iframeDocument.body &&
              (!(event.target as HTMLElement).id ||
                (event.target as HTMLElement).id.indexOf(idPrefix) === -1)
            ) {
              if (this.testMode) console.info('click sent');
              this.sendStats({impressionId: adId, action: 'click'});
            } else {
              if (this.testMode) console.info('click NOT sent');
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
      if (this.testMode) console.warn('Failed to send stats.', error);
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
