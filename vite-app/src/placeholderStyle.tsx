import { type PropsWithChildren, createContext, useCallback, useContext, useState } from "react";

type color = string;
type className = string;
type phStyleContext = { getClassName: (color: string) => string; styles: Record<color, className> };
const Context = createContext<phStyleContext>({
	getClassName: () => {
		throw new Error("style context provider not found");
	},
	styles: {},
});
export function Provider({ children }: PropsWithChildren) {
	const [styles, setStyles] = useState<Record<color, className>>({});

	const getClassName = useCallback(
		(color: string) => {
			if (styles[color]) return styles[color];
			const className = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(6))));
			setStyles((prev) => {
				if (prev[color]) return prev;
				return { ...prev, [color]: className };
			});
			return className;
		},
		[styles],
	);
	return (
		<Context.Provider value={{ getClassName, styles }}>
			{children}
			<Root />
		</Context.Provider>
	);
}

function Root() {
	const ctx = useContext(Context);
	return Object.entries(ctx.styles).map(([color, className]) => (
		<style key={color + className}>{`.${className}::placeholder{color:${color}}`}</style>
	));
}

export function usePlaceholderStyle(style: string) {
	const ctx = useContext(Context);
	return ctx.getClassName(style);
}
