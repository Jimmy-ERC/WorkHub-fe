// Main application entry point
export class WorkHubApp {
    private appName: string = 'WorkHub';
    private version: string = '1.0.0';

    constructor() {
        console.log(`${this.appName} v${this.version} initialized`);
        this.init();
    }

    private init(): void {
        // Initialize the application
        this.setupEventListeners();
        this.loadInitialData();
    }

    private setupEventListeners(): void {
        // Setup DOM event listeners
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM fully loaded');
        });
    }

    private loadInitialData(): void {
        // Load any initial data needed
        console.log('Loading initial application data...');
    }

    public getAppInfo(): { name: string; version: string } {
        return {
            name: this.appName,
            version: this.version
        };
    }
}

// Auto-initialize the app when the script loads
const app = new WorkHubApp();