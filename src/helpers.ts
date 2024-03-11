import {AdsUser, MiniAppTheme} from './client-server-protocol';
import {idPrefix} from './client-server-protocol';

export function calcScreenDpi() {
  const element = document.createElement('div');
  element.style.width = '1in';
  document.body.appendChild(element);

  const dpi = element.offsetWidth * devicePixelRatio;

  element.remove();
  return dpi;
}

function generateStubId(): number {
  // 111 is a prefix to recognize stub ids from real ones
  return 1110000000000 + Math.floor(Math.random() * 9000000000) + 1000000000;
}

const initDataKey = idPrefix + 'init-data';

export function getUserData(): AdsUser {
  let data: AdsUser | null = null;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    const {user} = window.Telegram.WebApp.initDataUnsafe;

    data = {
      addedToAttachmentMenu: user.added_to_attachment_menu,
      allowsWriteToPm: user.allows_write_to_pm,
      firstName: user.first_name,
      id: user.id,
      isBot: user.is_bot,
      isPremium: user.is_premium,
      lastName: user.last_name,
      languageCode: user.language_code,
      photoUrl: user.photo_url,
      username: user.username,
      timeZone
    };
  } else if (window.tmajsLaunchData?.launchParams?.initData?.user) {
    data = {...window.tmajsLaunchData.launchParams.initData.user, timeZone};
  } else {
    // Opening an app via keyboard button leads there is no initData
    // In this case try to read the data from previous launches
    // It will be the data either with real data or with generated values
    const storedData = localStorage.getItem(initDataKey);
    data =
      storedData != null
        ? // todo check data from localStorage
          (JSON.parse(storedData) as AdsUser)
        : {
            firstName: 'Anonymous',
            id: generateStubId(),
            languageCode: navigator.language,
            timeZone
          };
  }

  localStorage.setItem(initDataKey, JSON.stringify(data));

  return data;
}

export function getThemeParams(): MiniAppTheme {
  if (window.Telegram?.WebApp?.themeParams) {
    const {themeParams} = window.Telegram.WebApp;
    return {
      accentTextColor: themeParams.accent_text_color,
      backgroundColor: themeParams.bg_color,
      buttonColor: themeParams.button_color,
      buttonTextColor: themeParams.button_text_color,
      destructiveTextColor: themeParams.destructive_text_color,
      headerBackgroundColor: themeParams.header_bg_color,
      hintColor: themeParams.hint_color,
      linkColor: themeParams.link_color,
      secondaryBackgroundColor: themeParams.secondary_bg_color,
      sectionBackgroundColor: themeParams.section_bg_color,
      sectionHeaderTextColor: themeParams.section_header_text_color,
      subtitleTextColor: themeParams.subtitle_text_color,
      textColor: themeParams.text_color
    };
  }

  if (window.tmajsLaunchData?.launchParams?.themeParams) {
    return window.tmajsLaunchData.launchParams.themeParams;
  }

  throw new Error('Telegram Mini App platform is not detected.');
}
