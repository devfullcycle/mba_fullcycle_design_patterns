import InvoiceRepository from "../repository/InvoiceRepository";
import PresenterFactory from "../presenter/PresenterFactory";
import Usecase from "./Usecase";
import { Output } from "./GenerateInvoices";

export default class GetInvoices implements Usecase {

	constructor (
		readonly invoiceRepository: InvoiceRepository,
		readonly presenterFactory: PresenterFactory
	) {
	}

	async execute (input: Input): Promise<any> {
		const presenter = this.presenterFactory.create(input.format);
		const output: Output[] = [];
		const invoices = await this.invoiceRepository.listByPeriod(input.month, input.year, input.type);
		for (const invoice of invoices) {
			output.push({ date: invoice.date, amount: invoice.amount });
		}
		return presenter.present(output);
	}
}

type Input = {
	month: number,
	year: number,
	type: string,
	format?: string
}
