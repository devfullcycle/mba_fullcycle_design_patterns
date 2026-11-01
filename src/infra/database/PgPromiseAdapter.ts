import DatabaseConnection from "./DatabaseConnection";
import pgp from "pg-promise";

export default class PgPromiseAdapter implements DatabaseConnection {
	connection: any;

	constructor () {
		this.connection = pgp()(process.env.DATABASE_URL ?? "postgres://postgres:123456@localhost:5432/app");
	}

	query(statement: string, params: any): Promise<any> {
		return this.connection.query(statement, params);
	}

	transaction(work: (connection: Pick<DatabaseConnection, "query">) => Promise<any>): Promise<any> {
		return this.connection.tx((t: any) => work(t));
	}

	close(): Promise<void> {
		return this.connection.$pool.end();
	}

}