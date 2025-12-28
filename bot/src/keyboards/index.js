import { Markup } from 'telegraf';
import { t } from '../i18n/index.js';

// ============ PHONE REQUEST ============
export const phoneKeyboard = () => Markup.keyboard([
  [Markup.button.contactRequest(t('share_phone'))]
]).resize().oneTime();

// ============ REGISTER BUTTON ============
export const registerKeyboard = () => Markup.inlineKeyboard([
  [Markup.button.callback(t('btn_register'), 'register:start')]
]);

// ============ MAIN MENU ============
export const mainMenuKeyboard = () => Markup.inlineKeyboard([
  [Markup.button.callback(t('btn_today_menu'), 'menu:today')],
  [Markup.button.callback(t('btn_my_child'), 'child:info')],
  [
    Markup.button.callback(t('btn_attendance'), 'child:attendance'),
    Markup.button.callback(t('btn_payments'), 'child:payments')
  ],
  [Markup.button.callback(t('btn_daily_report'), 'child:report')],
  [
    Markup.button.callback(t('btn_settings'), 'settings:main'),
    Markup.button.callback(t('btn_contact'), 'contact:info')
  ]
]);

// ============ CONFIRM/CANCEL ============
export const confirmKeyboard = () => Markup.inlineKeyboard([
  [
    Markup.button.callback(t('btn_confirm'), 'register:confirm'),
    Markup.button.callback(t('btn_cancel'), 'register:cancel')
  ]
]);

// ============ BACK BUTTON ============
export const backKeyboard = (action = 'back:main') => Markup.inlineKeyboard([
  [Markup.button.callback(t('btn_back'), action)]
]);

// ============ SETTINGS MENU ============
export const settingsKeyboard = () => Markup.inlineKeyboard([
  [Markup.button.callback(t('btn_edit_info'), 'settings:edit')],
  [Markup.button.callback(t('btn_notifications'), 'settings:notifications')],
  [Markup.button.callback(t('btn_back'), 'back:main')]
]);

// ============ SKIP BUTTON (for optional fields) ============
export const skipKeyboard = () => Markup.inlineKeyboard([
  [Markup.button.callback('⏭️ O\'tkazib yuborish', 'register:skip')]
]);

// Remove keyboard
export const removeKeyboard = () => Markup.removeKeyboard();

export default {
  phoneKeyboard,
  registerKeyboard,
  mainMenuKeyboard,
  confirmKeyboard,
  backKeyboard,
  settingsKeyboard,
  skipKeyboard,
  removeKeyboard
};
