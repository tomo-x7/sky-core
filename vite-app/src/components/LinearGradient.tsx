import type React from "react";

interface LinearGradientProps {
	colors: string[]; // グラデーションの色リスト
	locations?: number[]; // 位置 (0.0 ~ 1.0)
	start?: { x: number; y: number }; // グラデーション開始位置 (0~1)
	end?: { x: number; y: number }; // グラデーション終了位置 (0~1)
	style?: React.CSSProperties; // スタイル
	children?: React.ReactNode;
}

export const LinearGradient: React.FC<LinearGradientProps> = ({
	colors,
	locations,
	start = { x: 0, y: 0 }, // デフォルト: 左上
	end = { x: 1, y: 1 }, // デフォルト: 右下
	style,
	children,
}) => {
	// start と end を使って角度を計算
	const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);

	// colors と locations を結合して CSS のグラデーションとして設定
	const gradientStops = colors
		.map((color, index) => {
			const position = locations?.[index] !== undefined ? `${locations[index]! * 100}%` : "";
			return `${color} ${position}`;
		})
		.join(", ");

	return (
		<div
			style={{
				...style,
				background: `linear-gradient(${angle}deg, ${gradientStops})`,
			}}
		>
			{children}
		</div>
	);
};
