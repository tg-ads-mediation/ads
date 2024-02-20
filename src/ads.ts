import {OpenRTB25} from '@clearcodehq/openrtb';

export type AdType = 'video' | 'banner';

const iframeId = 'tg-ads-mediation--ads';

function calcScreenDPI() {
  const element = document.createElement('div');
  element.style.width = '1in';
  document.body.appendChild(element);

  const dpi = element.offsetWidth * devicePixelRatio;

  element.remove();
  return dpi;
}

export interface AdsParams {
  userId?: string;
  language?: string;
  apiVersion?: 1;
  test?: true | string;
}

export interface Placement {
  width: number;
  height: number;
}

export class Ads {
  private readonly device: OpenRTB25.Device;
  private readonly user: OpenRTB25.User;
  private readonly sspUrl: string;
  private readonly apiVersion: number;

  constructor(params: AdsParams) {
    const {userId, language, test, apiVersion = 1} = params;

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
  }

  public showRewardedVideo(): Promise<boolean> {
    return this.show('video');
  }

  public showBottomBanner(): Promise<boolean> {
    return this.show('banner');
  }

  private async show(type: AdType = 'video'): Promise<boolean> {
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
        device: this.device,
        user: this.user,
        placement
      })
    });
    if (response.status !== 200) {
      console.error('Failed to fetch an ad.');
      return false;
    }

    const ad: OpenRTB25.BidResponse = await response.json();
    if (
      ad.seatbid == null ||
      ad.seatbid.length === 0 ||
      ad.seatbid[0] == null ||
      ad.seatbid[0].bid.length === 0 ||
      ad.seatbid[0].bid[0] == null ||
      ad.seatbid[0].bid[0].adm == null
    ) {
      console.error('No ad available.');
      return false;
    }

    let adContent = ad.seatbid[0].bid[0].adm;
    if (adContent.indexOf('<HTMLResource') !== -1) {
      adContent = adContent
        .substring(adContent.indexOf('<HTMLResource'), adContent.indexOf('</HTMLResource>'))
        .replace('</html>]]>', '');
    }

    const iframe = this.createPlacement(type);

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
      <button style="position: absolute;top: 15px;right: 15px;cursor: pointer;z-index:9999" onclick="window.parent.document.body.removeChild(window.parent.document.getElementById('${iframe.id}'))">Close</button>
    `;
    document.body.appendChild(iframe);

    return true;
  }

  private createPlacement(type: AdType): HTMLIFrameElement {
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

    return iframe;
  }
}
