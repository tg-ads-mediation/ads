import {OpenRTB25} from '@clearcodehq/openrtb';

export type AdType = 'video' | 'banner';

export interface AdPlacement {
  width: number;
  height: number;
}

export interface AdRequest {
  publisherKey: string;
  adType: AdType;
  device: OpenRTB25.Device;
  user: OpenRTB25.User;
  placement: AdPlacement;
  [key: string]: any;
}

export interface BannerAdContent {
  markup: string;
}

export interface VideoAdContent {
  video: {
    creative: VideoCreative;
  };
  companion: BannerAdContent;
}

export interface VideoCreative {
  src: string;
  clickThrough: string;
}

export type AdContent = BannerAdContent | VideoAdContent;

export interface BannerAdResponse {
  type: 'banner';
  id: string;
  price: number;
  ad: BannerAdContent;
}

export interface VideoAdResponse {
  type: 'video';
  id: string;
  price: number;
  ad: VideoAdContent;
}

export type AdResponse = BannerAdResponse | VideoAdResponse;
