// COPY CODE

import dotenv from "dotenv";
import { CONFIG_KEYS, REQUIRED_CONFIG_KEYS } from "./constant.js";
import type { IAppConfiguration } from "./config.interface.js";

dotenv.config({ quiet: true });

export class ConfigurationFactory {
    private static instance: ConfigurationFactory | null = null;
    private readonly config: IAppConfiguration;

    private constructor() {
        this.config = this.buildConfiguration();
    }

    public static getInstance(): ConfigurationFactory {
        if (!this.instance) {
            this.instance = new ConfigurationFactory();
        }
        return this.instance;
    }

    public static get<K extends keyof IAppConfiguration>(key: K): IAppConfiguration[K] {
        return this.getInstance().config[key];
    }

    private buildConfiguration(): IAppConfiguration {
        const config: Record<string, string> = {};

        for (const key of CONFIG_KEYS) {
            const value = process.env[key];
            if (value) {
                config[key] = value;
            }
        }

        this.assertRequiredKeys(config);

        return config as unknown as IAppConfiguration;
    }

    private assertRequiredKeys(config: Record<string, string>): void {
        const missing = REQUIRED_CONFIG_KEYS.filter((key) => !config[key]);
        if (missing.length > 0) {
            throw new Error(`Missing required configuration key(s): ${missing.join(", ")}. Check your .env file.`);
        }
    }

    public static reset(): void {
        this.instance = null;
    }
}
