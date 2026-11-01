import DatabaseConnection from "../database/DatabaseConnection";
import Invoice from "../../domain/Invoice";
import InvoiceRepository, { InvoiceData } from "../../application/repository/InvoiceRepository";

export default class InvoiceDatabaseRepository implements InvoiceRepository {

	constructor (readonly connection: DatabaseConnection) {
	}

	async replacePeriod(month: number, year: number, type: string, invoices: InvoiceData[]): Promise<void> {
		await this.connection.transaction(async function (t) {
			await t.query("delete from branas.invoice where month = $1 and year = $2 and type = $3", [month, year, type]);
			for (const invoice of invoices) {
				await t.query("insert into branas.invoice (id_contract, month, year, type, date, amount) values ($1, $2, $3, $4, $5, $6)", [invoice.idContract, month, year, type, invoice.date, invoice.amount]);
			}
		});
	}

	async listByPeriod(month: number, year: number, type: string): Promise<Invoice[]> {
		const invoices: Invoice[] = [];
		const invoicesData = await this.connection.query("select date, amount from branas.invoice where month = $1 and year = $2 and type = $3 order by date", [month, year, type]);
		for (const invoiceData of invoicesData) {
			invoices.push(new Invoice(invoiceData.date, parseFloat(invoiceData.amount)));
		}
		return invoices;
	}

}
