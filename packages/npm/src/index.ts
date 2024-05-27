import {AdsParams, Ads as AdsOriginal, AdEvents} from './global';

export {AdsParams, AdsOriginal, AdEvents};

export class Ads implements AdsOriginal {
  private readonly instance: AdsOriginal;

  private constructor(params: AdsParams) {
    const AdsClass = Ads.getOriginalClass();
    this.instance = new AdsClass(params);
  }

  public static async create(params: AdsParams & {cdnUrl?: string}): Promise<Ads> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src =
        params.cdnUrl ??
        'https://cdn.jsdelivr.net/npm/@tg-ads-mediation/ads-cdn@latest/dist/ads.js';
      script.onload = () => {
        try {
          resolve(new Ads(params));
        } catch (error) {
          reject(error);
        }
      };
      script.onerror = (error) => {
        reject(error);
      };

      document.head.appendChild(script);
    });
  }

  public showRewardedVideo(listeners?: AdEvents | undefined): Promise<boolean> {
    return this.instance.showRewardedVideo(listeners);
  }

  public showBottomBanner(listeners?: AdEvents | undefined): Promise<boolean> {
    return this.instance.showBottomBanner(listeners);
  }

  public closeRewardedVideo(): void {
    this.instance.closeRewardedVideo();
  }

  public closeBottomBanner(): void {
    this.instance.closeBottomBanner();
  }

  public closeAll(): void {
    this.instance.closeAll();
  }

  public destroy(): void {
    return this.instance.destroy();
  }

  private static getOriginalClass(): typeof AdsOriginal {
    if (!window.tgadhub?.Ads) {
      throw new Error(
        'window.tgadhub.Ads is not defined. Please make sure that the script is loaded.'
      );
    }

    return window.tgadhub.Ads;
  }
}
