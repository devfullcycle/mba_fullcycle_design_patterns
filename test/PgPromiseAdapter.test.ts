import DatabaseConnection from "../src/infra/database/DatabaseConnection";
import PgPromiseAdapter from "../src/infra/database/PgPromiseAdapter";
// integration
let connection: DatabaseConnection;

beforeEach(() => {
	connection = new PgPromiseAdapter();
});

test("Deve confirmar todas as queries da transação", async function () {
	await connection.transaction(async function (t) {
		await t.query("insert into branas.contract (description, amount, periods, date) values ($1, 100, 1, now())", ["transaction-commit"]);
	});
	const [row] = await connection.query("select count(*)::int as count from branas.contract where description = $1", ["transaction-commit"]);
	expect(row.count).toBe(1);
	await connection.query("delete from branas.contract where description = $1", ["transaction-commit"]);
});

test("Deve desfazer todas as queries da transação quando uma delas falha", async function () {
	const work = connection.transaction(async function (t) {
		await t.query("insert into branas.contract (description, amount, periods, date) values ($1, 100, 1, now())", ["transaction-rollback"]);
		await t.query("insert into branas.payment (id_contract, amount, date) values ('00000000-0000-0000-0000-000000000000', 100, now())", []);
	});
	await expect(work).rejects.toThrow();
	const [row] = await connection.query("select count(*)::int as count from branas.contract where description = $1", ["transaction-rollback"]);
	expect(row.count).toBe(0);
});

afterEach(async () => {
	await connection.close();
});
