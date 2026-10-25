export default interface Mediator {
	publish (event: string, data: any): Promise<void>;
}
