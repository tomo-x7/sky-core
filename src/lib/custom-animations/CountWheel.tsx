import React from "react";

import { atoms as a, useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import { decideShouldRoll } from "#/lib/custom-animations/util";
import { s } from "#/lib/styles";
import { formatCount } from "#/view/com/util/numeric/format";

const animationConfig = {
	duration: 400,
	easing: "cubic-bezier(0.4, 0, 0.2, 1)",
	fill: "forwards" as FillMode,
};

const enteringUpKeyframe = [
	{ opacity: 0, transform: "translateY(18px)" },
	{ opacity: 1, transform: "translateY(0)" },
];

const enteringDownKeyframe = [
	{ opacity: 0, transform: "translateY(-18px)" },
	{ opacity: 1, transform: "translateY(0)" },
];

const exitingUpKeyframe = [
	{ opacity: 1, transform: "translateY(0)" },
	{ opacity: 0, transform: "translateY(-18px)" },
];

const exitingDownKeyframe = [
	{ opacity: 1, transform: "translateY(0)" },
	{ opacity: 0, transform: "translateY(18px)" },
];

export function CountWheel({
	likeCount,
	big,
	isLiked,
	hasBeenToggled,
}: {
	likeCount: number;
	big?: boolean;
	isLiked: boolean;
	hasBeenToggled: boolean;
}) {
	const t = useTheme();
	// const shouldAnimate = !useReducedMotion() && hasBeenToggled;
	const shouldAnimate = hasBeenToggled;
	const shouldRoll = decideShouldRoll(isLiked, likeCount);

	const countView = React.useRef<HTMLDivElement>(null);
	const prevCountView = React.useRef<HTMLDivElement>(null);

	const [prevCount, setPrevCount] = React.useState(likeCount);
	const prevIsLiked = React.useRef(isLiked);
	const formattedCount = formatCount(likeCount);
	const formattedPrevCount = formatCount(prevCount);

	React.useEffect(() => {
		if (isLiked === prevIsLiked.current) {
			return;
		}

		const newPrevCount = isLiked ? likeCount - 1 : likeCount + 1;
		if (shouldAnimate && shouldRoll) {
			countView.current?.animate?.(isLiked ? enteringUpKeyframe : enteringDownKeyframe, animationConfig);
			prevCountView.current?.animate?.(isLiked ? exitingUpKeyframe : exitingDownKeyframe, animationConfig);
			setPrevCount(newPrevCount);
		}
		prevIsLiked.current = isLiked;
	}, [isLiked, likeCount, shouldAnimate, shouldRoll]);

	if (likeCount < 1) {
		return null;
	}

	return (
		<div>
			<div ref={countView}>
				<Text
					style={{
						...(big ? a.text_md : { fontSize: 15 }),
						userSelect: "none",
						...(isLiked ? { fontWeight: "600", ...s.likeColor } : { color: t.palette.contrast_500 }),
					}}
				>
					{formattedCount}
				</Text>
			</div>
			{shouldAnimate && (likeCount > 1 || !isLiked) ? (
				<div style={{ position: "absolute", opacity: 0 }} aria-disabled={true} ref={prevCountView}>
					<Text
						style={{
							...(big ? a.text_md : { fontSize: 15 }),
							userSelect: "none",
							...(isLiked ? { fontWeight: "600", ...s.likeColor } : { color: t.palette.contrast_500 }),
						}}
					>
						{formattedPrevCount}
					</Text>
				</div>
			) : null}
		</div>
	);
}
