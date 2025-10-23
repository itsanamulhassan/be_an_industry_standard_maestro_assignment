import { createDefaultPreset } from "ts-jest";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  setupFilesAfterEnv: ["./src/jest.setup.ts"],
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.tests.ts"],
};
