export default interface InvoiceRepository {
	replacePeriod (month: number, year: number, type: string, invoices: InvoiceData[]): Promise<void>;
}

export type InvoiceData = {
	idContract: string,
	date: Date,
	amount: number
}
