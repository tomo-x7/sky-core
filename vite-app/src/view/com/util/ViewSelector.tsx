import React, { type JSX, useEffect, useState } from "react";
import { type NativeScrollEvent, type NativeSyntheticEvent, RefreshControl, ScrollView } from "react-native";

import { flatten } from "#/alf";
import { Text } from "#/components/Typography";
import { useColorSchemeStyle } from "#/lib/hooks/useColorSchemeStyle";
import { usePalette } from "#/lib/hooks/usePalette";
import { clamp } from "#/lib/numbers";
import { colors, s } from "#/lib/styles";
import { FlatList_INTERNAL } from "./Views";

const HEADER_ITEM = { _reactKey: "__header__" };
const SELECTOR_ITEM = { _reactKey: "__selector__" };
const STICKY_HEADER_INDICES = [1];

export type ViewSelectorHandle = {
	scrollToTop: () => void;
};

export const ViewSelector = React.forwardRef<
	ViewSelectorHandle,
	{
		sections: string[];
		items: any[];
		refreshing?: boolean;
		swipeEnabled?: boolean;
		renderHeader?: () => JSX.Element;
		renderItem: (item: any) => JSX.Element;
		ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
		onSelectView?: (viewIndex: number) => void;
		onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
		onRefresh?: () => void;
		onEndReached?: (info: { distanceFromEnd: number }) => void;
	}
>(function ViewSelectorImpl(
	{
		sections,
		items,
		refreshing,
		renderHeader,
		renderItem,
		ListFooterComponent,
		onSelectView,
		onScroll,
		onRefresh,
		onEndReached,
	},
	ref,
) {
	const pal = usePalette("default");
	const [selectedIndex, setSelectedIndex] = useState<number>(0);
	//@ts-expect-error
	const flatListRef = React.useRef<FlatList_INTERNAL>(null);

	// events
	// =

	const keyExtractor = React.useCallback((item: any) => item._reactKey, []);

	const onPressSelection = React.useCallback(
		(index: number) => setSelectedIndex(clamp(index, 0, sections.length)),
		[sections],
	);
	useEffect(() => {
		onSelectView?.(selectedIndex);
	}, [selectedIndex, onSelectView]);

	React.useImperativeHandle(ref, () => ({
		scrollToTop: () => {
			flatListRef.current?.scrollToOffset({ offset: 0 });
		},
	}));

	// rendering
	// =

	const renderItemInternal = React.useCallback(
		({ item }: { item: any }) => {
			if (item === HEADER_ITEM) {
				if (renderHeader) {
					return renderHeader();
				}
				return <div />;
			} else if (item === SELECTOR_ITEM) {
				return <Selector items={sections} selectedIndex={selectedIndex} onSelect={onPressSelection} />;
			} else {
				return renderItem(item);
			}
		},
		[sections, selectedIndex, onPressSelection, renderHeader, renderItem],
	);

	const data = React.useMemo(() => [HEADER_ITEM, SELECTOR_ITEM, ...items], [items]);
	return (
		<FlatList_INTERNAL
			ref={flatListRef}
			data={data}
			keyExtractor={keyExtractor}
			renderItem={renderItemInternal}
			ListFooterComponent={ListFooterComponent}
			stickyHeaderIndices={STICKY_HEADER_INDICES}
			onScroll={onScroll}
			onEndReached={onEndReached}
			refreshControl={
				<RefreshControl refreshing={refreshing!} onRefresh={onRefresh} tintColor={pal.colors.text} />
			}
			onEndReachedThreshold={0.6}
			contentContainerStyle={s.contentContainer}
			removeClippedSubviews={true}
			scrollIndicatorInsets={{ right: 1 }} // fixes a bug where the scroll indicator is on the middle of the screen https://github.com/bluesky-social/social-app/pull/464
		/>
	);
});

export function Selector({
	selectedIndex,
	items,
	onSelect,
}: {
	selectedIndex: number;
	items: string[];
	onSelect?: (index: number) => void;
}) {
	const pal = usePalette("default");
	const borderColor = useColorSchemeStyle({ borderColor: colors.black }, { borderColor: colors.white });

	const onPressItem = (index: number) => {
		onSelect?.(index);
	};

	return (
		<div
			style={{
				width: "100%",
				backgroundColor: pal.colors.background,
			}}
		>
			<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				<div
					style={{
						...pal.view,
						...styles.outer,
					}}
				>
					{items.map((item, i) => {
						const selected = i === selectedIndex;
						return (
							<button
								type="button"
								key={item}
								onClick={() => onPressItem(i)}
								// TODO: Modify the component API such that lint fails
								// at the invocation site as well
							>
								<div
									style={{
										...styles.item,
										...(selected && styles.itemSelected),
										...borderColor,
									}}
								>
									<Text
										style={flatten(
											selected ? [styles.labelSelected, pal.text] : [styles.label, pal.textLight],
										)}
									>
										{item}
									</Text>
								</div>
							</button>
						);
					})}
				</div>
			</ScrollView>
		</div>
	);
}

const styles = {
	outer: {
		flexDirection: "row",
		paddingLeft: 14,
		paddingRight: 14,
	},
	item: {
		marginRight: 14,
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 8,
		paddingBottom: 12,
	},
	itemSelected: {
		borderBottomWidth: 3,
	},
	label: {
		fontWeight: "600",
	},
	labelSelected: {
		fontWeight: "600",
	},
	underline: {
		position: "absolute",
		height: 4,
		bottom: 0,
	},
} satisfies Record<string, React.CSSProperties>;
