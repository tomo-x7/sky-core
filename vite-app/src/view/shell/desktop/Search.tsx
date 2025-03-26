import { type AppBskyActorDefs, type ModerationDecision, moderateProfile } from "@atproto/api";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";

import { useNavigate } from "react-router-dom";
import { atoms as a } from "#/alf";
import { ActivityIndicator } from "#/components/ActivityIndicator";
import { Text } from "#/components/Typography";
import { SearchInput } from "#/components/forms/SearchInput";
import { usePalette } from "#/lib/hooks/usePalette";
import { makeProfileLink } from "#/lib/routes/links";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { sanitizeHandle } from "#/lib/strings/handles";
import { s } from "#/lib/styles";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { useActorAutocompleteQuery } from "#/state/queries/actor-autocomplete";
import { precacheProfile } from "#/state/queries/profile";
import { Link } from "#/view/com/util/Link";
import { UserAvatar } from "#/view/com/util/UserAvatar";

let SearchLinkCard = ({
	label,
	to,
	onPress,
	style,
}: {
	label: string;
	to?: string;
	onPress?: () => void;
	style?: React.CSSProperties;
}): React.ReactNode => {
	const pal = usePalette("default");

	const inner = (
		<div
			style={{
				...pal.border,
				...{ padding: "16px 12px" },
				...style,
			}}
		>
			<Text type="md" style={pal.text}>
				{label}
			</Text>
		</div>
	);

	if (onPress) {
		return (
			<button type="button" onClick={onPress}>
				{inner}
			</button>
		);
	}

	return (
		<Link href={to} asAnchor anchorNoUnderline>
			<div
				style={{
					...pal.border,
					...{ paddingTop: 16, paddingBottom: 16, paddingLeft: 12, paddingRight: 12 },
					...style,
				}}
			>
				<Text type="md" style={pal.text}>
					{label}
				</Text>
			</div>
		</Link>
	);
};
SearchLinkCard = React.memo(SearchLinkCard);
export { SearchLinkCard };

let SearchProfileCard = ({
	profile,
	moderation,
	onPress: onPressInner,
}: {
	profile: AppBskyActorDefs.ProfileViewBasic;
	moderation: ModerationDecision;
	onPress: () => void;
}): React.ReactNode => {
	const pal = usePalette("default");
	const queryClient = useQueryClient();

	const onPress = React.useCallback(() => {
		precacheProfile(queryClient, profile);
		onPressInner();
	}, [queryClient, profile, onPressInner]);

	return (
		<Link href={makeProfileLink(profile)} title={profile.handle} asAnchor anchorNoUnderline onBeforePress={onPress}>
			<div
				style={{
					...pal.border,

					...{
						flexDirection: "row",
						alignItems: "center",
						gap: 12,
						paddingTop: 8,
						paddingBottom: 8,
						paddingLeft: 12,
						paddingRight: 12,
					},
				}}
			>
				<UserAvatar
					size={40}
					avatar={profile.avatar}
					moderation={moderation.ui("avatar")}
					type={profile.associated?.labeler ? "labeler" : "user"}
				/>
				<div style={{ flex: 1 }}>
					<Text
						type="lg"
						style={{
							...s.bold,
							...pal.text,
							...a.self_start,
						}}
						numberOfLines={1}
						lineHeight={1.2}
					>
						{sanitizeDisplayName(
							profile.displayName || sanitizeHandle(profile.handle),
							moderation.ui("displayName"),
						)}
					</Text>
					<Text type="md" style={pal.textLight} numberOfLines={1}>
						{sanitizeHandle(profile.handle, "@")}
					</Text>
				</div>
			</div>
		</Link>
	);
};
SearchProfileCard = React.memo(SearchProfileCard);
export { SearchProfileCard };

export function DesktopSearch() {
	const pal = usePalette("default");
	const [isActive, setIsActive] = React.useState<boolean>(false);
	const [query, setQuery] = React.useState<string>("");
	const { data: autocompleteData, isFetching } = useActorAutocompleteQuery(query, true);
	const navigate = useNavigate();

	const moderationOpts = useModerationOpts();

	const onChangeText = React.useCallback((text: string) => {
		setQuery(text);
		setIsActive(text.length > 0);
	}, []);

	const onPressCancelSearch = React.useCallback(() => {
		setQuery("");
		setIsActive(false);
	}, []);

	const onSubmit = React.useCallback(() => {
		setIsActive(false);
		if (!query.length) return;
		// navigation.dispatch(StackActions.push("Search", { q: query }));
		navigate(`/search?q=${encodeURIComponent(query)}`);
	}, [query, navigate]);

	const onSearchProfileCardPress = React.useCallback(() => {
		setQuery("");
		setIsActive(false);
	}, []);

	return (
		<div
			style={{
				...styles.container,
				...pal.view,
			}}
		>
			<SearchInput
				value={query}
				onChangeText={onChangeText}
				onClearText={onPressCancelSearch}
				onSubmitEditing={onSubmit}
			/>
			{query !== "" && isActive && moderationOpts && (
				<div
					style={{
						...pal.view,
						...pal.borderDark,
						...styles.resultsContainer,
					}}
				>
					{isFetching && !autocompleteData?.length ? (
						<div style={{ padding: 8 }}>
							<ActivityIndicator />
						</div>
					) : (
						<>
							<SearchLinkCard
								label={`Search for "${query}"`}
								to={`/search?q=${encodeURIComponent(query)}`}
								style={(autocompleteData?.length ?? 0) > 0 ? { borderBottomWidth: 1 } : undefined}
							/>
							{autocompleteData?.map((item) => (
								<SearchProfileCard
									key={item.did}
									profile={item}
									moderation={moderateProfile(item, moderationOpts)}
									onPress={onSearchProfileCardPress}
								/>
							))}
						</>
					)}
				</div>
			)}
		</div>
	);
}

const styles = {
	container: {
		position: "relative",
		width: "100%",
	},
	resultsContainer: {
		marginTop: 10,
		flexDirection: "column",
		width: "100%",
		borderWidth: 1,
		borderRadius: 6,
	},
} satisfies Record<string, React.CSSProperties>;
