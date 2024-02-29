import {RgbColor, MiniAppTheme, MiniAppUser} from './client-server-protocol';

// https://core.telegram.org/bots/webapps#webappuser
export interface UserTgScript {
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  first_name: string;
  id: number;
  is_bot?: boolean;
  is_premium?: boolean;
  last_name?: string;
  language_code?: string;
  photo_url?: string;
  username?: string;
}

// https://core.telegram.org/bots/webapps#themeparams
export interface ThemeTgScript {
  accent_text_color: RgbColor;
  bg_color: RgbColor;
  button_color: RgbColor;
  button_text_color: RgbColor;
  destructive_text_color: RgbColor;
  header_bg_color: RgbColor;
  hint_color: RgbColor;
  link_color: RgbColor;
  secondary_bg_color: RgbColor;
  section_bg_color: RgbColor;
  section_header_text_color: RgbColor;
  subtitle_text_color: RgbColor;
  text_color: RgbColor;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          user: UserTgScript;
        };
        themeParams?: ThemeTgScript;
      };
    };
    tmajsLaunchData?: {
      launchParams?: {
        initData?: {
          user?: MiniAppUser;
        };
        themeParams?: MiniAppTheme;
      };
    };
  }
}

export {};
