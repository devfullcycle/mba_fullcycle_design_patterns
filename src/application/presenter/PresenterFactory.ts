import Presenter from "./Presenter";

export default interface PresenterFactory {
	create (format?: string): Presenter;
}
