export const preset = "ts-jest";
export const testEnvironment = "node";
export const extensionsToTreatAsEsm = [".ts"];
export const moduleNameMapper = {
  "^(\\.{1,2}/.*)\\.js$": "$1",
};
export const transform = {
  "^.+\\.tsx?$": [
    "ts-jest",
    {
      useESM: true,
    },
  ],
};
