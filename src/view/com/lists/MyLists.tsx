import type { AppBskyGraphDefs as GraphDefs } from "@atproto/api";
import React, { type JSX } from "react";

import { useTheme } from "#/alf";
import { ActivityIndicator } from "#/components/ActivityIndicator";
import * as ListCard from "#/components/ListCard";
import { Text } from "#/components/Typography";
import { BulletList_Stroke2_Corner0_Rounded as ListIcon } from "#/components/icons/BulletList";
import { usePalette } from "#/lib/hooks/usePalette";
import { cleanError } from "#/lib/strings/errors";
import { s } from "#/lib/styles";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { type MyListsFilter, useMyListsQuery } from "#/state/queries/my-lists";
import { List } from "../util/List";
import { ErrorMessage } from "../util/error/ErrorMessage";

const LOADING = { _reactKey: "__loading__" };
const EMPTY = { _reactKey: "__empty__" };
const ERROR_ITEM = { _reactKey: "__error__" };

export function MyLists({
	filter,
	inline,
	style,
	renderItem,
}: {
	filter: MyListsFilter;
	inline?: boolean;
	style?: React.CSSProperties;
	renderItem?: (list: GraphDefs.ListView, index: number) => JSX.Element;
}) {
	const pal = usePalette("default");
	const t = useTheme();
	const moderationOpts = useModerationOpts();
	const [isPTRing, setIsPTRing] = React.useState(false);
	const { data, isFetching, isFetched, isError, error, refetch } = useMyListsQuery(filter);
	const isEmpty = !isFetching && !data?.length;

	const items = React.useMemo(() => {
		let items: any[] = [];
		if (isError && isEmpty) {
			items = items.concat([ERROR_ITEM]);
		}
		if ((!isFetched && isFetching) || !moderationOpts) {
			items = items.concat([LOADING]);
		} else if (isEmpty) {
			items = items.concat([EMPTY]);
		} else {
			items = items.concat(data);
		}
		return items;
	}, [isError, isEmpty, isFetched, isFetching, moderationOpts, data]);

	let emptyText;
	switch (filter) {
		case "curate":
			emptyText = "Public, sharable lists which can be used to drive feeds.";
			break;
		case "mod":
			emptyText = "Public, sharable lists of users to mute or block in bulk.";
			break;
		default:
			emptyText = "You have no lists.";
			break;
	}

	// events
	// =

	const onRefresh = React.useCallback(async () => {
		setIsPTRing(true);
		try {
			await refetch();
		} catch (err) {
			console.error("Failed to refresh lists", { message: err });
		}
		setIsPTRing(false);
	}, [refetch]);

	// rendering
	// =

	const renderItemInner = React.useCallback(
		({ item, index }: { item: any; index: number }) => {
			if (item === EMPTY) {
				return (
					<div
						style={{
							flex: 1,
							alignItems: "center",
							gap: 8,
							paddingLeft: 20,
							paddingRight: 20,
							paddingTop: 20,
						}}
					>
						<div
							style={{
								alignItems: "center",
								justifyContent: "center",
								borderRadius: 999,
								...t.atoms.bg_contrast_25,

								...{
									width: 32,
									height: 32,
								},
							}}
						>
							<ListIcon size="md" fill={t.atoms.text_contrast_low.color} />
						</div>
						<Text
							style={{
								textAlign: "center",
								flex: 1,
								fontSize: 14,
								letterSpacing: 0,
								lineHeight: 1.3,
								...t.atoms.text_contrast_medium,

								...{
									maxWidth: 200,
								},
							}}
						>
							{emptyText}
						</Text>
					</div>
				);
			} else if (item === ERROR_ITEM) {
				return <ErrorMessage message={cleanError(error)} onPressTryAgain={onRefresh} />;
			} else if (item === LOADING) {
				return (
					<div style={{ padding: 20 }}>
						<ActivityIndicator />
					</div>
				);
			}
			return renderItem ? (
				renderItem(item, index)
			) : (
				<div
					style={{
						...(index !== 0 && { borderTop: "1px solid" }),
						...t.atoms.border_contrast_low,
						paddingLeft: 16,
						paddingRight: 16,
						paddingTop: 16,
						paddingBottom: 16,
					}}
				>
					<ListCard.Default view={item} />
				</div>
			);
		},
		[t, renderItem, error, onRefresh, emptyText],
	);

	if (inline) {
		return (
			<div style={style}>
				{items.length > 0 && (
					<div
					// FlatList
					// data={items}
					// keyExtractor={(item) => (item.uri ? item.uri : item._reactKey)}
					// renderItem={renderItemInner}
					// refreshControl={
					// 	<RefreshControl
					// 		refreshing={isPTRing}
					// 		onRefresh={onRefresh}
					// 		tintColor={pal.colors.text}
					// 		titleColor={pal.colors.text}
					// 	/>
					// }
					// contentContainerStyle={[s.contentContainer]}
					// removeClippedSubviews={true}
					/>
				)}
			</div>
		);
	} else {
		return (
			<div style={style}>
				{items.length > 0 && (
					<List
						data={items}
						keyExtractor={(item: any) => (item.uri ? item.uri : item._reactKey)}
						renderItem={renderItemInner}
						refreshing={isPTRing}
						onRefresh={onRefresh}
						contentContainerStyle={s.contentContainer}
						removeClippedSubviews={true}
						desktopFixedHeight
						sideBorders={false}
					/>
				)}
			</div>
		);
	}
}
