import {OpenRTB25} from '@clearcodehq/openrtb';
import {
  AdResponse,
  AdType,
  AdPlacement,
  AdRequest,
  StatsRequest,
  MiniAppData
} from './client-server-protocol';
import {bannerAd, iframeContent, videoAd} from './ads-templates';
import {idPrefix} from './consts';
import {calcScreenDpi, getThemeParams, getUserData} from './helpers';

export interface Subscribers {
  [key: string]: {
    onClose: () => void;
  };
}

export interface AdsParams {
  key: string;
  test?: true | string;
}

export interface AdEvents {
  onNotFound?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
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
  private readonly miniAppData: MiniAppData;

  constructor(params: AdsParams) {
    const {key, test} = params;
    const user = getUserData();
    const theme = getThemeParams();

    this.publisherKey = key;
    this.device = {
      ua: navigator.userAgent,
      pxratio: window.devicePixelRatio,
      ppi: calcScreenDpi(),
      w: screen.width,
      h: screen.height,
      language: user.languageCode || navigator.language
    };
    this.user = {
      id: String(user.id)
    };
    this.sspUrl = test
      ? test === true
        ? 'https://ssp-test.tgadhub.com'
        : test
      : 'https://ssp.tgadhub.com';
    this.apiVersion = 1;
    this.testMode = Boolean(test);
    this.miniAppData = {
      user,
      theme
    };

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
    const {onNotFound = noop, onOpen = noop, onClose = noop, onError = noop} = listeners || {};

    try {
      const placement: AdPlacement = {
        width: window.innerWidth,
        height: type === 'video' ? window.innerHeight : 100
      };

      const requestBody: AdRequest = {
        adType: type,
        publisherKey: this.publisherKey,
        device: this.device,
        user: this.user,
        placement,
        miniAppData: this.miniAppData
      };
      if ((window as any)['tgAdsMediation']) {
        requestBody.debug = {
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
              debug: this.testMode,
              theme: this.miniAppData.theme
            })
          : bannerAd({markup: adResponse.ad.markup, theme: this.miniAppData.theme});

      const iframe = this.createPlacement(adResponse);
      iframe.srcdoc = iframeContent({iframe, adId: adResponse.id, adContent});
      document.body.appendChild(iframe);

      onOpen();
      this.subscribers[adResponse.id] = {onClose};

      return true;
    } catch (error) {
      onError(error);
      return false;
    }
  }

  private createPlacement(ad: AdResponse): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.id = idPrefix + '__' + String(Math.random()).substring(2);
    iframe.style.position = 'fixed';
    iframe.style.width = '100%';
    iframe.style.zIndex = '9999';
    iframe.style.backgroundColor = 'white';
    iframe.style.border = 'none';

    if (ad.type === 'video') {
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.height = '100%';
    } else {
      iframe.style.bottom = '0';
      iframe.style.left = '0';
      iframe.style.height = '100px';

      if (ad.ad.size && ad.ad.size.width && ad.ad.size.height) {
        iframe.style.width = `${ad.ad.size.width}px`;
        iframe.style.height = `${ad.ad.size.height}px`;
        iframe.style.left = '50%';
        iframe.style.transform = 'translateX(-50%)';
      }
    }

    iframe.onload = () => {
      this.sendStats({requestId: ad.id, action: 'view', burl: ad.ad.hooks.burl});

      const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDocument) {
        iframeDocument.body.addEventListener(
          'click',
          (event) => {
            // todo improve click detection logic
            if (
              event.target !== iframeDocument.body &&
              (!(event.target as HTMLElement).id ||
                (event.target as HTMLElement).id.indexOf(idPrefix) === -1) &&
              !['path', 'rect', 'svg'].includes((event.target as HTMLElement).tagName.toLowerCase())
            ) {
              if (this.testMode) console.info('click sent');
              this.sendStats({requestId: ad.id, action: 'click', burl: undefined});
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

  private async sendStats(params: StatsRequest) {
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
