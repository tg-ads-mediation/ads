export interface AdEvents {
  onNotFound?: () => void;
  onOpen?: () => void;
  onReward?: () => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
}

export interface AdsParams {
  key: string;
  test?: boolean | string;
}

export interface AdsOriginalConstructor {
  new (params: AdsParams): AdsOriginal;
}

export interface AdsOriginal {
  showRewardedVideo(listeners?: AdEvents): Promise<boolean>;
  showBottomBanner(listeners?: AdEvents): Promise<boolean>;
  destroy(): void;
}

export interface AdsClass extends AdsOriginalConstructor, AdsOriginal {}
