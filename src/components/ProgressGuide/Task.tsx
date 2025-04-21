import { motion } from "framer-motion";

import { useTheme } from "#/alf";
import { Text } from "../Typography";
import { AnimatedCheck } from "../anim/AnimatedCheck";

export function ProgressGuideTask({
	current,
	total,
	title,
	subtitle,
	tabularNumsTitle,
}: {
	current: number;
	total: number;
	title: string;
	subtitle?: string;
	tabularNumsTitle?: boolean;
}) {
	const t = useTheme();

	return (
		<div
			style={{
				flexDirection: "row",
				gap: 8,
				...(!subtitle && { alignItems: "center" }),
			}}
		>
			{current === total ? (
				<AnimatedCheck playOnMount fill={t.palette.primary_500} width={20} />
			) : (
				<ProgressCircle
					progress={current / total}
					color={t.palette.primary_400}
					size={20}
					thickness={3}
					// borderWidth={0}
					unfilledColor={t.palette.contrast_50}
				/>
			)}
			<div
				style={{
					flexDirection: "column",
					gap: 2,
					...(subtitle && { marginTop: -2 }),
				}}
			>
				<Text
					style={{
						fontSize: 14,
						letterSpacing: 0,
						fontWeight: "600",
						lineHeight: 1.15,
						...(tabularNumsTitle && { fontVariant: "tabular-nums" }),
					}}
				>
					{title}
				</Text>
				{subtitle && (
					<Text
						style={{
							fontSize: 14,
							letterSpacing: 0,
							...t.atoms.text_contrast_medium,
							lineHeight: 1.15,
						}}
					>
						{subtitle}
					</Text>
				)}
			</div>
		</div>
	);
}

function ProgressCircle({
	progress: p,
	color,
	size,
	thickness,
	unfilledColor,
}: { progress: number; color: string; size: number; thickness: number; unfilledColor: string }) {
	const radius = (size - thickness) / 2;
	const circumference = 2 * Math.PI * radius;
	const progress = p * circumference;

	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
			<title>progress</title>
			{/* 背景の円 */}
			<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={unfilledColor} strokeWidth={thickness} />
			{/* 進捗の円 */}
			<motion.circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke={color}
				strokeWidth={thickness}
				strokeDasharray={circumference}
				strokeDashoffset={circumference}
				animate={{ strokeDashoffset: circumference - progress }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				strokeLinecap="round"
			/>
		</svg>
	);
}
