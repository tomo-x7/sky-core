interface AlertStatic {
	alert: (title: string, message?: string, buttons?: AlertButton[], options?: AlertOptions) => void;
}
interface AlertOptions {
	userInterfaceStyle?: "unspecified" | "light" | "dark" | undefined;
}
interface AlertButton {
	text?: string | undefined;
	onPress?: ((value?: string) => void) | undefined;
	isPreferred?: boolean | undefined;
	style?: "default" | "cancel" | "destructive" | undefined;
}
class WebAlert implements Pick<AlertStatic, "alert"> {
	public alert(title: string, message?: string, buttons?: AlertButton[]): void {
		if (buttons === undefined || buttons.length === 0) {
			window.alert([title, message].filter(Boolean).join("\n"));
			return;
		}

		const result = window.confirm([title, message].filter(Boolean).join("\n"));

		if (result === true) {
			const confirm = buttons.find(({ style }) => style !== "cancel");
			confirm?.onPress?.();
			return;
		}

		const cancel = buttons.find(({ style }) => style === "cancel");
		cancel?.onPress?.();
	}
}

export const Alert = new WebAlert();
