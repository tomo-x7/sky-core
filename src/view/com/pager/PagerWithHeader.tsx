import * as React from "react";

import type { JSX } from "react";
import * as Layout from "#/components/Layout";
import { Pager, type PagerRef, type RenderTabBarFnProps } from "#/view/com/pager/Pager";
import { TabBar } from "./TabBar";

interface PagerWithHeaderChildParams {
	headerHeight: number;
	isFocused: boolean;
	// scrollElRef: React.MutableRefObject<ListMethods | ScrollView | null>;
	scrollElRef: React.MutableRefObject<any>;
}

interface PagerWithHeaderProps {
	children:
		| (((props: PagerWithHeaderChildParams) => JSX.Element) | null)[]
		| ((props: PagerWithHeaderChildParams) => JSX.Element);
	items: string[];
	isHeaderReady: boolean;
	renderHeader?: ({
		setMinimumHeight,
	}: {
		setMinimumHeight: () => void;
	}) => JSX.Element;
	initialPage?: number;
	onPageSelected?: (index: number) => void;
	onCurrentPageSelected?: (index: number) => void;
}
export const PagerWithHeader = React.forwardRef<PagerRef, PagerWithHeaderProps>(function PageWithHeaderImpl(
	{
		children,
		items,
		isHeaderReady,
		renderHeader,
		initialPage,
		onPageSelected,
		onCurrentPageSelected,
	}: PagerWithHeaderProps,
	ref,
) {
	const [currentPage, setCurrentPage] = React.useState(0);

	const renderTabBar = React.useCallback(
		(props: RenderTabBarFnProps) => {
			return (
				<PagerTabBar
					items={items}
					renderHeader={renderHeader}
					isHeaderReady={isHeaderReady}
					currentPage={currentPage}
					onCurrentPageSelected={onCurrentPageSelected}
					onSelect={props.onSelect}
					tabBarAnchor={props.tabBarAnchor}
				/>
			);
		},
		[items, isHeaderReady, renderHeader, currentPage, onCurrentPageSelected],
	);

	const onPageSelectedInner = React.useCallback(
		(index: number) => {
			setCurrentPage(index);
			onPageSelected?.(index);
		},
		[onPageSelected],
	);

	return (
		<Pager ref={ref} initialPage={initialPage} onPageSelected={onPageSelectedInner} renderTabBar={renderTabBar}>
			{toArray(children)
				.filter(Boolean)
				.map((child, i) => {
					const isReady = isHeaderReady;
					return (
						<div
							key={i}
							style={{
								display: isReady ? undefined : "none",
							}}
						>
							<PagerItem isFocused={i === currentPage} renderTab={child} />
						</div>
					);
				})}
		</Pager>
	);
});

let PagerTabBar = ({
	currentPage,
	items,
	isHeaderReady,
	renderHeader,
	onCurrentPageSelected,
	onSelect,
	tabBarAnchor,
}: {
	currentPage: number;
	items: string[];
	renderHeader?: ({
		setMinimumHeight,
	}: {
		setMinimumHeight: () => void;
	}) => JSX.Element;
	isHeaderReady: boolean;
	onCurrentPageSelected?: (index: number) => void;
	onSelect?: (index: number) => void;
	tabBarAnchor?: JSX.Element | null | undefined;
}): React.ReactNode => {
	return (
		<>
			<Layout.Center>{renderHeader?.({ setMinimumHeight: noop })}</Layout.Center>
			{tabBarAnchor}
			<Layout.Center
				style={{
					zIndex: 10,
					position: "sticky",
					...{ top: 0, display: isHeaderReady ? undefined : "none" },
				}}
			>
				<TabBar
					items={items}
					selectedPage={currentPage}
					onSelect={onSelect}
					onPressSelected={onCurrentPageSelected}
				/>
			</Layout.Center>
		</>
	);
};
PagerTabBar = React.memo(PagerTabBar);

function PagerItem({
	isFocused,
	renderTab,
}: {
	isFocused: boolean;
	renderTab: ((props: PagerWithHeaderChildParams) => JSX.Element) | null;
}) {
	const scrollElRef = React.useRef();
	if (renderTab == null) {
		return null;
	}
	return renderTab({
		headerHeight: 0,
		isFocused,
		// scrollElRef: scrollElRef as React.MutableRefObject<ListMethods | ScrollView | null>,
		scrollElRef: scrollElRef as React.MutableRefObject<any>,
	});
}

function toArray<T>(v: T | T[]): T[] {
	if (Array.isArray(v)) {
		return v;
	}
	return [v];
}

function noop() {}
