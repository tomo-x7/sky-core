import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";

import { atoms as a } from "#/alf";
import { Button, ButtonIcon } from "#/components/Button";
import * as Layout from "#/components/Layout";
import { ListFooter, ListMaybePlaceholder } from "#/components/Lists";
import { ArrowOutOfBox_Stroke2_Corner0_Rounded as Share } from "#/components/icons/ArrowOutOfBox";
import { HITSLOP_10 } from "#/lib/constants";
import { useInitialNumToRender } from "#/lib/hooks/useInitialNumToRender";
import type { CommonNavigatorParams } from "#/lib/routes/types";
import { shareUrl } from "#/lib/sharing";
import { cleanError } from "#/lib/strings/errors";
import { enforceLen } from "#/lib/strings/helpers";
import { useSearchPostsQuery } from "#/state/queries/search-posts";
import { useSetMinimalShellMode } from "#/state/shell";
import type { ListRenderItemInfo } from "#/temp";
import { Pager } from "#/view/com/pager/Pager";
import { TabBar } from "#/view/com/pager/TabBar";
import { Post } from "#/view/com/post/Post";
import { List } from "#/view/com/util/List";

const renderItem = ({ item }: ListRenderItemInfo<PostView>) => {
	return <Post post={item} />;
};

const keyExtractor = (item: PostView, index: number) => {
	return `${item.uri}-${index}`;
};

export default function TopicScreen({ route }: NativeStackScreenProps<CommonNavigatorParams, "Topic">) {
	const { topic } = route.params;

	const headerTitle = React.useMemo(() => {
		return enforceLen(decodeURIComponent(topic), 24, true, "middle");
	}, [topic]);

	const onShare = React.useCallback(() => {
		const url = new URL("https://bsky.app");
		url.pathname = `/topic/${topic}`;
		shareUrl(url.toString());
	}, [topic]);

	const [activeTab, setActiveTab] = React.useState(0);
	const setMinimalShellMode = useSetMinimalShellMode();

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	const onPageSelected = React.useCallback(
		(index: number) => {
			setMinimalShellMode(false);
			setActiveTab(index);
		},
		[setMinimalShellMode],
	);

	const sections = React.useMemo(() => {
		return [
			{
				title: "Top",
				component: <TopicScreenTab topic={topic} sort="top" active={activeTab === 0} />,
			},
			{
				title: "Latest",
				component: <TopicScreenTab topic={topic} sort="latest" active={activeTab === 1} />,
			},
		];
	}, [topic, activeTab]);

	return (
		<Layout.Screen>
			<Pager
				onPageSelected={onPageSelected}
				renderTabBar={(props) => (
					<Layout.Center
						style={{
							...a.z_10,
							...a.sticky,
							...{ top: 0 },
						}}
					>
						<Layout.Header.Outer noBottomBorder>
							<Layout.Header.BackButton />
							<Layout.Header.Content>
								<Layout.Header.TitleText>{headerTitle}</Layout.Header.TitleText>
							</Layout.Header.Content>
							<Layout.Header.Slot>
								<Button
									label={"Share"}
									size="small"
									variant="ghost"
									color="primary"
									shape="round"
									onPress={onShare}
									hitSlop={HITSLOP_10}
									style={{ right: -3 }}
								>
									<ButtonIcon icon={Share} size="md" />
								</Button>
							</Layout.Header.Slot>
						</Layout.Header.Outer>
						<TabBar items={sections.map((section) => section.title)} {...props} />
					</Layout.Center>
				)}
				initialPage={0}
			>
				{sections.map((section, i) => (
					<div key={i}>{section.component}</div>
				))}
			</Pager>
		</Layout.Screen>
	);
}

function TopicScreenTab({
	topic,
	sort,
	active,
}: {
	topic: string;
	sort: "top" | "latest";
	active: boolean;
}) {
	const initialNumToRender = useInitialNumToRender();
	const [isPTR, setIsPTR] = React.useState(false);

	const { data, isFetched, isFetchingNextPage, isLoading, isError, error, refetch, fetchNextPage, hasNextPage } =
		useSearchPostsQuery({
			query: decodeURIComponent(topic),
			sort,
			enabled: active,
		});

	const posts = React.useMemo(() => {
		return data?.pages.flatMap((page) => page.posts) || [];
	}, [data]);

	const onRefresh = React.useCallback(async () => {
		setIsPTR(true);
		await refetch();
		setIsPTR(false);
	}, [refetch]);

	const onEndReached = React.useCallback(() => {
		if (isFetchingNextPage || !hasNextPage || error) return;
		fetchNextPage();
	}, [isFetchingNextPage, hasNextPage, error, fetchNextPage]);

	return (
		<>
			{posts.length < 1 ? (
				<ListMaybePlaceholder
					isLoading={isLoading || !isFetched}
					isError={isError}
					onRetry={refetch}
					emptyType="results"
					emptyMessage={`We couldn't find any results for that topic.`}
				/>
			) : (
				<List
					data={posts}
					renderItem={renderItem}
					keyExtractor={keyExtractor}
					refreshing={isPTR}
					onRefresh={onRefresh}
					onEndReached={onEndReached}
					onEndReachedThreshold={4}
					desktopFixedHeight
					ListFooterComponent={
						<ListFooter
							isFetchingNextPage={isFetchingNextPage}
							error={cleanError(error)}
							onRetry={fetchNextPage}
						/>
					}
					initialNumToRender={initialNumToRender}
					windowSize={11}
				/>
			)}
		</>
	);
}
