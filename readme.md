# @tg-ads-mediation/ads

## Installation

The package is in the early preview stage, so you can try the alpha version:

`npm install --save @tg-ads-mediation/ads@alpha`

## Usage

```typescript
import {Ads} from '@tg-ads-mediation/ads'

const ads = new Ads({
    key: 'your-access-key',
    userId: window.Telegram.WebApp.initData.user.id,
    language: window.Telegram.WebApp.initData.user.language_code
})

// methods return whether the ad was found and shown or not
// false means that no proper ad was found
const isVideoShown = await ads.showRewardedVideo()
const isBannerShown = await ads.showBottomBanner()
```

## Handling events

```typescript
// open and close callbacks
ads.showRewardedVideo({
    onNotFound: () => console.info('no ad found'),
    onOpen: () => console.info('ad opened'),
    onClose: () => console.info('ad closed')
})

// open and not found as a promise result, close as a callback
const isVideoOpen = await ads.showRewardedVideo({
    onClose: () => console.info('ad closed')
})
```


# Destroying

In case the ad instance is not needed anymore, it should be destroyed. The method unsubscribes from all the events and removes all the listeners.

```typescript
ads.destroy()
```
