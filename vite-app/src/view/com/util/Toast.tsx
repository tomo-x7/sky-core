/*
 * Note: the dataSet properties are used to leverage custom CSS in public/index.html
 */

import { FontAwesomeIcon, type Props as FontAwesomeProps } from "@fortawesome/react-fontawesome";
import type React from "react";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const DURATION = 3500;

interface ActiveToast {
	text: string;
	icon: FontAwesomeProps["icon"];
}
type GlobalSetActiveToast = (_activeToast: ActiveToast | undefined) => void;

// globals
// =
let globalSetActiveToast: GlobalSetActiveToast | undefined;
let toastTimeout: number | undefined;

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
				<View style={styles.container}>
					{/* @ts-ignore */}
					<FontAwesomeIcon icon={activeToast.icon} size={20} style={styles.icon} />
					<Text style={styles.text}>{activeToast.text}</Text>
					<Pressable
						style={styles.dismissBackdrop}
						accessibilityLabel="Dismiss"
						accessibilityHint=""
						onPress={() => {
							setActiveToast(undefined);
						}}
					/>
				</View>
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

const styles = StyleSheet.create({
	container: {
		// @ts-ignore web only
		position: "fixed",
		left: 20,
		bottom: 20,
		// @ts-ignore web only
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
});
