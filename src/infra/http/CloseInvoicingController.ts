import HttpServer from "./HttpServer";
import Usecase from "../../application/usecase/Usecase";

export default class CloseInvoicingController {

	constructor (readonly httpServer: HttpServer, readonly usecase: Usecase) {
		httpServer.on("post", "/close_invoicing", async function (params: any, body: any, headers: any) {
			const input = body;
			body.userAgent = headers["user-agent"];
			body.host = headers.host;
			const output = await usecase.execute(input);
			return output;
		});
	}
}
