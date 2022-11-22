import {getConfig} from "./config";
import {EagleMqtt} from "./eagle-mqtt";

export async function main(args: Array<string>): Promise<void> {
	const config = await getConfig();

	new EagleMqtt(config, args);
}
