export {};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: Element | null | undefined,
        options: {
          sitekey?: string;
          action?: string;
          callback?: (token: string) => void;
        },
      ) => string | undefined;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
  }
}
