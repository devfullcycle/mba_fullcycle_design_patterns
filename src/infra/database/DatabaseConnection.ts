export default interface DatabaseConnection {
	query (statement: string, params: any): Promise<any>;
	transaction (work: (connection: Pick<DatabaseConnection, "query">) => Promise<any>): Promise<any>;
	close (): Promise<void>;
}
