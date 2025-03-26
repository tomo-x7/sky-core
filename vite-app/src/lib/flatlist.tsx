import { forwardRef, useEffect, useState } from "react";

export type FlatListProps<T> = {
	data: T[];
	renderItem: (item: { item: T; index: number }) => React.ReactNode;
	ListHeaderComponent?: React.ReactNode;
	ListFooterComponent?: React.ReactNode;
	stickyHeaderIndices?: number[];
	keyExtractor: (item: T, index: number) => string;
	style?: React.CSSProperties;
	contentContainerStyle?: React.CSSProperties;
	onEndReached?: () => void;
	onEndReachedThreshold?: number;
	initialNumToRender?: number;
	maxToRenderPerBatch?: number;
	keyboardDismissMode?: "on-drag" | "none" | "interactive";
	scrollIndicatorInsets?: { top: number };
	// itemLayoutAnimation?: any;
};

export const FlatList = forwardRef<HTMLDivElement, FlatListProps<any>>(function FlatList(
	{
		data,
		renderItem,
		ListHeaderComponent,
		ListFooterComponent,
		stickyHeaderIndices,
		keyExtractor,
		style,
		contentContainerStyle,
		onEndReached,
		onEndReachedThreshold = 0.1,
		initialNumToRender = 10,
		maxToRenderPerBatch = 10,
		keyboardDismissMode,
		scrollIndicatorInsets,
		// itemLayoutAnimation,
	},
	ref,
) {
	const [visibleItems, setVisibleItems] = useState(data.slice(0, initialNumToRender));
	const [isEndReached, setIsEndReached] = useState(false);

	const handleScroll = (e: React.UIEvent<HTMLElement>) => {
		const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
		const threshold = scrollHeight - clientHeight * onEndReachedThreshold;

		// onEndReachedの呼び出し
		if (scrollTop >= threshold && !isEndReached) {
			setIsEndReached(true);
			onEndReached?.();
		}
	};

	useEffect(() => {
		// 新しいデータが追加された場合、再レンダリング
		setVisibleItems(data.slice(0, initialNumToRender));
	}, [data, initialNumToRender]);

	useEffect(() => {
		// onEndReached が呼ばれた後、次のバッチのアイテムをレンダリング
		if (isEndReached && maxToRenderPerBatch) {
			setVisibleItems((prev) => [...prev, ...data.slice(prev.length, prev.length + maxToRenderPerBatch)]);
		}
	}, [isEndReached, data, maxToRenderPerBatch]);

	return (
		<div
			ref={ref}
			onScroll={handleScroll}
			style={{
				overflowY: "auto",
				...style,
			}}
		>
			{ListHeaderComponent}
			<div
				style={{
					...contentContainerStyle,
					display: "flex",
					flexDirection: "column",
				}}
			>
				{visibleItems.map((item, index) => (
					<div key={keyExtractor(item, index)}>{renderItem({ item, index })}</div>
				))}
			</div>

			{ListFooterComponent}
		</div>
	);
});
