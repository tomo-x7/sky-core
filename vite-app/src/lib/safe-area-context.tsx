import { type CSSProperties, type PropsWithChildren, useEffect, useState } from "react";

export const useSafeAreaFrame = () => {
	const [frame, setFrame] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	useEffect(() => {
		const updateFrame = () => {
			setFrame({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		window.addEventListener("resize", updateFrame);
		return () => window.removeEventListener("resize", updateFrame);
	}, []);

	return { ...frame, x: 0, y: 0 };
};
type SafeAreaEdges = "top" | "bottom" | "left" | "right";

export const SafeAreaView = ({
	children,
	style = {},
	edges,
}: PropsWithChildren<{ style?: unknown; edges?: "all" | SafeAreaEdges[] }>) => {
	const [safeArea, setSafeArea] = useState({
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
	});

	useEffect(() => {
		const updateSafeArea = () => {
			setSafeArea({
				top: Number.parseInt(
					getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-top)"),
					10,
				),
				bottom: Number.parseInt(
					getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-bottom)"),
					10,
				),
				left: Number.parseInt(
					getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-left)"),
					10,
				),
				right: Number.parseInt(
					getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-right)"),
					10,
				),
			});
		};

		window.addEventListener("resize", updateSafeArea);
		updateSafeArea(); // 初期化

		return () => {
			window.removeEventListener("resize", updateSafeArea);
		};
	}, []);

	// `edges` に基づいて、必要なセーフエリアのみ適用
	const paddingStyles: React.CSSProperties = {};
	if (edges === "all" || (Array.isArray(edges) && edges.includes("top"))) {
		paddingStyles.paddingTop = safeArea.top;
	}
	if (edges === "all" || (Array.isArray(edges) && edges.includes("bottom"))) {
		paddingStyles.paddingBottom = safeArea.bottom;
	}
	if (edges === "all" || (Array.isArray(edges) && edges.includes("left"))) {
		paddingStyles.paddingLeft = safeArea.left;
	}
	if (edges === "all" || (Array.isArray(edges) && edges.includes("right"))) {
		paddingStyles.paddingRight = safeArea.right;
	}

	return <div style={{ ...paddingStyles, ...(style as CSSProperties) }}>{children}</div>;
};
