import type React from "react";

interface LinearGradientProps {
	colors: string[]; // グラデーションの色リスト
	locations?: number[]; // 位置 (0.0 ~ 1.0)
	angle?: number; // グラデーションの角度
	style?: React.CSSProperties; // スタイル
	children?: React.ReactNode;
}

export const LinearGradient: React.FC<LinearGradientProps> = ({
	colors,
	locations,
	angle = 90, // デフォルト: 上から下のグラデーション
	style,
	children,
}) => {
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
