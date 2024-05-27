import {OpenRTB25} from '@clearcodehq/openrtb';
import {AdResponse, AdType, AdPlacement, AdRequest, MiniAppData} from './client-server-protocol';
import {adContainerId} from './client-server-protocol';
import {calcScreenDpi, getThemeParams, getUserData} from './helpers';

export interface Subscribers {
  [key: string]: {
    onReward: () => void;
    onClose: () => void;
  };
}

export interface AdsParams {
  key: string;
  test?: boolean | string | {enabled?: boolean | string; stubs?: boolean};
}

export interface AdEvents {
  onNotFound?: () => void;
  onOpen?: () => void;
  onReward?: () => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
}

export type VisibleAds = Partial<Record<AdType, string>>;

export class Ads {
  private visibleAds: VisibleAds = {};
  private subscribers: Subscribers = {};
  private onPostMessage: (event: MessageEvent) => void;

  private readonly publisherKey: string;
  private readonly device: OpenRTB25.Device;
  private readonly user: OpenRTB25.User;
  private readonly sspUrl: string;
  private readonly apiVersion: number;
  private readonly miniAppData: MiniAppData;
  private readonly showAdStubs: boolean;

  constructor(params: AdsParams) {
    const {key, test: testParams} = params;
    const test = typeof testParams === 'object' ? testParams.enabled : testParams;
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
    this.showAdStubs = test && typeof testParams === 'object' && testParams.stubs ? true : false;

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

  public closeRewardedVideo(): void {
    this.close('video');
  }

  public closeBottomBanner(): void {
    this.close('banner');
  }

  public closeAll(): void {
    this.close('video');
    this.close('banner');
  }

  public destroy() {
    window.removeEventListener('message', this.onPostMessage);
    this.onPostMessage = () => {};
    this.subscribers = {};
  }

  private async show(type: AdType = 'video', listeners?: AdEvents): Promise<boolean> {
    const noop = () => {};
    const {
      onNotFound = noop,
      onOpen = noop,
      onReward = noop,
      onClose = noop,
      onError = noop
    } = listeners || {};

    try {
      this.close(type);

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
      if (this.showAdStubs) {
        requestBody.stubAds = true;
      }

      const response = await fetch(`${this.sspUrl}/api/v${this.apiVersion}/ad`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      if (response.status !== 200) {
        onNotFound();
        return false;
      }
      const adResponse: AdResponse = await response.json();

      const iframe = this.createPlacement(adResponse);
      iframe.srcdoc = adResponse.ad.markup;
      document.body.appendChild(iframe);

      this.visibleAds[type] = adResponse.id;
      onOpen();
      this.subscribers[adResponse.id] = {onReward, onClose};

      return true;
    } catch (error) {
      onError(error);
      return false;
    }
  }

  private close(id: string): void;
  private close(type: AdType): void;
  private close(idOrType: AdType | string): void {
    const adId = ['video', 'banner'].includes(idOrType)
      ? this.visibleAds[idOrType as AdType]
      : idOrType;
    if (!adId) {
      return;
    }

    const subscriber = this.subscribers[adId];
    if (subscriber == null) {
      return;
    }

    document.getElementById(adContainerId + adId)?.remove();
    subscriber.onClose();
    delete this.subscribers[adId];

    if (this.visibleAds.video === adId) {
      delete this.visibleAds.video;
    } else if (this.visibleAds.banner === adId) {
      delete this.visibleAds.banner;
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

  private handlePostMessage(event: MessageEvent<{adId: string; event: string; link?: string}>) {
    if (event.origin !== window.location.origin || event.data == null) {
      return;
    }

    const data = event.data;
    const subscriber = this.subscribers[data.adId];
    if (subscriber == null) {
      return;
    }

    if (data.event === 'openAdLink' && data.link) {
      // todo check if it's web, then use approach:
      // https://docs.telegram-mini-apps.com/platform/methods#web
      window.TelegramWebviewProxy?.postEvent(
        'web_app_open_link',
        JSON.stringify({
          url: data.link
        })
      );
    } else if (data.event === 'reward') {
      subscriber.onReward();
    } else if (data.event === 'close') {
      this.close(data.adId);
    }
  }
}
