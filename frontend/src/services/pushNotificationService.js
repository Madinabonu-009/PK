// Web Push Notification Service
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

class PushNotificationService {
  constructor() {
    this.swRegistration = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Service Worker ro'yxatdan o'tkazish
  async registerServiceWorker() {
    if (!this.isSupported) {
      return null;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      return this.swRegistration;
    } catch (error) {
      return null;
    }
  }

  // Ruxsat so'rash
  async requestPermission() {
    if (!this.isSupported) return 'unsupported';

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Push subscription olish
  async subscribeToPush() {
    if (!this.swRegistration) {
      await this.registerServiceWorker();
    }

    if (!this.swRegistration) return null;

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      
      // Backend ga yuborish
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      return null;
    }
  }

  // Subscription ni serverga yuborish
  async sendSubscriptionToServer(subscription) {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Unsubscribe
  async unsubscribe() {
    if (!this.swRegistration) return false;

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Subscription holatini tekshirish
  async getSubscriptionStatus() {
    if (!this.swRegistration) {
      await this.registerServiceWorker();
    }

    if (!this.swRegistration) return { supported: false };

    const subscription = await this.swRegistration.pushManager.getSubscription();
    return {
      supported: true,
      permission: Notification.permission,
      subscribed: !!subscription
    };
  }

  // Local notification ko'rsatish
  showLocalNotification(title, options = {}) {
    if (Notification.permission !== 'granted') return;

    const defaultOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      tag: 'play-kids-notification',
      renotify: true,
      ...options
    };

    if (this.swRegistration) {
      this.swRegistration.showNotification(title, defaultOptions);
    } else {
      new Notification(title, defaultOptions);
    }
  }

  // VAPID key ni Uint8Array ga o'girish
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const pushService = new PushNotificationService();
export default pushService;
