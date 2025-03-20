import { nanoid } from "nanoid/non-secure";

import { tokens, useTheme } from "#/alf";

export type Props = {
	fill?: string | undefined;
	style?: React.CSSProperties;
	size?: keyof typeof sizes;
	gradient?: keyof typeof tokens.gradients;
} & Omit<JSX.IntrinsicElements["svg"], "style" | "size">;

export const sizes = {
	xs: 12,
	sm: 16,
	md: 20,
	lg: 24,
	xl: 28,
	"2xl": 32,
};

export function useCommonSVGProps(props: Props) {
	const t = useTheme();
	const { fill, size, gradient, style, ...rest } = props;
	const _size = Number(size ? sizes[size] : rest.width || sizes.md);
	let _fill = fill || style?.color || t.palette.primary_500;
	let gradientDef = null;

	if (gradient && tokens.gradients[gradient]) {
		const id = `${gradient}_${nanoid()}`;
		const config = tokens.gradients[gradient];
		_fill = `url(#${id})`;
		gradientDef = (
			<defs>
				<linearGradient id={id} x1="0" y1="0" x2="100%" y2="0" gradientTransform="rotate(45)">
					{config.values.map(([stop, fill]) => (
						<stop key={stop} offset={stop} stopColor={fill} />
					))}
				</linearGradient>
			</defs>
		);
	}

	return {
		fill: _fill,
		size: _size,
		style,
		gradient: gradientDef,
		...rest,
	};
}
