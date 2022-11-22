import {readFile} from "fs/promises";

import {Logger, logMethodCallSignature} from "@somethings/logger";

import {Config} from "./config";
import {isBatch, isCurrentSummationReport, isInstantaneousDemandReport, MaybeBatch} from "./eagle";
import {Http} from "./http";
import {Mqtt} from "./mqtt";

function toKebabCase(value: string): string {
	return value.replace(/(.)([A-Z])/g, "$1_$2").toLowerCase();
}

export class EagleMqtt extends Logger {
	private http: Http | null = null;
	private mqtt: Mqtt;

	public constructor(
		private config: Config,
		private inputPaths?: Array<string>,
	) {
		super();

		this.logInfo("EagleMqtt started. Creating MQTT instance.");

		this.mqtt = new Mqtt(this.config.mqtt);

		if (this.config.httpEnabled) {
			this.logInfo("Creating HTTP instance.");

			this.http = new Http(this.config.http, (timestamp, batch) => {
				return this.processBatch(timestamp, batch);
			});
		} else {
			this.logInfo("HTTP is disabled.");

			setTimeout(() => {
				if (this.inputPaths !== undefined && this.inputPaths.length > 0) {
					this.logInfo("Input file list is provided, processing saved requests.");

					this.inputPaths.forEach((path) => {
						this.processFile(path);
					});
				}
			}, 3000);
		}

		this.http;
	}

	@logMethodCallSignature()
	private processBatch(timestamp: number, batch: MaybeBatch): boolean {
		if (!isBatch(batch)) {
			this.logError("Batch received but it's not a batch:", batch);

			return false;
		}

		const batchTimestamp = Math.round(parseInt(batch.timestamp, 10) / 1000);

		const isEverythingSaved = batch.body.every((report) => {
			if (!isInstantaneousDemandReport(report) && !isCurrentSummationReport(report)) {
				this.logInfo("Report received but it's not a supported report:", report.dataType);
				this.logDebug("Unsupported report:", report);

				return true;
			}

			const reportTimestamp = Math.round(parseInt(report.timestamp, 10) / 1000);

			const reportType = toKebabCase(report.dataType);

			const data = Object.entries(report.data).reduce((result, [name, value]) => {
				result[toKebabCase(name)] = value;

				return result;
			}, {} as Record<string, number | string>);

			const message = {
				["report_type"]: reportType,
				["timestamp"]: reportTimestamp,
				["timestamp_delta"]: timestamp - reportTimestamp,
				["batch_timestamp_delta"]: timestamp - batchTimestamp,
				["data"]: data,
				["tags"]: {
					["device_guid"]: batch.deviceGuid,
					["subdevice_guid"]: report.subdeviceGuid,
					["component_id"]: report.componentId,
				},
			};

			return this.mqtt.publishMessage(reportType, JSON.stringify(message));
		});

		return isEverythingSaved;
	}

	@logMethodCallSignature()
	private async processFile(path: string): Promise<void> {
		const fileContent = await readFile(path);
		const fileLines = fileContent.toString().split("\n");

		fileLines.forEach((fileLine) => {
			const [timestampString, batchString] = fileLine.split(/(?<=^\d+)\s(?=\{)/);

			if (timestampString === undefined || batchString === undefined) {
				return;
			}

			const timestamp = Math.round(parseInt(timestampString, 10) / 1000);
			const batch = JSON.parse(batchString);

			this.processBatch(timestamp, batch);
		});
	}
}
