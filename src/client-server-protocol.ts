// copied from backend

import {OpenRTB25} from '@clearcodehq/openrtb';

export const idPrefix = 'tg-ads-mediation--ads__';
export const adContainerId = idPrefix + 'ad-';

export type AdType = 'video' | 'banner';

export interface AdPlacement {
  width: number;
  height: number;
}

export interface MiniAppUser {
  addedToAttachmentMenu?: boolean;
  allowsWriteToPm?: boolean;
  firstName: string;
  id: number;
  isBot?: boolean;
  isPremium?: boolean;
  lastName?: string;
  languageCode?: string;
  photoUrl?: string;
  username?: string;
}

export interface AdsUser extends MiniAppUser {
  timeZone: string;
}

export type RgbColor = `#${string}`;

export interface MiniAppTheme {
  accentTextColor: RgbColor;
  backgroundColor: RgbColor;
  buttonColor: RgbColor;
  buttonTextColor: RgbColor;
  destructiveTextColor: RgbColor;
  headerBackgroundColor: RgbColor;
  hintColor: RgbColor;
  linkColor: RgbColor;
  secondaryBackgroundColor: RgbColor;
  sectionBackgroundColor: RgbColor;
  sectionHeaderTextColor: RgbColor;
  subtitleTextColor: RgbColor;
  textColor: RgbColor;
}

export interface MiniAppData {
  user: AdsUser;
  theme: MiniAppTheme;
}

export interface AdRequest {
  publisherKey: string;
  adType: AdType;
  device: OpenRTB25.Device;
  user: OpenRTB25.User;
  placement: AdPlacement;
  miniAppData: MiniAppData;
  debug?: {
    customPayload?: string;
    responseStub?: string;
  };
}

// Response

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
  size?: BannerSize;
}

export interface VideoCompanionContent {
  markup: string;
  size?: BannerSize;
}

export interface VideoAdContent {
  markup: string;
}

export interface Impression {
  id?: string;
  content?: string;
}

export interface TrackingEvent {
  event?: string;
  content?: string;
}

export interface VideoCreative {
  src: string;
  clickThrough: string;
  impressions?: Impression[];
  trackingEvents?: TrackingEvent[];
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
