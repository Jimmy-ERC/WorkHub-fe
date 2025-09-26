/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly DEV: boolean
    readonly MODE: string
    readonly BASE_URL: string
    readonly PROD: boolean
    readonly SSR: boolean
}

interface ImportMeta {
    readonly env: ImportMetaEnv
    readonly hot?: {
        readonly data: any
        accept(): void
        accept(cb: (mod: any) => void): void
        accept(dep: string, cb: (mod: any) => void): void
        accept(deps: readonly string[], cb: (mods: any[]) => void): void
        dispose(cb: (data: any) => void): void
        decline(): void
        invalidate(): void
        on(event: string, cb: (...args: any[]) => void): void
    }
}