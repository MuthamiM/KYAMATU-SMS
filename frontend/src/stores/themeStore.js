import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light', // 'light', 'dark', 'system'
      
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      
      initTheme: () => {
        const theme = get().theme;
        applyTheme(theme);
      },
    }),
    {
      name: 'kyamatu-theme',
    }
  )
);

function applyTheme(theme) {
  const root = window.document.documentElement;
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.remove('light', 'dark');
    root.classList.add(systemTheme);
  } else {
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const store = useThemeStore.getState();
    if (store.theme === 'system') {
      applyTheme('system');
    }
  });
}
