# @tg-ads-mediation/ads

## Demo

Check out the [demo](https://t.me/AdsInMiniAppsDemoBot/DemoApp) app to see the ads in action.

## Installation

The package is in the early preview stage, so you can try the alpha version:

`npm install --save @tg-ads-mediation/ads@alpha`

## Requirements

You need to install either `https://telegram.org/js/telegram-web-app.js` or [tma.js](https://github.com/Telegram-Mini-Apps/tma.js) into your project to use the Mini App Platform and the ads library.

## Usage

```typescript
import {Ads} from '@tg-ads-mediation/ads'

const ads = new Ads({
    key: 'your-access-key',
    // for dev mode or testing
    test: true
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
    onReward: () => console.info('got a reward'),
    onClose: () => console.info('ad closed'),
    onError: (error) => console.error('ad error', error)
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
