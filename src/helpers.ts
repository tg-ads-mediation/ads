import {MiniAppUser, MiniAppTheme} from './client-server-protocol';

export function calcScreenDpi() {
  const element = document.createElement('div');
  element.style.width = '1in';
  document.body.appendChild(element);

  const dpi = element.offsetWidth * devicePixelRatio;

  element.remove();
  return dpi;
}

export function getUserData(): MiniAppUser {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    const {user} = window.Telegram.WebApp.initDataUnsafe;
    return {
      addedToAttachmentMenu: user.added_to_attachment_menu,
      allowsWriteToPm: user.allows_write_to_pm,
      firstName: user.first_name,
      id: user.id,
      isBot: user.is_bot,
      isPremium: user.is_premium,
      lastName: user.last_name,
      languageCode: user.language_code,
      photoUrl: user.photo_url,
      username: user.username
    };
  }

  if (window.tmajsLaunchData?.launchParams?.initData?.user) {
    return window.tmajsLaunchData.launchParams.initData.user;
  }

  throw new Error('Telegram Mini App platform is not detected.');
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
