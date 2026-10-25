import CsvPresenter from "./CsvPresenter";
import JsonPresenter from "./JsonPresenter";

export default class DynamicPresenterFactory {

	create (format?: string) {
		if (format === undefined || format === "json") {
			return new JsonPresenter();
		}
		if (format === "csv") {
			return new CsvPresenter();
		}
		throw new Error("Invalid format");
	}
}
