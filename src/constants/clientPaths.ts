const CLIENT_PATHS = {
  TOP: "/",
  SETTINGS: "/settings",
} as const;

const createRegexPaths = (paths: readonly string[]) => {
  return paths.map((path) => `${path.replace("[id]", "(.*)")}`);
};

export const AUTH_REQUIRED_PATHS_REGEX = createRegexPaths([
  CLIENT_PATHS.SETTINGS,
]);
