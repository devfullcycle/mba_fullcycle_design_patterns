import Invoice from "../../domain/Invoice";

export default interface InvoiceRepository {
	replacePeriod (month: number, year: number, type: string, invoices: InvoiceData[]): Promise<void>;
	listByPeriod (month: number, year: number, type: string): Promise<Invoice[]>;
}

export type InvoiceData = {
	idContract: string,
	date: Date,
	amount: number
}
