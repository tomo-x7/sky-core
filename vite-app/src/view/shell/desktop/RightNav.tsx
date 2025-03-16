import { useNavigation } from "@react-navigation/core";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { atoms as a, useGutters, useLayoutBreakpoints, useTheme } from "#/alf";
import { AppLanguageDropdown } from "#/components/AppLanguageDropdown";
import { Divider } from "#/components/Divider";
import { InlineLinkText } from "#/components/Link";
import { ProgressGuideList } from "#/components/ProgressGuide/List";
import { Text } from "#/components/Typography";
import { FEEDBACK_FORM_URL, HELP_DESK_URL } from "#/lib/constants";
import { useKawaiiMode } from "#/state/preferences/kawaii";
import { useSession } from "#/state/session";
import { DesktopFeeds } from "#/view/shell/desktop/Feeds";
import { DesktopSearch } from "#/view/shell/desktop/Search";
import { SidebarTrendingTopics } from "#/view/shell/desktop/SidebarTrendingTopics";

function useWebQueryParams() {
	const navigation = useNavigation();
	const [params, setParams] = useState<Record<string, string>>({});

	useEffect(() => {
		return navigation.addListener("state", (e) => {
			try {
				const { state } = e.data;
				const lastRoute = state.routes[state.routes.length - 1];
				setParams(lastRoute.params);
			} catch (err) {}
		});
	}, [navigation]);

	return params;
}

export function DesktopRightNav({ routeName }: { routeName: string }) {
	const t = useTheme();
	const { hasSession, currentAccount } = useSession();
	const kawaii = useKawaiiMode();
	const gutters = useGutters(["base", 0, "base", "wide"]);
	const isSearchScreen = routeName === "Search";
	const webqueryParams = useWebQueryParams();
	const searchQuery = webqueryParams?.q;
	const showTrending = !isSearchScreen || (isSearchScreen && !!searchQuery);
	const { rightNavVisible, centerColumnOffset, leftNavMinimal } = useLayoutBreakpoints();

	if (!rightNavVisible) {
		return null;
	}

	return (
		<View
			style={{
				...gutters,
				...a.gap_lg,

				...//@ts-ignore
				{
					position: "fixed",
					left: "50%",
					transform: [{ translateX: centerColumnOffset ? 150 : 300 }, ...a.scrollbar_offset.transform],
					width: 300 + gutters.paddingLeft,
					maxHeight: "100%",
					overflowY: "auto",
				},
			}}
		>
			{!isSearchScreen && <DesktopSearch />}
			{hasSession && (
				<>
					<ProgressGuideList />
					<DesktopFeeds />
					<Divider />
				</>
			)}
			{showTrending && <SidebarTrendingTopics />}
			<Text
				style={{
					...a.leading_snug,
					...t.atoms.text_contrast_low,
				}}
			>
				{hasSession && (
					<>
						<InlineLinkText
							to={FEEDBACK_FORM_URL({
								email: currentAccount?.email,
								handle: currentAccount?.handle,
							})}
							label={"Feedback"}
						>
							{"Feedback"}
						</InlineLinkText>
						{" • "}
					</>
				)}
				<InlineLinkText to="https://bsky.social/about/support/privacy-policy" label={"Privacy"}>
					{"Privacy"}
				</InlineLinkText>
				{" • "}
				<InlineLinkText to="https://bsky.social/about/support/tos" label={"Terms"}>
					{"Terms"}
				</InlineLinkText>
				{" • "}
				<InlineLinkText label={"Help"} to={HELP_DESK_URL}>
					{"Help"}
				</InlineLinkText>
			</Text>
			{kawaii && (
				<Text
					style={{
						...t.atoms.text_contrast_medium,
						...{ marginTop: 12 },
					}}
				>
					<>
						Logo by{" "}
						<InlineLinkText
							label={"Logo by @sawaratsuki.bsky.social"}
							to="/profile/sawaratsuki.bsky.social"
						>
							@sawaratsuki.bsky.social
						</InlineLinkText>
					</>
				</Text>
			)}
			{!hasSession && leftNavMinimal && (
				<View
					style={{
						...a.w_full,
						...{ height: 32 },
					}}
				>
					<AppLanguageDropdown style={{ marginTop: 0 }} />
				</View>
			)}
		</View>
	);
}
