import {OpenRTB25} from '@clearcodehq/openrtb';

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
  user: MiniAppUser;
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
