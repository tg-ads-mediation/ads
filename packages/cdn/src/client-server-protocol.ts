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
  generatedId?: number;
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
  stubAds?: boolean;
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
  ad: BannerAdContent;
}

export interface VideoAdResponse {
  type: 'video';
  id: string;
  ad: VideoAdContent;
}

export type AdResponse = BannerAdResponse | VideoAdResponse;

export type StatsAction = 'view' | 'click';

export interface PlaybackEvents {
  impression?: string[];
  start?: string[];
  firstQuartile?: string[];
  midpoint?: string[];
  thirdQuartile?: string[];
  complete?: string[];
  skip?: string[];
  // todo try to not use it
  [key: string]: string[] | undefined;
}

export interface StatsRequest {
  requestId: string;
  view?: string[];
  click?: string[];
  reward?: string[];
  playback?: PlaybackEvents;
}
