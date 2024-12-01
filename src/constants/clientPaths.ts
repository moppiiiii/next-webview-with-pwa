export const CLIENT_PATHS = {
  TOP: "/",
  SETTINGS: "/settings",
  BAD_REQUEST: "/400",
} as const;

const createRegexPaths = (paths: readonly string[]) => {
  return paths.map((path) => `${path.replace("[id]", "(.*)")}`);
};

export const AUTH_REQUIRED_PATHS_REGEX = createRegexPaths([
  CLIENT_PATHS.SETTINGS,
]);
