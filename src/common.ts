import process from "node:process";

export const cwd = new URL(`file://${process.cwd()}/`);

export const CONFIG_LOC = new URL("vervo.config.ts", cwd);
