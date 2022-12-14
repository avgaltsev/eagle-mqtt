import * as path from "path";
import {readFile} from "fs/promises";

import {mergeConfigs} from "@somethings/config";

import * as defaultConfig from "./json/default-config.json";

export type Config = typeof defaultConfig;
export type HttpConfig = typeof defaultConfig.http;
export type MqttConfig = typeof defaultConfig.mqtt;

const CONFIG_PATH = path.resolve(__dirname, "../config/config.json");

export async function getConfig(): Promise<Config> {
	const rawConfig = await readFile(CONFIG_PATH, {encoding: "utf8"});

	return mergeConfigs(defaultConfig, JSON.parse(rawConfig));
}
