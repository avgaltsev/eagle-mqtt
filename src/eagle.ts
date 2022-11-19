export interface InstantaneousDemandData {
	demand: number;
	units: string;
}

export type MaybeInstantaneousDemandData = Partial<InstantaneousDemandData>;

export function isInstantaneousDemandData(value: MaybeInstantaneousDemandData): value is InstantaneousDemandData {
	return typeof value.demand === "number" &&
		typeof value.units === "string";
}

export interface CurrentSummationData {
	summationDelivered: number;
	summationReceived: number;
	units: string;
}

export type MaybeCurrentSummationData = Partial<CurrentSummationData>;

export function isCurrentSummationData(value: MaybeCurrentSummationData): value is CurrentSummationData {
	return typeof value.summationDelivered === "number" &&
		typeof value.summationReceived === "number" &&
		typeof value.units === "string";
}

export type Data = InstantaneousDemandData | CurrentSummationData;

export interface AbstractReport {
	timestamp: string;
	subdeviceGuid: string;
	componentId: string;
	dataType: string;
}

export interface InstantaneousDemandReport extends AbstractReport {
	dataType: "InstantaneousDemand";
	data: InstantaneousDemandData;
}

export interface CurrentSummationReport extends AbstractReport {
	dataType: "CurrentSummation";
	data: CurrentSummationData;
}

export type Report = InstantaneousDemandReport | CurrentSummationReport;

export type MaybeReport = Partial<Report>;

export function isReport(value: MaybeReport): value is Report {
	return typeof value.timestamp === "string" &&
		typeof value.subdeviceGuid === "string" &&
		typeof value.componentId === "string" &&
		typeof value.dataType === "string";
}

export function isInstantaneousDemandReport(value: MaybeReport): value is InstantaneousDemandReport {
	return isReport(value) &&
		value.dataType === "InstantaneousDemand" &&
		isInstantaneousDemandData(value.data);
}

export function isCurrentSummationReport(value: MaybeReport): value is CurrentSummationReport {
	return isReport(value) &&
		value.dataType === "CurrentSummation" &&
		isCurrentSummationData(value.data);
}

export interface Batch {
	timestamp: string;
	deviceGuid: string;
	body: Array<MaybeReport>;
}

export type MaybeBatch = Partial<Batch>;

export function isBatch(value: MaybeBatch): value is Batch {
	return typeof value.timestamp === "string" &&
		typeof value.deviceGuid === "string" &&
		Array.isArray(value.body);
}
