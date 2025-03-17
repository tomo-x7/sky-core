import { useEffect, useState } from "react";

export const useColorScheme = () => {
	const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handleChange = () => {
			setColorScheme(mediaQuery.matches ? "dark" : "light");
		};

		// 初期化
		handleChange();

		// 変更時のリスナー登録
		mediaQuery.addEventListener("change", handleChange);

		// クリーンアップ
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, []);

	return colorScheme;
};
