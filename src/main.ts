// Main entry point for Vite
import './styles/main.scss'
import { WorkHubApp } from './app'

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new WorkHubApp()

    // Make app globally available for debugging
    if (import.meta.env.DEV) {
        ; (window as any).app = app
    }
})

// Hot Module Replacement (HMR) - only in development
if (import.meta.hot) {
    import.meta.hot.accept()
}