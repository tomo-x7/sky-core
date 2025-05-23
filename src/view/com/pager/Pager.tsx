import React, { type JSX } from "react";
import { flushSync } from "react-dom";

import { s } from "#/lib/styles";

export interface PagerRef {
	setPage: (index: number) => void;
}
export interface RenderTabBarFnProps {
	selectedPage: number;
	onSelect?: (index: number) => void;
	tabBarAnchor?: JSX.Element;
}
export type RenderTabBarFn = (props: RenderTabBarFnProps) => JSX.Element;

interface Props {
	initialPage?: number;
	renderTabBar: RenderTabBarFn;
	onPageSelected?: (index: number) => void;
}
export const Pager = React.forwardRef(function PagerImpl(
	{ children, initialPage = 0, renderTabBar, onPageSelected }: React.PropsWithChildren<Props>,
	ref,
) {
	const [selectedPage, setSelectedPage] = React.useState(initialPage);
	const scrollYs = React.useRef<Array<number | null>>([]);
	const anchorRef = React.useRef(null);

	React.useImperativeHandle(ref, () => ({
		setPage: (index: number) => {
			onTabBarSelect(index);
		},
	}));

	const onTabBarSelect = React.useCallback(
		(index: number) => {
			const scrollY = window.scrollY;
			// We want to determine if the tabbar is already "sticking" at the top (in which
			// case we should preserve and restore scroll), or if it is somewhere below in the
			// viewport (in which case a scroll jump would be jarring). We determine this by
			// measuring where the "anchor" element is (which we place just above the tabbar).
			const anchorTop = anchorRef.current ? (anchorRef.current as Element).getBoundingClientRect().top : -scrollY; // If there's no anchor, treat the top of the page as one.
			const isSticking = anchorTop <= 5; // This would be 0 if browser scrollTo() was reliable.

			if (isSticking) {
				scrollYs.current[selectedPage] = window.scrollY;
			} else {
				scrollYs.current[selectedPage] = null;
			}
			flushSync(() => {
				setSelectedPage(index);
				onPageSelected?.(index);
			});
			if (isSticking) {
				const restoredScrollY = scrollYs.current[index];
				if (restoredScrollY != null) {
					window.scrollTo(0, restoredScrollY);
				} else {
					window.scrollTo(0, scrollY + anchorTop);
				}
			}
		},
		[selectedPage, onPageSelected],
	);

	return (
		<div style={s.hContentRegion}>
			{renderTabBar({
				selectedPage,
				tabBarAnchor: <div ref={anchorRef} />,
				onSelect: (e) => onTabBarSelect(e),
			})}
			{React.Children.map(children, (child, i) => (
				<div style={selectedPage === i ? s.flex1 : s.hidden} key={`page-${i}`}>
					{child}
				</div>
			))}
		</div>
	);
});
