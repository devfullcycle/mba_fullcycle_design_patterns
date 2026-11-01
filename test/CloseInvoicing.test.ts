import CloseInvoicing from "../src/application/usecase/CloseInvoicing";
import Contract from "../src/domain/Contract";
import ContractDatabaseRepository from "../src/infra/repository/ContractDatabaseRepository";
import ContractRepository from "../src/application/repository/ContractRepository";
import DatabaseConnection from "../src/infra/database/DatabaseConnection";
import DynamicPresenterFactory from "../src/infra/presenter/DynamicPresenterFactory";
import InvoiceDatabaseRepository from "../src/infra/repository/InvoiceDatabaseRepository";
import InvoiceRepository from "../src/application/repository/InvoiceRepository";
import Mediator from "../src/infra/mediator/Mediator";
import PgPromiseAdapter from "../src/infra/database/PgPromiseAdapter";
// integration
let connection: DatabaseConnection;
let contractRepository: ContractRepository;
let invoiceRepository: InvoiceRepository;
let closeInvoicing: CloseInvoicing;

beforeEach(() => {
	connection = new PgPromiseAdapter();
	contractRepository = new ContractDatabaseRepository(connection);
	invoiceRepository = new InvoiceDatabaseRepository(connection);
	closeInvoicing = new CloseInvoicing(contractRepository, invoiceRepository, new DynamicPresenterFactory(), new Mediator());
});

test("Deve substituir o fechamento do período sem duplicar faturas", async function () {
	const input = {
		month: 1,
		year: 2022,
		type: "cash"
	};
	await closeInvoicing.execute(input);
	const firstClosing = await invoiceRepository.listByPeriod(1, 2022, "cash");
	await closeInvoicing.execute(input);
	const secondClosing = await invoiceRepository.listByPeriod(1, 2022, "cash");
	expect(firstClosing).toHaveLength(1);
	expect(secondClosing).toHaveLength(firstClosing.length);
});

test("Deve fechar o período respondendo em csv", async function () {
	const input = {
		month: 1,
		year: 2022,
		type: "cash",
		format: "csv"
	};
	const output = await closeInvoicing.execute(input);
	expect(output).toBe("2022-01-05;6000");
});

test("Deve desfazer todo o fechamento quando uma fatura do lote falha ao persistir", async function () {
	const input = {
		month: 2,
		year: 2022,
		type: "accrual"
	};
	await closeInvoicing.execute(input);
	const [contract] = await contractRepository.list();
	// the first invoice persists fine; the second violates the id_contract foreign key
	const failingContractRepository: ContractRepository = {
		async list (): Promise<Contract[]> {
			return [
				new Contract(contract.idContract, "", 12000, 12, new Date("2022-01-01T10:00:00")),
				new Contract("00000000-0000-0000-0000-000000000000", "", 6000, 12, new Date("2022-01-01T10:00:00"))
			];
		}
	};
	const failingCloseInvoicing = new CloseInvoicing(failingContractRepository, invoiceRepository, new DynamicPresenterFactory(), new Mediator());
	await expect(failingCloseInvoicing.execute(input)).rejects.toThrow();
	const invoices = await invoiceRepository.listByPeriod(2, 2022, "accrual");
	expect(invoices).toHaveLength(1);
	expect(invoices.at(0)?.date).toEqual(new Date("2022-02-01T13:00:00Z"));
	expect(invoices.at(0)?.amount).toBe(500);
});

afterEach(async () => {
	await connection.close();
});
