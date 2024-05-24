# @tg-ads-mediation/ads

## Demo

Check out the [demo bot](https://t.me/AdsInMiniAppsDemoBot) to see the ads in action.

## Requirements

You need to install either `https://telegram.org/js/telegram-web-app.js` or [tma.js](https://github.com/Telegram-Mini-Apps/tma.js) into your project to use the Mini App Platform and the ads library.

## Usage

### With NPM

The package is in the preview stage, so you can try the beta version:
`npm install --save @tg-ads-mediation/ads@beta`

After installation:

```typescript
import {Ads} from '@tg-ads-mediation/ads'

const ads = await Ads.create({
    key: 'your-access-key'
})

// methods return whether the ad was found and shown or not
// false means that no proper ad was found
const isVideoShown = await ads.showRewardedVideo()
const isBannerShown = await ads.showBottomBanner()
```

### With CDN

Load the library from the CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@tg-ads-mediation/ads-cdn@latest/dist/ads.js"></script>
```

Create an instance of the `tgadhub.Ads` class:

```javascript
window.addEventListener('load', () => {
  const ads = new tgadhub.Ads({
    key: 'your-access-key'
  })
})
```

To add TypeScript support, install the types:

```bash
npm install --save-dev @types/tg-ads-mediation__ads-cdn
```

### Development mode

In the development mode test environment and ads stubs are available:

```typescript
const ads = await Ads.create({
    key: 'your-access-key',
    // use the settings in dev mode
    test: {
      // use test server
      enabled: true,
      // `true` - use stubs to get ads every time
      // `false` - use real ads, production like
      stubs: true
    }
})
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
