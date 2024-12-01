declare namespace NodeJS {
  interface ProcessEnv {
    readonly WEATHER_API_URL: string;
    readonly WEATHER_API_KEY: string;
  }
}
