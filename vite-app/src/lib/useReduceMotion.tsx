import { useEffect, useState } from "react";

export const useReduceMotion = () => {
	const [reduceMotion, setReduceMotion] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

		const handleChange = () => {
			setReduceMotion(mediaQuery.matches);
		};

		// 初期化
		handleChange();

		// 変更時のリスナー登録
		mediaQuery.addEventListener("change", handleChange);

		// クリーンアップ
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, []);

	return reduceMotion;
};
