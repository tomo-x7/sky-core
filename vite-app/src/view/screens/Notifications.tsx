import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

import { atoms as a } from "#/alf";
import { ButtonIcon } from "#/components/Button";
import * as Layout from "#/components/Layout";
import { Link } from "#/components/Link";
import { Loader } from "#/components/Loader";
import { SettingsGear2_Stroke2_Corner0_Rounded as SettingsIcon } from "#/components/icons/SettingsGear2";
import { useNonReactiveCallback } from "#/lib/hooks/useNonReactiveCallback";
import { ComposeIcon2 } from "#/lib/icons";
import type { NativeStackScreenProps, NotificationsTabNavigatorParams } from "#/lib/routes/types";
import { s } from "#/lib/styles";
import { emitSoftReset, listenSoftReset } from "#/state/events";
import { RQKEY as NOTIFS_RQKEY } from "#/state/queries/notifications/feed";
import { useUnreadNotifications, useUnreadNotificationsApi } from "#/state/queries/notifications/unread";
import { truncateAndInvalidate } from "#/state/queries/util";
import { useSetMinimalShellMode } from "#/state/shell";
import { useComposerControls } from "#/state/shell/composer";
import { NotificationFeed } from "#/view/com/notifications/NotificationFeed";
import { Pager } from "#/view/com/pager/Pager";
import { TabBar } from "#/view/com/pager/TabBar";
import type { ListMethods } from "#/view/com/util/List";
import { MainScrollProvider } from "#/view/com/util/MainScrollProvider";
import { FAB } from "#/view/com/util/fab/FAB";
import { LoadLatestBtn } from "#/view/com/util/load-latest/LoadLatestBtn";

// We don't currently persist this across reloads since
// you gotta visit All to clear the badge anyway.
// But let's at least persist it during the sesssion.
let lastActiveTab = 0;

type Props = NativeStackScreenProps<NotificationsTabNavigatorParams, "Notifications">;
export function NotificationsScreen(props: Props) {
	const { openComposer } = useComposerControls();
	const unreadNotifs = useUnreadNotifications();
	const hasNew = !!unreadNotifs;
	const { checkUnread: checkUnreadAll } = useUnreadNotificationsApi();
	const [isLoadingAll, setIsLoadingAll] = React.useState(false);
	const [isLoadingMentions, setIsLoadingMentions] = React.useState(false);
	const initialActiveTab = lastActiveTab;
	const [activeTab, setActiveTab] = React.useState(initialActiveTab);
	const isLoading = activeTab === 0 ? isLoadingAll : isLoadingMentions;

	const onPageSelected = React.useCallback((index: number) => {
		setActiveTab(index);
		lastActiveTab = index;
	}, []);

	const queryClient = useQueryClient();
	const checkUnreadMentions = React.useCallback(
		async ({ invalidate }: { invalidate: boolean }) => {
			if (invalidate) {
				return truncateAndInvalidate(queryClient, NOTIFS_RQKEY("mentions"));
			} else {
				// Background polling is not implemented for the mentions tab.
				// Just ignore it.
			}
		},
		[queryClient],
	);

	const sections = React.useMemo(() => {
		return [
			{
				title: "All",
				component: (
					<NotificationsTab
						filter="all"
						isActive={activeTab === 0}
						isLoading={isLoadingAll}
						hasNew={hasNew}
						setIsLoadingLatest={setIsLoadingAll}
						checkUnread={checkUnreadAll}
					/>
				),
			},
			{
				title: "Mentions",
				component: (
					<NotificationsTab
						filter="mentions"
						isActive={activeTab === 1}
						isLoading={isLoadingMentions}
						hasNew={false /* We don't know for sure */}
						setIsLoadingLatest={setIsLoadingMentions}
						checkUnread={checkUnreadMentions}
					/>
				),
			},
		];
	}, [hasNew, checkUnreadAll, checkUnreadMentions, activeTab, isLoadingAll, isLoadingMentions]);

	return (
		<Layout.Screen>
			<Layout.Header.Outer noBottomBorder sticky={false}>
				<Layout.Header.MenuButton />
				<Layout.Header.Content>
					<Layout.Header.TitleText>Notifications</Layout.Header.TitleText>
				</Layout.Header.Content>
				<Layout.Header.Slot>
					<Link
						to="/notifications/settings"
						label={"Notification settings"}
						size="small"
						variant="ghost"
						color="secondary"
						shape="round"
						style={a.justify_center}
					>
						<ButtonIcon icon={isLoading ? Loader : SettingsIcon} size="lg" />
					</Link>
				</Layout.Header.Slot>
			</Layout.Header.Outer>
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
						<TabBar
							{...props}
							items={sections.map((section) => section.title)}
							onPressSelected={() => emitSoftReset()}
						/>
					</Layout.Center>
				)}
				initialPage={initialActiveTab}
			>
				{sections.map((section, i) => (
					<div key={i}>{section.component}</div>
				))}
			</Pager>
			<FAB
				onPress={() => openComposer({})}
				icon={<ComposeIcon2 strokeWidth={1.5} size={29} style={s.white} />}
				accessibilityRole="button"
				accessibilityLabel={"New post"}
				accessibilityHint=""
			/>
		</Layout.Screen>
	);
}

