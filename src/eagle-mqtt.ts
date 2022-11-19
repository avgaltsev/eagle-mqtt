import {Logger, logMethodCallSignature} from "@somethings/logger";

import {Config} from "./config";
import {isBatch, isCurrentSummationReport, isInstantaneousDemandReport, MaybeBatch} from "./eagle";
import {Http} from "./http";
import {Mqtt} from "./mqtt";

function toKebabCase(value: string): string {
	return value.replace(/(.)([A-Z])/g, "$1_$2").toLowerCase();
}

export class EagleMqtt extends Logger {
	private http: Http;
	private mqtt: Mqtt;

	public constructor(
		private config: Config,
	) {
		super();

		this.logWarning("EagleMqtt started. Creating HTTP and MQTT instances.");

		this.http = new Http(this.config.http, (timestamp, batch) => {
			return this.processBatch(timestamp, batch);
		});

		this.mqtt = new Mqtt(this.config.mqtt);

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
}
