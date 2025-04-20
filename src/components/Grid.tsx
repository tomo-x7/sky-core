import { createContext, useContext, useMemo } from "react";

import type { ViewStyleProp } from "#/alf";

const Context = createContext({
	gap: 0,
});

export function Row({
	children,
	gap = 0,
	style,
}: ViewStyleProp & {
	children: React.ReactNode;
	gap?: number;
}) {
	return (
		<Context.Provider value={useMemo(() => ({ gap }), [gap])}>
			<div
				style={{
					flexDirection: "row",
					flex: 1,

					marginLeft: -gap / 2,
					marginRight: -gap / 2,

					...style,
				}}
			>
				{children}
			</div>
		</Context.Provider>
	);
}

export function Col({
	children,
	width = 1,
	style,
}: ViewStyleProp & {
	children: React.ReactNode;
	width?: number;
}) {
	const { gap } = useContext(Context);
	return (
		<div
			style={{
				flexDirection: "column",
				paddingLeft: gap / 2,
				paddingRight: gap / 2,
				width: `${width * 100}%`,
				...style,
			}}
		>
			{children}
		</div>
	);
}
