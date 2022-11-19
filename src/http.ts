import * as express from "express";
import {Express} from "express";

import {Logger, logMethodCallSignature} from "@somethings/logger";

import {HttpConfig} from "./config";
import {MaybeBatch} from "./eagle";

export type RequestCallback = (timestamp: number, batch: MaybeBatch) => boolean;

export class Http extends Logger {
	private server: Express;

	public constructor(
		private config: HttpConfig,
		private requestCallback: RequestCallback,
	) {
		super();

		this.server = this.createServer();

		this.server;
	}

	@logMethodCallSignature()
	private createServer(): Express {
		const server = express();

		server.use(express.json());

		server.post(this.config.path, (request, response) => {
			const timestamp = Math.floor(Date.now() / 1000);
			const body = request.body as MaybeBatch;

			this.logDebug("Request received:", body);

			const acknowledgeReception = this.requestCallback(timestamp, body);

			if (acknowledgeReception) {
				this.logDebug("Request was processed.");

				response.status(200).end();
			} else {
				this.logError("Request was not processed.");

				response.status(400).end();
			}
		});

		this.logInfo("Start listening, port number:", this.config.port);

		server.listen(this.config.port);

		return server;
	}
}
