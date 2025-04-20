import { useCallback, useEffect, useRef } from "react";

import { useBreakpoints, useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import { PressableWithHover } from "../util/PressableWithHover";

export interface TabBarProps {
	selectedPage: number;
	items: string[];
	indicatorColor?: string;
	backgroundColor?: string;

	onSelect?: (index: number) => void;
	onPressSelected?: (index: number) => void;
}

// How much of the previous/next item we're showing
// to give the user a hint there's more to scroll.
const OFFSCREEN_ITEM_WIDTH = 20;

export function TabBar({ selectedPage, items, onSelect, onPressSelected }: TabBarProps) {
	const t = useTheme();
	const scrollElRef = useRef<HTMLDivElement>(null);
	const itemRefs = useRef<Array<Element>>([]);
	const { gtMobile } = useBreakpoints();
	const styles = gtMobile ? desktopStyles : mobileStyles;

	useEffect(() => {
		// On the web, the primary interaction is tapping.
		// Scrolling under tap feels disorienting so only adjust the scroll offset
		// when tapping on an item out of view--and we adjust by almost an entire page.
		// @ts-expect-error
		const parent = scrollElRef?.current?.getScrollableNode?.();
		if (!parent) {
			return;
		}
		const parentRect = parent.getBoundingClientRect();
		if (!parentRect) {
			return;
		}
		const { left: parentLeft, right: parentRight, width: parentWidth } = parentRect;
		const child = itemRefs.current[selectedPage];
		if (!child) {
			return;
		}
		const childRect = child.getBoundingClientRect?.();
		if (!childRect) {
			return;
		}
		const { left: childLeft, right: childRight, width: childWidth } = childRect;
		let dx = 0;
		if (childRight >= parentRight) {
			dx += childRight - parentRight;
			dx += parentWidth - childWidth - OFFSCREEN_ITEM_WIDTH;
		} else if (childLeft <= parentLeft) {
			dx -= parentLeft - childLeft;
			dx -= parentWidth - childWidth - OFFSCREEN_ITEM_WIDTH;
		}
		let x = parent.scrollLeft + dx;
		x = Math.max(0, x);
		x = Math.min(x, parent.scrollWidth - parentWidth);
		if (dx !== 0) {
			parent.scroll({
				left: x,
				behavior: "smooth",
			});
		}
	}, [selectedPage]);

	const onPressItem = useCallback(
		(index: number) => {
			onSelect?.(index);
			if (index === selectedPage) {
				onPressSelected?.(index);
			}
		},
		[onSelect, selectedPage, onPressSelected],
	);

	return (
		<div
			style={{
				...t.atoms.bg,
				...styles.outer,
				width: "100%",
				marginLeft: "auto",
				marginRight: "auto",
				maxWidth: "600px",
				height: "100%",
			}}
			// accessibilityRole="tablist"
		>
			<div
				// horizontal={true}
				// showsHorizontalScrollIndicator={false}
				ref={scrollElRef}
				// contentContainerStyle={styles.contentContainer}
				style={{
					width: "100%",
					overflow: "auto",
					userSelect: "none",
					flexDirection: "row",
					flexShrink: 1,
					flexGrow: 1,
					scrollbarWidth: "none",
					overflowY: "hidden",
				}}
			>
				<div style={{ width: "fit-content", flexDirection: "row", flexGrow: 1 }}>
					{items.map((item, i) => {
						const selected = i === selectedPage;
						return (
							<PressableWithHover
								key={`${item}-${i}`}
								ref={(node) => (itemRefs.current[i] = node as any)}
								style={styles.item}
								hoverStyle={t.atoms.bg_contrast_25}
								onPress={() => onPressItem(i)}
								// accessibilityRole="tab"
							>
								<div style={styles.itemInner}>
									<Text
										style={{
											...styles.itemText,
											...(selected ? t.atoms.text : t.atoms.text_contrast_medium),
											fontSize: 16,
											letterSpacing: 0,
											fontWeight: "600",
											...{ lineHeight: "20px" },
										}}
									>
										{item}
										<div
											style={{
												...styles.itemIndicator,
												...(selected && {
													backgroundColor: t.palette.primary_500,
												}),
											}}
										/>
									</Text>
								</div>
							</PressableWithHover>
						);
					})}
				</div>
			</div>
			<div
				style={{
					...t.atoms.border_contrast_low,
					...styles.outerBottomBorder,
				}}
			/>
		</div>
	);
}

const desktopStyles = {
	outer: {
		flexDirection: "row",
		width: 600,
	},
	contentContainer: {
		flexGrow: 1,
		paddingLeft: 0,
		paddingRight: 0,
		backgroundColor: "transparent",
	},
	item: {
		flexGrow: 1,
		alignItems: "stretch",
		paddingTop: 14,
		paddingLeft: 14,
		paddingRight: 14,
		justifyContent: "center",
	},
	itemInner: {
		alignItems: "center",
		overflowX: "hidden",
	},
	itemText: {
		textAlign: "center",
		paddingBottom: 10 + 3,
	},
	itemIndicator: {
		position: "absolute",
		bottom: 0,
		height: 3,
		left: "50%",
		transform: "translateX(-50%)",
		minWidth: 45,
		width: "100%",
	},
	outerBottomBorder: {
		position: "absolute",
		left: 0,
		right: 0,
		top: "100%",
		borderBottomWidth: 1,
	},
} satisfies Record<string, React.CSSProperties>;

const mobileStyles = {
	outer: {
		flexDirection: "row",
	},
	contentContainer: {
		flexGrow: 1,
		backgroundColor: "transparent",
		paddingLeft: 6,
		paddingRight: 6,
	},
	item: {
		flexGrow: 1,
		alignItems: "stretch",
		paddingTop: 10,
		paddingLeft: 10,
		paddingRight: 10,
		justifyContent: "center",
	},
	itemInner: {
		flexGrow: 1,
		alignItems: "center",
		overflowX: "hidden",
	},
	itemText: {
		textAlign: "center",
		paddingBottom: 10 + 3,
	},
	itemIndicator: {
		position: "absolute",
		bottom: 0,
		height: 3,
		left: "50%",
		transform: "translateX(-50%)",
		minWidth: 45,
		width: "100%",
	},
	outerBottomBorder: {
		position: "absolute",
		left: 0,
		right: 0,
		top: "100%",
		borderBottomWidth: 1,
	},
} satisfies Record<string, React.CSSProperties>;
