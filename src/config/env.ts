export type AppMode = 'demo' | 'production';

export const APP_MODE: AppMode = import.meta.env.VITE_APP_MODE === 'production' ? 'production' : 'demo';

export const IS_DEMO_MODE = APP_MODE === 'demo';

export const DEMO_PERSISTENCE = import.meta.env.VITE_DEMO_PERSISTENCE || 'session';

if (IS_DEMO_MODE) {
  console.warn('CHẾ ĐỘ DEMO SANDBOX ĐANG BẬT. Dữ liệu sẽ không được lưu lên Firebase production.');
}
