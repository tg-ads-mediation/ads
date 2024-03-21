import {AdsParams, AdsOriginal, AdEvents, AdsClass} from './types';

export * from './types';

export class Ads implements AdsOriginal {
  private readonly instance: AdsOriginal;

  constructor(params: AdsParams) {
    const AdsClass = Ads.getOriginalClass();
    this.instance = new AdsClass(params);
  }

  public static async create(params: AdsParams): Promise<Ads> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'http://127.0.0.1:3005/ads.js';
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

  public destroy(): void {
    return this.instance.destroy();
  }

  private static getOriginalClass(): AdsClass {
    if (!window.tgadhub?.Ads) {
      throw new Error(
        'window.tgadhub.Ads is not defined. Please make sure that the script is loaded.'
      );
    }

    return window.tgadhub.Ads;
  }
}
