import CsvPresenter from "../src/infra/presenter/CsvPresenter";
import DynamicPresenterFactory from "../src/infra/presenter/DynamicPresenterFactory";
import JsonPresenter from "../src/infra/presenter/JsonPresenter";
// unit
test("Deve criar o JsonPresenter para o formato json", function () {
	const presenterFactory = new DynamicPresenterFactory();
	expect(presenterFactory.create("json")).toBeInstanceOf(JsonPresenter);
});

test("Deve criar o JsonPresenter quando o formato não for informado", function () {
	const presenterFactory = new DynamicPresenterFactory();
	expect(presenterFactory.create()).toBeInstanceOf(JsonPresenter);
});

test("Deve criar o CsvPresenter para o formato csv", function () {
	const presenterFactory = new DynamicPresenterFactory();
	expect(presenterFactory.create("csv")).toBeInstanceOf(CsvPresenter);
});

test("Deve lançar erro para formato desconhecido", function () {
	const presenterFactory = new DynamicPresenterFactory();
	expect(() => presenterFactory.create("xml")).toThrow(new Error("Invalid format"));
});
