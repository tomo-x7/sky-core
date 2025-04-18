import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useFocusEffect(effect: () => void | (() => void)) {
	const location = useLocation(); // 現在のURL情報を取得

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		return effect();
		// URL（location）が変わるたびに effect を実行
	}, [location]);
}
