import axios from "axios";

test("Deve fechar o faturamento pela api e consultar as faturas fechadas", async function () {
	const input = {
		month: 1,
		year: 2022,
		type: "accrual"
	};
	const closeResponse = await axios.post("http://localhost:3000/close_invoicing", input);
	expect(closeResponse.data).toEqual([{ date: "2022-01-01T13:00:00.000Z", amount: 500 }]);
	const getResponse = await axios.get("http://localhost:3000/invoices", { params: { month: 1, year: 2022, type: "accrual" } });
	expect(getResponse.data).toEqual([{ date: "2022-01-01T13:00:00.000Z", amount: 500 }]);
});
