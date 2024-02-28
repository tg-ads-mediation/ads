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

export interface AdHooks {
  nurl?: string;
  burl?: string;
}

export interface BannerSize {
  width: number;
  height: number;
}

export interface BannerAdContent {
  markup: string;
  hooks: AdHooks;
  size?: BannerSize;
}

export interface VideoCompanionContent {
  markup: string;
  size?: BannerSize;
}

export interface VideoAdContent {
  video: {
    creative: VideoCreative;
  };
  companion: VideoCompanionContent;
  hooks: AdHooks;
}

export interface VideoCreative {
  src: string;
  clickThrough: string;
  size?: BannerSize;
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

export type StatsAction = 'view' | 'click';

export interface StatsRequest {
  requestId: string;
  action: StatsAction;
  burl: string | undefined;
}
