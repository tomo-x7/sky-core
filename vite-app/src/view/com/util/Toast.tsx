/*
 * Note: the dataSet properties are used to leverage custom CSS in public/index.html
 */

import { FontAwesomeIcon, type Props as FontAwesomeProps } from "@fortawesome/react-fontawesome";
import type React from "react";
import { useEffect, useState } from "react";

const DURATION = 3500;

interface ActiveToast {
	text: string;
	icon: FontAwesomeProps["icon"];
}
type GlobalSetActiveToast = (_activeToast: ActiveToast | undefined) => void;

// globals
// =
let globalSetActiveToast: GlobalSetActiveToast | undefined;
let toastTimeout: ReturnType<typeof setTimeout> | undefined;

// components
// =
type ToastContainerProps = {};
export const ToastContainer: React.FC<ToastContainerProps> = () => {
	const [activeToast, setActiveToast] = useState<ActiveToast | undefined>();
	useEffect(() => {
		globalSetActiveToast = (t: ActiveToast | undefined) => {
			setActiveToast(t);
		};
	});
	return (
		<>
			{activeToast && (
				<div style={styles.container}>
					{/* @ts-expect-error */}
					<FontAwesomeIcon icon={activeToast.icon} size={20} style={styles.icon} />
					<span style={styles.text}>{activeToast.text}</span>
					<button
						type="button"
						style={styles.dismissBackdrop}
						onClick={() => {
							setActiveToast(undefined);
						}}
					/>
				</div>
			)}
		</>
	);
};

// methods
// =

export function show(text: string, icon: FontAwesomeProps["icon"] = "check") {
	if (toastTimeout) {
		clearTimeout(toastTimeout);
	}
	globalSetActiveToast?.({ text, icon });
	toastTimeout = setTimeout(() => {
		globalSetActiveToast?.(undefined);
	}, DURATION);
}

const styles = {
	container: {
		position: "fixed",
		left: 20,
		bottom: 20,
		width: "calc(100% - 40px)",
		maxWidth: 350,
		padding: 20,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#000c",
		borderRadius: 10,
	},
	dismissBackdrop: {
		position: "absolute",
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
	},
	icon: {
		color: "#fff",
		flexShrink: 0,
	},
	text: {
		color: "#fff",
		fontSize: 18,
		marginLeft: 10,
	},
} satisfies Record<string, React.CSSProperties>;
