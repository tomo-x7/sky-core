import { useEffect, useState } from "react";

import { useLocation } from "react-router-dom";
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

function useWebQueryParams(): Record<string, string> {
	const location = useLocation();
	const [params, setParams] = useState<Record<string, string>>({});

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const newParams: Record<string, string> = {};
		for (const [key, value] of searchParams.entries()) {
			newParams[key] = value;
		}
		setParams(newParams);
	}, [location.search]);

	return params;
}

export function DesktopRightNav() {
	const t = useTheme();
	const { hasSession, currentAccount } = useSession();
	const kawaii = useKawaiiMode();
	const gutters = useGutters(["base", 0, "base", "wide"]);
	const isSearchScreen = location.pathname === "/search";
	const webqueryParams = useWebQueryParams();
	const searchQuery = webqueryParams?.q;
	const showTrending = !isSearchScreen || (isSearchScreen && !!searchQuery);
	const { rightNavVisible, centerColumnOffset, leftNavMinimal } = useLayoutBreakpoints();

	if (!rightNavVisible) {
		return null;
	}

	return (
		<div
			style={{
				...gutters,
				gap: 16,

				position: "fixed",
				left: "50%",
				transform: `translateX(${centerColumnOffset ? 150 : 300}px) ${a.scrollbar_offset.transform}`,
				width: 300 + gutters.paddingLeft,
				maxHeight: "100%",
				overflowY: "auto",
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
					lineHeight: 1.3,
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
				<div
					style={{
						width: "100%",
						...{ height: 32 },
					}}
				>
					<AppLanguageDropdown style={{ marginTop: 0 }} />
				</div>
			)}
		</div>
	);
}
