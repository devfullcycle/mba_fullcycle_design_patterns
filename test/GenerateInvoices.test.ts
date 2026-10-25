import ContractDatabaseRepository from "../src/infra/repository/ContractDatabaseRepository";
import ContractRepository from "../src/application/repository/ContractRepository";
import DatabaseConnection from "../src/infra/database/DatabaseConnection";
import GenerateInvoices from "../src/application/usecase/GenerateInvoices";
import PgPromiseAdapter from "../src/infra/database/PgPromiseAdapter";
import DynamicPresenterFactory from "../src/infra/presenter/DynamicPresenterFactory";
import Mediator from "../src/infra/mediator/Mediator";
// integration
let generateInvoices: GenerateInvoices;
let connection: DatabaseConnection;
let contractRepository: ContractRepository;

beforeEach(() => {
	// const contractRepository: ContractRepository = {
	// 	async list (): Promise<any> {
	// 		return [
	// 			{
	// 				idContract: "",
	// 				description: "",
	// 				periods: 12,
	// 				amount: "6000",
	// 				date: new Date("2022-01-01T10:00:00"),
	// 				payments: [
	// 					{
	// 						idPayment: "",
	// 						idContract: "",
	// 						amount: 6000,
	// 						date: new Date("2022-01-05T10:00:00")
	// 					}
	// 				]
	// 			}
	// 		]
	// 	}
	// }
	connection = new PgPromiseAdapter();
	contractRepository = new ContractDatabaseRepository(connection);
	generateInvoices = new GenerateInvoices(contractRepository, new DynamicPresenterFactory(), new Mediator());
});

test("Deve gerar as notas fiscais por regime de caixa", async function () {
	const input = {
		month: 1,
		year: 2022,
		type: "cash"
	};
	const output = await generateInvoices.execute(input);
	expect(output.at(0)?.date).toEqual(new Date("2022-01-05T13:00:00Z"));
	expect(output.at(0)?.amount).toBe(6000);
});

test("Deve gerar as notas fiscais por regime de competência", async function () {
	const input = {
		month: 1,
		year: 2022,
		type: "accrual"
	};
	const output = await generateInvoices.execute(input);
	expect(output.at(0)?.date).toEqual(new Date("2022-01-01T13:00:00Z"));
	expect(output.at(0)?.amount).toBe(500);
});

test("Deve gerar as notas fiscais por regime de competência por csv", async function () {
	const input = {
		month: 1,
		year: 2022,
		type: "accrual",
		format: "csv"
	};
	const generateInvoices = new GenerateInvoices(contractRepository, new DynamicPresenterFactory(), new Mediator());
	const output = await generateInvoices.execute(input);
	expect(output).toBe("2022-01-01;500");
});

test("Deve gerar as notas fiscais por regime de competência", async function () {
	const input = {
		month: 2,
		year: 2022,
		type: "accrual"
	};
	const output = await generateInvoices.execute(input);
	expect(output.at(0)?.date).toEqual(new Date("2022-02-01T13:00:00Z"));
	expect(output.at(0)?.amount).toBe(500);
});

afterEach(async () => {
	connection.close();
});
