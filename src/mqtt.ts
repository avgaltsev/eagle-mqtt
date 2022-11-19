import {Client, connect, IPublishPacket} from "mqtt";

import {Logger, logMethodCallSignature} from "@somethings/logger";

import {MqttConfig} from "./config";

export type MessageCallback = (message: IPublishPacket) => void;

export class Mqtt extends Logger {
	private client: Client;

	public constructor(
		private config: MqttConfig,
	) {
		super();

		this.client = this.createClient();

		this.client;
	}

	@logMethodCallSignature()
	private createClient(): Client {
		this.logInfo("Creating client.");

		const client = connect(this.config.url, {
			username: this.config.username,
			password: this.config.password,
		});

		client.on("error", (error) => {
			this.logError("Error event triggered:", error);
		});

		client.on("connect", (packet) => {
			this.logInfo("Connected successfully.");
			this.logDebug("MQTT CONNACK message received:", packet);
		});

		return client;
	}

	@logMethodCallSignature()
	public publishMessage(topic: string, message: string): boolean {
		if (this.client.connected) {
			this.client.publish(`${this.config.topicPrefix}/${topic}`, message);
		}

		return this.client.connected;
	}
}
