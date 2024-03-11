import {OpenRTB25} from '@clearcodehq/openrtb';
import {AdResponse, AdType, AdPlacement, AdRequest, MiniAppData} from './client-server-protocol';
import {adContainerId} from './client-server-protocol';
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
      const debug = localStorage.getItem('tgAdsMediationDebug');
      if (debug) {
        requestBody.debug = JSON.parse(debug);
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

      const iframe = this.createPlacement(adResponse);
      iframe.srcdoc = adResponse.ad.markup;
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
    iframe.id = adContainerId + ad.id;
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

    return iframe;
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
    document.getElementById(adContainerId + data.adId)?.remove();
    subscriber.onClose();
    delete this.subscribers[data.adId];
  }
}
