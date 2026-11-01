import ContractDatabaseRepository from "./infra/repository/ContractDatabaseRepository";
import ExpressAdapter from "./infra/http/ExpressAdapter";
import GenerateInvoices from "./application/usecase/GenerateInvoices";
import DynamicPresenterFactory from "./infra/presenter/DynamicPresenterFactory";
import LoggerDecorator from "./application/decorator/LoggerDecorator";
import MainController from "./infra/http/MainController";
import PgPromiseAdapter from "./infra/database/PgPromiseAdapter";
import Mediator from "./infra/mediator/Mediator";
import SendEmail from "./application/usecase/SendEmail";
import InvoiceDatabaseRepository from "./infra/repository/InvoiceDatabaseRepository";
import CloseInvoicing from "./application/usecase/CloseInvoicing";
import CloseInvoicingController from "./infra/http/CloseInvoicingController";
import GetInvoices from "./application/usecase/GetInvoices";
import GetInvoicesController from "./infra/http/GetInvoicesController";

const connection = new PgPromiseAdapter();
const contractRepository = new ContractDatabaseRepository(connection);
const invoiceRepository = new InvoiceDatabaseRepository(connection);
const presenterFactory = new DynamicPresenterFactory();
const mediator = new Mediator();
const sendEmail = new SendEmail();
mediator.on("InvoicesGenerated", async function (data: any) {
	await sendEmail.execute(data);
});
mediator.on("InvoicesClosed", async function (data: any) {
	await sendEmail.execute(data);
});
const generateInvoices = new LoggerDecorator(new GenerateInvoices(contractRepository, presenterFactory, mediator));
const closeInvoicing = new LoggerDecorator(new CloseInvoicing(contractRepository, invoiceRepository, presenterFactory, mediator));
const getInvoices = new GetInvoices(invoiceRepository, presenterFactory);
const httpServer = new ExpressAdapter();
new MainController(httpServer, generateInvoices);
new CloseInvoicingController(httpServer, closeInvoicing);
new GetInvoicesController(httpServer, getInvoices);
httpServer.listen(3000);
