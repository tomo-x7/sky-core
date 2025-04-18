import type React from "react";

interface ProgressProps {
	progress: number; // 0 ~ 1 の範囲
	size?: number;
	color?: string;
	backgroundColor?: string;
	borderWidth?: number;
	borderColor?: string;
}

/** 扇形のプログレスバー (Pie) */
export const ProgressPie: React.FC<ProgressProps> = ({
	progress,
	size = 50,
	color = "blue",
	backgroundColor = "lightgray",
	borderWidth = 2,
	borderColor = "black",
}) => {
	const radius = size / 2;

	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
			{/* 背景円 */}
			<circle cx={radius} cy={radius} r={radius} fill={backgroundColor} />
			{/* 境界線 (ボーダー) */}
			{borderWidth > 0 && (
				<circle
					cx={radius}
					cy={radius}
					r={radius - borderWidth / 2}
					fill="none"
					stroke={borderColor}
					strokeWidth={borderWidth}
				/>
			)}
			{/* 進捗円 */}
			<circle
				cx={radius}
				cy={radius}
				r={radius}
				fill={color}
				clipPath={`polygon(50% 50%, 50% 0%, ${
					50 + 50 * Math.cos(2 * Math.PI * progress)
				}% ${50 + 50 * Math.sin(2 * Math.PI * progress)}%)`}
			/>
		</svg>
	);
};

/** 円形 (リング状) のプログレスバー (Circle) */
export const ProgressCircle: React.FC<ProgressProps> = ({
	progress,
	size = 50,
	color = "blue",
	backgroundColor = "lightgray",
	borderWidth = 2,
	borderColor = "black",
}) => {
	const radius = (size - borderWidth * 2) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference * (1 - progress);

	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
			{/* 背景円 */}
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				stroke={backgroundColor}
				strokeWidth={borderWidth}
				fill="none"
			/>
			{/* 境界線 (ボーダー) */}
			{borderWidth > 0 && (
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius + borderWidth / 2}
					stroke={borderColor}
					strokeWidth={borderWidth}
					fill="none"
				/>
			)}
			{/* 進捗円 */}
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				stroke={color}
				strokeWidth={borderWidth * 2}
				fill="none"
				strokeDasharray={circumference}
				strokeDashoffset={offset}
				strokeLinecap="round"
			/>
		</svg>
	);
};