function NotificationsTab({
	filter,
	isActive,
	isLoading,
	hasNew,
	checkUnread,
	setIsLoadingLatest,
}: {
	filter: "all" | "mentions";
	isActive: boolean;
	isLoading: boolean;
	hasNew: boolean;
	checkUnread: ({ invalidate }: { invalidate: boolean }) => Promise<void>;
	setIsLoadingLatest: (v: boolean) => void;
}) {
	const setMinimalShellMode = useSetMinimalShellMode();
	const [isScrolledDown, setIsScrolledDown] = React.useState(false);
	const scrollElRef = React.useRef<ListMethods>(null);
	const queryClient = useQueryClient();
	const isScreenFocused = useIsFocused();
	const isFocusedAndActive = isScreenFocused && isActive;

	// event handlers
	// =
	const scrollToTop = React.useCallback(() => {
		scrollElRef.current?.scrollToOffset({ animated: false, offset: 0 });
		setMinimalShellMode(false);
	}, [setMinimalShellMode]);

	const onPressLoadLatest = React.useCallback(() => {
		scrollToTop();
		if (hasNew) {
			// render what we have now
			truncateAndInvalidate(queryClient, NOTIFS_RQKEY(filter));
		} else if (!isLoading) {
			// check with the server
			setIsLoadingLatest(true);
			checkUnread({ invalidate: true })
				.catch(() => undefined)
				.then(() => setIsLoadingLatest(false));
		}
	}, [scrollToTop, queryClient, checkUnread, hasNew, isLoading, setIsLoadingLatest, filter]);

	const onFocusCheckLatest = useNonReactiveCallback(() => {
		// on focus, check for latest, but only invalidate if the user
		// isnt scrolled down to avoid moving content underneath them

		// On the web, this isn't always updated in time so
		// we're just going to look it up synchronously.
		const currentIsScrolledDown = window.scrollY > 200;

		checkUnread({ invalidate: !currentIsScrolledDown });
	});

	// on-visible setup
	// =
	useFocusEffect(
		React.useCallback(() => {
			if (isFocusedAndActive) {
				setMinimalShellMode(false);
				onFocusCheckLatest();
			}
		}, [setMinimalShellMode, onFocusCheckLatest, isFocusedAndActive]),
	);
	React.useEffect(() => {
		if (!isFocusedAndActive) {
			return;
		}
		return listenSoftReset(onPressLoadLatest);
	}, [onPressLoadLatest, isFocusedAndActive]);

	return (
		<>
			<MainScrollProvider>
				<NotificationFeed
					enabled={isFocusedAndActive}
					filter={filter}
					refreshNotifications={() => checkUnread({ invalidate: true })}
					onScrolledDownChange={setIsScrolledDown}
					scrollElRef={scrollElRef}
				/>
			</MainScrollProvider>
			{(isScrolledDown || hasNew) && (
				<LoadLatestBtn onPress={onPressLoadLatest} label={"Load new notifications"} showIndicator={hasNew} />
			)}
		</>
	);
}
