# @tg-ads-mediation/ads

## Installation

The package is in the early preview stage, so you can try the alpha version:

`npm install --save @tg-ads-mediation/ads@alpha`

## Usage

```typescript
import {Ads} from '@tg-ads-mediation/ads';

const ads = new Ads({
    userId: window.Telegram.WebApp.initData.user.id,
    language: window.Telegram.WebApp.initData.user.language_code,
});

// show methods return whether the ad was found and shown or not
const isVideoFound = await ads.showRewardedVideo();
const isBannerFound = await ads.showBottomBanner();
```
