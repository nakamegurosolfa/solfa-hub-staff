/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_*: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    NOTION_TOKEN?: string;
    NOTION_PAGE_ID?: string;
    NOTION_COCKTAIL_DATABASE_ID?: string;
    NOTION_MANUAL_DATABASE_ID?: string;
    NOTION_EMPLOYEE_WORK_DATABASE_ID?: string;
    NOTION_LOST_ITEMS_DATABASE_ID?: string;
    NOTION_BREAKS_DATABASE_ID?: string;
    APP_ACCESS_PASSWORD_HASH?: string;
    EMPLOYEE_ACCESS_PASSWORD_HASH?: string;
    SESSION_SECRET?: string;
    APP_AUTH_VERSION?: string;
    EMPLOYEE_AUTH_VERSION?: string;
    RESEND_API_KEY?: string;
    RESEND_FROM?: string;
    BREAK_REPORT_TO?: string;
    BREAK_ADMIN_PASSWORD?: string;
  }
}

export {};
