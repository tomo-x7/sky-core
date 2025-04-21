import { type AppBskyActorDefs, type AppBskyFeedDefs, moderateProfile } from "@atproto/api";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useLayoutEffect, useMemo } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";
import { atoms as a, tokens, useBreakpoints, useTheme } from "#/alf";
import { ActivityIndicator } from "#/components/ActivityIndicator";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as FeedCard from "#/components/FeedCard";
import * as Layout from "#/components/Layout";
import * as Menu from "#/components/Menu";
import { Text } from "#/components/Typography";
import { SearchInput } from "#/components/forms/SearchInput";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";
import { useOnLayout } from "#/components/hooks/useOnLayout";
import { ChevronBottom_Stroke2_Corner0_Rounded as ChevronDownIcon } from "#/components/icons/Chevron";
import { Earth_Stroke2_Corner0_Rounded as EarthIcon } from "#/components/icons/Globe";
import { TimesLarge_Stroke2_Corner0_Rounded as XIcon } from "#/components/icons/Times";
import { APP_LANGUAGES, LANGUAGES } from "#/lib/../locale/languages";
import { HITSLOP_10 } from "#/lib/constants";
import { useNonReactiveCallback } from "#/lib/hooks/useNonReactiveCallback";
import { MagnifyingGlassIcon } from "#/lib/icons";
import { makeProfileLink } from "#/lib/routes/links";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { augmentSearchQuery } from "#/lib/strings/helpers";
import { languageName } from "#/locale/helpers";
import { type Params, makeSearchQuery, parseSearchQuery } from "#/screens/Search/utils";
import { listenSoftReset } from "#/state/events";
import { useLanguagePrefs } from "#/state/preferences/languages";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { useActorAutocompleteQuery } from "#/state/queries/actor-autocomplete";
import { useActorSearch } from "#/state/queries/actor-search";
import { usePopularFeedsSearch } from "#/state/queries/feed";
import { unstableCacheProfileView, useProfilesQuery } from "#/state/queries/profile";
import { useSearchPostsQuery } from "#/state/queries/search-posts";
import { useSession } from "#/state/session";
import { useSetMinimalShellMode } from "#/state/shell";
import { account, useStorage } from "#/storage";
import type * as bsky from "#/types/bsky";
import { Pager } from "#/view/com/pager/Pager";
import { TabBar } from "#/view/com/pager/TabBar";
import { Post } from "#/view/com/post/Post";
import { ProfileCardWithFollowBtn } from "#/view/com/profile/ProfileCard";
import { Link } from "#/view/com/util/Link";
import { List } from "#/view/com/util/List";
import { UserAvatar } from "#/view/com/util/UserAvatar";
import { Explore } from "#/view/screens/Search/Explore";
import { SearchLinkCard, SearchProfileCard } from "#/view/shell/desktop/Search";

function Loader() {
	return (
		<Layout.Content>
			<div style={{ paddingTop: 20, paddingBottom: 20 }}>
				<ActivityIndicator />
			</div>
		</Layout.Content>
	);
}

function EmptyState({ message, error }: { message: string; error?: string }) {
	const t = useTheme();

	return (
		<Layout.Content>
			<div style={{ padding: 20 }}>
				<div
					style={{
						...t.atoms.bg_contrast_25,
						borderRadius: 8,
						padding: 16,
					}}
				>
					<Text style={{ ...a.text_md }}>{message}</Text>

					{error && (
						<>
							<div
								style={{
									marginTop: 12,
									marginBottom: 12,
									height: 1,
									width: "100%",
									backgroundColor: t.atoms.text.color,
									opacity: 0.2,
								}}
							/>

							<Text style={t.atoms.text_contrast_medium}>Error: {error}</Text>
						</>
					)}
				</div>
			</div>
		</Layout.Content>
	);
}

type SearchResultSlice =
	| {
			type: "post";
			key: string;
			post: AppBskyFeedDefs.PostView;
	  }
	| {
			type: "loadingMore";
			key: string;
	  };

let SearchScreenPostResults = ({
	query,
	sort,
	active,
}: {
	query: string;
	sort?: "top" | "latest";
	active: boolean;
}): React.ReactNode => {
	const { currentAccount } = useSession();
	const [isPTR, setIsPTR] = React.useState(false);

	const augmentedQuery = React.useMemo(() => {
		return augmentSearchQuery(query || "", { did: currentAccount?.did });
	}, [query, currentAccount]);

	const {
		isFetched,
		data: results,
		isFetching,
		error,
		refetch,
		fetchNextPage,
		isFetchingNextPage,
		hasNextPage,
	} = useSearchPostsQuery({ query: augmentedQuery, sort, enabled: active });

	const onPullToRefresh = React.useCallback(async () => {
		setIsPTR(true);
		await refetch();
		setIsPTR(false);
	}, [refetch]);
	const onEndReached = React.useCallback(() => {
		if (isFetching || !hasNextPage || error) return;
		fetchNextPage();
	}, [isFetching, error, hasNextPage, fetchNextPage]);

	const posts = React.useMemo(() => {
		return results?.pages.flatMap((page) => page.posts) || [];
	}, [results]);
	const items = React.useMemo(() => {
		const temp: SearchResultSlice[] = [];

		const seenUris = new Set();
		for (const post of posts) {
			if (seenUris.has(post.uri)) {
				continue;
			}
			temp.push({
				type: "post",
				key: post.uri,
				post,
			});
			seenUris.add(post.uri);
		}

		if (isFetchingNextPage) {
			temp.push({
				type: "loadingMore",
				key: "loadingMore",
			});
		}

		return temp;
	}, [posts, isFetchingNextPage]);

	return error ? (
		<EmptyState
			message={`We're sorry, but your search could not be completed. Please try again in a few minutes.`}
			error={error.toString()}
		/>
	) : (
		<>
			{isFetched ? (
				<>
					{posts.length ? (
						<List
							data={items}
							renderItem={({ item }: any) => {
								if (item.type === "post") {
									return <Post post={item.post} />;
								} else {
									return null;
								}
							}}
							keyExtractor={(item: any) => item.key}
							refreshing={isPTR}
							onRefresh={onPullToRefresh}
							onEndReached={onEndReached}
							desktopFixedHeight
							contentContainerStyle={{ paddingBottom: 100 }}
						/>
					) : (
						<EmptyState message={`No results found for ${query}`} />
					)}
				</>
			) : (
				<Loader />
			)}
		</>
	);
};
SearchScreenPostResults = React.memo(SearchScreenPostResults);

let SearchScreenUserResults = ({
	query,
	active,
}: {
	query: string;
	active: boolean;
}): React.ReactNode => {
	const { data: results, isFetched } = useActorSearch({
		query,
		enabled: active,
	});

	return isFetched && results ? (
		<>
			{results.length ? (
				<List
					data={results}
					renderItem={({ item }: { item: any }) => <ProfileCardWithFollowBtn profile={item} noBg />}
					keyExtractor={(item: any) => item.did}
					desktopFixedHeight
					contentContainerStyle={{ paddingBottom: 100 }}
				/>
			) : (
				<EmptyState message={`No results found for ${query}`} />
			)}
		</>
	) : (
		<Loader />
	);
};
SearchScreenUserResults = React.memo(SearchScreenUserResults);

let SearchScreenFeedsResults = ({
	query,
	active,
}: {
	query: string;
	active: boolean;
}): React.ReactNode => {
	const t = useTheme();

	const { data: results, isFetched } = usePopularFeedsSearch({
		query,
		enabled: active,
	});

	return isFetched && results ? (
		<>
			{results.length ? (
				<List
					data={results}
					renderItem={({ item }: { item: any }) => (
						<div
							style={{
								borderBottom: "1px solid black",
								...t.atoms.border_contrast_low,
								paddingLeft: 16,
								paddingRight: 16,
								paddingTop: 16,
								paddingBottom: 16,
							}}
						>
							<FeedCard.Default view={item} />
						</div>
					)}
					keyExtractor={(item: any) => item.uri}
					desktopFixedHeight
					contentContainerStyle={{ paddingBottom: 100 }}
				/>
			) : (
				<EmptyState message={`No results found for ${query}`} />
			)}
		</>
	) : (
		<Loader />
	);
};
SearchScreenFeedsResults = React.memo(SearchScreenFeedsResults);

function SearchLanguageDropdown({
	value,
	onChange,
}: {
	value: string;
	onChange(value: string): void;
}) {
	const { appLanguage, contentLanguages } = useLanguagePrefs();

	const languages = useMemo(() => {
		return LANGUAGES.filter(
			(lang, index, self) =>
				Boolean(lang.code2) && // reduce to the code2 varieties
				index === self.findIndex((t) => t.code2 === lang.code2), // remove dupes (which will happen)
		)
			.map((l) => ({
				label: languageName(l, appLanguage),
				value: l.code2,
				key: l.code2 + l.code3,
			}))
			.sort((a, b) => {
				// prioritize user's languages
				const aIsUser = contentLanguages.includes(a.value);
				const bIsUser = contentLanguages.includes(b.value);
				if (aIsUser && !bIsUser) return -1;
				if (bIsUser && !aIsUser) return 1;
				// prioritize "common" langs in the network
				const aIsCommon = !!APP_LANGUAGES.find(
					(al) =>
						// skip `ast`, because it uses a 3-letter code which conflicts with `as`
						// it begins with `a` anyway so still is top of the list
						al.code2 !== "ast" && al.code2.startsWith(a.value),
				);
				const bIsCommon = !!APP_LANGUAGES.find(
					(al) =>
						// ditto
						al.code2 !== "ast" && al.code2.startsWith(b.value),
				);
				if (aIsCommon && !bIsCommon) return -1;
				if (bIsCommon && !aIsCommon) return 1;
				// fall back to alphabetical
				return a.label.localeCompare(b.label);
			});
	}, [appLanguage, contentLanguages]);

	const currentLanguageLabel = languages.find((lang) => lang.value === value)?.label ?? "All languages";

	return (
		<Menu.Root>
			<Menu.Trigger label={`Filter search by language (currently: ${currentLanguageLabel})`}>
				{({ props }) => (
					<Button {...props} size="small" color="secondary" variant="solid">
						<ButtonIcon icon={EarthIcon} />
						<ButtonText>{currentLanguageLabel}</ButtonText>
						<ButtonIcon icon={ChevronDownIcon} />
					</Button>
				)}
			</Menu.Trigger>
			<Menu.Outer>
				<Menu.LabelText>Filter search by language</Menu.LabelText>
				<Menu.Item label={"All languages"} onPress={() => onChange("")}>
					<Menu.ItemText>All languages</Menu.ItemText>
					<Menu.ItemRadio selected={value === ""} />
				</Menu.Item>
				<Menu.Divider />
				<Menu.Group>
					{languages.map((lang) => (
						<Menu.Item key={lang.key} label={lang.label} onPress={() => onChange(lang.value)}>
							<Menu.ItemText>{lang.label}</Menu.ItemText>
							<Menu.ItemRadio selected={value === lang.value} />
						</Menu.Item>
					))}
				</Menu.Group>
			</Menu.Outer>
		</Menu.Root>
	);
}

function useQueryManager({
	initialQuery,
	fixedParams,
}: {
	initialQuery: string;
	fixedParams?: Params;
}) {
	const { query, params: initialParams } = React.useMemo(() => {
		return parseSearchQuery(initialQuery || "");
	}, [initialQuery]);
	const [prevInitialQuery, setPrevInitialQuery] = React.useState(initialQuery);
	const [lang, setLang] = React.useState(initialParams.lang || "");

	if (initialQuery !== prevInitialQuery) {
		// handle new queryParam change (from manual search entry)
		setPrevInitialQuery(initialQuery);
		setLang(initialParams.lang || "");
	}

	const params = React.useMemo(
		() => ({
			// default stuff
			...initialParams,
			// managed stuff
			lang,
			...fixedParams,
		}),
		[lang, initialParams, fixedParams],
	);
	const handlers = React.useMemo(
		() => ({
			setLang,
		}),
		[],
	);

	return React.useMemo(() => {
		return {
			query,
			queryWithParams: makeSearchQuery(query, params),
			params: {
				...params,
				...handlers,
			},
		};
	}, [query, params, handlers]);
}

let SearchScreenInner = ({
	query,
	queryWithParams,
	headerHeight,
}: {
	query: string;
	queryWithParams: string;
	headerHeight: number;
}): React.ReactNode => {
	const t = useTheme();
	const setMinimalShellMode = useSetMinimalShellMode();
	const { hasSession } = useSession();
	const { gtTablet } = useBreakpoints();
	const [activeTab, setActiveTab] = React.useState(0);

	const onPageSelected = React.useCallback(
		(index: number) => {
			setMinimalShellMode(false);
			setActiveTab(index);
		},
		[setMinimalShellMode],
	);

	const sections = React.useMemo(() => {
		if (!queryWithParams) return [];
		const noParams = queryWithParams === query;
		return [
			{
				title: "Top",
				component: <SearchScreenPostResults query={queryWithParams} sort="top" active={activeTab === 0} />,
			},
			{
				title: "Latest",
				component: <SearchScreenPostResults query={queryWithParams} sort="latest" active={activeTab === 1} />,
			},
			noParams && {
				title: "People",
				component: <SearchScreenUserResults query={query} active={activeTab === 2} />,
			},
			noParams && {
				title: "Feeds",
				component: <SearchScreenFeedsResults query={query} active={activeTab === 3} />,
			},
		].filter(Boolean) as {
			title: string;
			component: React.ReactNode;
		}[];
	}, [query, queryWithParams, activeTab]);

	return queryWithParams ? (
		<Pager
			onPageSelected={onPageSelected}
			renderTabBar={(props) => (
				<Layout.Center
					style={{
						zIndex: 10,
						position: "sticky",
						...{ top: headerHeight },
					}}
				>
					<TabBar items={sections.map((section) => section.title)} {...props} />
				</Layout.Center>
			)}
			initialPage={0}
		>
			{sections.map((section, i) => (
				<div key={i}>{section.component}</div>
			))}
		</Pager>
	) : hasSession ? (
		<Explore />
	) : (
		<Layout.Center>
			<div style={{ flex: 1 }}>
				{gtTablet && (
					<div
						style={{
							borderBottom: "1px solid black",
							...t.atoms.border_contrast_low,
							paddingLeft: 16,
							paddingRight: 16,
							paddingTop: 8,
							paddingBottom: 16,
						}}
					>
						<Text
							style={{
								fontSize: 22,
								letterSpacing: 0,
								fontWeight: "800",
							}}
						>
							Search
						</Text>
					</div>
				)}

				<div
					style={{
						alignItems: "center",
						justifyContent: "center",
						paddingTop: 32,
						paddingBottom: 32,
						gap: 16,
					}}
				>
					<MagnifyingGlassIcon strokeWidth={3} size={60} style={t.atoms.text_contrast_medium} />
					<Text
						style={{
							...t.atoms.text_contrast_medium,
							fontSize: 16,
							letterSpacing: 0,
						}}
					>
						Find posts, users, and feeds on Bluesky
					</Text>
				</div>
			</div>
		</Layout.Center>
	);
};
SearchScreenInner = React.memo(SearchScreenInner);

export function SearchScreen() {
	const [params] = useSearchParams();
	const query = params.get("q") ?? "";
	return <SearchScreenShell queryParam={query} />;
}

export function SearchScreenShell({
	queryParam,
	fixedParams,
	navButton = "menu",
	inputPlaceholder,
}: {
	queryParam: string;
	fixedParams?: Params;
	navButton?: "back" | "menu";
	inputPlaceholder?: string;
}) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const textInput = React.useRef<HTMLInputElement>(null);
	const setMinimalShellMode = useSetMinimalShellMode();
	const { currentAccount } = useSession();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	// Query terms
	const [searchText, setSearchText] = React.useState<string>(queryParam);
	const { data: autocompleteData, isFetching: isAutocompleteFetching } = useActorAutocompleteQuery(searchText, true);

	const [showAutocomplete, setShowAutocomplete] = React.useState(false);

	const [termHistory = [], setTermHistory] = useStorage(account, [
		currentAccount?.did ?? "pwi",
		"searchTermHistory",
	] as const);
	const [accountHistory = [], setAccountHistory] = useStorage(account, [
		currentAccount?.did ?? "pwi",
		"searchAccountHistory",
	]);

	const { data: accountHistoryProfiles } = useProfilesQuery({
		handles: accountHistory,
		maintainData: true,
	});

	const updateSearchHistory = useCallback(
		async (item: string) => {
			if (!item) return;
			const newSearchHistory = [item, ...termHistory.filter((search) => search !== item)].slice(0, 6);
			setTermHistory(newSearchHistory);
		},
		[termHistory, setTermHistory],
	);

	const updateProfileHistory = useCallback(
		async (item: bsky.profile.AnyProfileView) => {
			const newAccountHistory = [item.did, ...accountHistory.filter((p) => p !== item.did)].slice(0, 5);
			setAccountHistory(newAccountHistory);
		},
		[accountHistory, setAccountHistory],
	);

	const deleteSearchHistoryItem = useCallback(
		async (item: string) => {
			setTermHistory(termHistory.filter((search) => search !== item));
		},
		[termHistory, setTermHistory],
	);
	const deleteProfileHistoryItem = useCallback(
		async (item: AppBskyActorDefs.ProfileViewDetailed) => {
			setAccountHistory(accountHistory.filter((p) => p !== item.did));
		},
		[accountHistory, setAccountHistory],
	);

	const { params, query, queryWithParams } = useQueryManager({
		initialQuery: queryParam,
		fixedParams,
	});
	const showFilters = Boolean(queryWithParams && !showAutocomplete);

	// web only - measure header height for sticky positioning
	const [headerHeight, setHeaderHeight] = React.useState(0);
	const headerRef = React.useRef(null);
	useLayoutEffect(() => {
		if (!headerRef.current) return;
		const measurement = (headerRef.current as Element).getBoundingClientRect();
		setHeaderHeight(measurement.height);
	}, []);

	useFocusEffect(
		useNonReactiveCallback(() => {
			setSearchText(queryParam);
		}),
	);

	const onPressClearQuery = React.useCallback(() => {
		scrollToTopWeb();
		setSearchText("");
		textInput.current?.focus();
	}, []);

	const onChangeText = React.useCallback(async (text: string) => {
		scrollToTopWeb();
		setSearchText(text);
	}, []);

	const navigateToItem = React.useCallback(
		(item: string) => {
			scrollToTopWeb();
			setShowAutocomplete(false);
			updateSearchHistory(item);
			// navigation.push(route.name, { ...route.params, q: item });
			console.log("from src/view/screens/Search/Search.tsx:651 何すればいいのかよくわからん");
		},
		[updateSearchHistory],
	);

	const onPressCancelSearch = React.useCallback(() => {
		scrollToTopWeb();
		textInput.current?.blur();
		setShowAutocomplete(false);
		// Empty params resets the URL to be /search rather than /search?q=
		navigate("/search", { replace: true });
	}, [navigate]);

	const onSubmit = React.useCallback(() => {
		navigateToItem(searchText);
	}, [navigateToItem, searchText]);

	const onAutocompleteResultPress = React.useCallback(() => {
		setShowAutocomplete(false);
	}, []);

	const handleHistoryItemClick = React.useCallback(
		(item: string) => {
			setSearchText(item);
			navigateToItem(item);
		},
		[navigateToItem],
	);

	const handleProfileClick = React.useCallback(
		(profile: bsky.profile.AnyProfileView) => {
			unstableCacheProfileView(queryClient, profile);
			// Slight delay to avoid updating during push nav animation.
			setTimeout(() => {
				updateProfileHistory(profile);
			}, 400);
		},
		[updateProfileHistory, queryClient],
	);

	const onSoftReset = React.useCallback(() => {
		// Empty params resets the URL to be /search rather than /search?q=
		// const { q: _q, ...parameters } = (route.params ?? {}) as {
		// 	[key: string]: string;
		// };
		// navigation.replace(route.name, parameters);
		navigate(location.pathname);
	}, [navigate]);

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
			return listenSoftReset(onSoftReset);
		}, [onSoftReset, setMinimalShellMode]),
	);

	const onSearchInputFocus = React.useCallback(() => {
		// Prevent a jump on iPad by ensuring that
		// the initial focused render has no result list.
		requestAnimationFrame(() => {
			setShowAutocomplete(true);
		});
	}, []);

	useOnLayout((evt) => {
		setHeaderHeight(evt.height);
	}, headerRef);

	const showHeader = !gtMobile || navButton !== "menu";

	return (
		<Layout.Screen>
			<div
				ref={headerRef}
				style={{
					zIndex: 10,
					position: "sticky",
					top: 0,
				}}
			>
				<Layout.Center style={t.atoms.bg}>
					{showHeader && (
						<div
							// HACK: shift up search input. we can't remove the top padding
							// on the search input because it messes up the layout animation
							// if we add it only when the header is hidden
							style={{ marginBottom: tokens.space.xs * -1 }}
						>
							<Layout.Header.Outer noBottomBorder>
								{navButton === "menu" ? <Layout.Header.MenuButton /> : <Layout.Header.BackButton />}
								<Layout.Header.Content align="left">
									<Layout.Header.TitleText>Search</Layout.Header.TitleText>
								</Layout.Header.Content>
								{showFilters ? (
									<SearchLanguageDropdown value={params.lang} onChange={params.setLang} />
								) : (
									<Layout.Header.Slot />
								)}
							</Layout.Header.Outer>
						</div>
					)}
					<div
						style={{
							paddingLeft: 12,
							paddingRight: 12,
							paddingTop: 8,
							paddingBottom: 8,
							overflow: "hidden",
						}}
					>
						<div style={{ gap: 8 }}>
							<div
								style={{
									width: "100%",
									flexDirection: "row",
									...a.align_stretch,
									gap: 4,
								}}
							>
								<div style={{ flex: 1 }}>
									<SearchInput
										ref={textInput}
										value={searchText}
										onFocus={onSearchInputFocus}
										onChangeText={onChangeText}
										onClearText={onPressClearQuery}
										onSubmitEditing={onSubmit}
										placeholder={inputPlaceholder ?? "Search for posts, users, or feeds"}
										// TODO
										// hitSlop={{ ...HITSLOP_20, top: 0 }}
									/>
								</div>
								{showAutocomplete && (
									<Button
										label={"Cancel search"}
										size="large"
										variant="ghost"
										color="secondary"
										style={{ paddingLeft: 8, paddingRight: 8 }}
										onPress={onPressCancelSearch}
										hitSlop={HITSLOP_10}
									>
										<ButtonText>Cancel</ButtonText>
									</Button>
								)}
							</div>

							{showFilters && !showHeader && (
								<div
									style={{
										flexDirection: "row",
										alignItems: "center",
										justifyContent: "space-between",
										gap: 8,
									}}
								>
									<SearchLanguageDropdown value={params.lang} onChange={params.setLang} />
								</div>
							)}
						</div>
					</div>
				</Layout.Center>
			</div>
			<div
				style={{
					display: showAutocomplete && !fixedParams ? "flex" : "none",
					flex: 1,
				}}
			>
				{searchText.length > 0 ? (
					<AutocompleteResults
						isAutocompleteFetching={isAutocompleteFetching}
						autocompleteData={autocompleteData}
						searchText={searchText}
						onSubmit={onSubmit}
						onResultPress={onAutocompleteResultPress}
						onProfileClick={handleProfileClick}
					/>
				) : (
					<SearchHistory
						searchHistory={termHistory}
						selectedProfiles={accountHistoryProfiles?.profiles || []}
						onItemClick={handleHistoryItemClick}
						onProfileClick={handleProfileClick}
						onRemoveItemClick={deleteSearchHistoryItem}
						onRemoveProfileClick={deleteProfileHistoryItem}
					/>
				)}
			</div>
			<div
				style={{
					display: showAutocomplete ? "none" : "flex",
					flex: 1,
				}}
			>
				<SearchScreenInner query={query} queryWithParams={queryWithParams} headerHeight={headerHeight} />
			</div>
		</Layout.Screen>
	);
}

let AutocompleteResults = ({
	isAutocompleteFetching,
	autocompleteData,
	searchText,
	onSubmit,
	onResultPress,
	onProfileClick,
}: {
	isAutocompleteFetching: boolean;
	autocompleteData: AppBskyActorDefs.ProfileViewBasic[] | undefined;
	searchText: string;
	onSubmit: () => void;
	onResultPress: () => void;
	onProfileClick: (profile: AppBskyActorDefs.ProfileViewBasic) => void;
}): React.ReactNode => {
	const moderationOpts = useModerationOpts();
	return (
		<>
			{(isAutocompleteFetching && !autocompleteData?.length) || !moderationOpts ? (
				<Loader />
			) : (
				<Layout.Content
				// keyboardShouldPersistTaps="handled"
				// keyboardDismissMode="on-drag"
				>
					<SearchLinkCard
						label={`Search for "${searchText}"`}
						onPress={undefined}
						to={`/search?q=${encodeURIComponent(searchText)}`}
						style={{ borderBottomWidth: 1 }}
					/>
					{autocompleteData?.map((item) => (
						<SearchProfileCard
							key={item.did}
							profile={item}
							moderation={moderateProfile(item, moderationOpts)}
							onPress={() => {
								onProfileClick(item);
								onResultPress();
							}}
						/>
					))}
					<div style={{ height: 200 }} />
				</Layout.Content>
			)}
		</>
	);
};
AutocompleteResults = React.memo(AutocompleteResults);

function SearchHistory({
	searchHistory,
	selectedProfiles,
	onItemClick,
	onProfileClick,
	onRemoveItemClick,
	onRemoveProfileClick,
}: {
	searchHistory: string[];
	selectedProfiles: AppBskyActorDefs.ProfileViewDetailed[];
	onItemClick: (item: string) => void;
	onProfileClick: (profile: AppBskyActorDefs.ProfileViewDetailed) => void;
	onRemoveItemClick: (item: string) => void;
	onRemoveProfileClick: (profile: AppBskyActorDefs.ProfileViewDetailed) => void;
}) {
	const { gtMobile } = useBreakpoints();
	const t = useTheme();

	return (
		<Layout.Content
		// keyboardDismissMode="interactive"
		// keyboardShouldPersistTaps="handled"
		>
			<div
				style={{
					width: "100%",
					paddingLeft: 12,
					paddingRight: 12,
				}}
			>
				{(searchHistory.length > 0 || selectedProfiles.length > 0) && (
					<Text
						style={{
							fontSize: 16,
							letterSpacing: 0,
							fontWeight: "600",
							padding: 12,
						}}
					>
						Recent Searches
					</Text>
				)}
				{selectedProfiles.length > 0 && (
					<div
						style={{
							...styles.selectedProfilesContainer,
							...(!gtMobile && styles.selectedProfilesContainerMobile),
						}}
					>
						<div
							// ScrollView from react-native-gesture-handler
							// keyboardShouldPersistTaps="handled"
							// horizontal={true}
							style={{
								flexDirection: "row",
								...a.flex_nowrap,
								...{ marginLeft: tokens.space._2xl * -1, marginRight: tokens.space._2xl * -1 },
							}}
							// contentContainerStyle={[a.px_2xl, a.border_0]}
						>
							{selectedProfiles.slice(0, 5).map((profile, index) => (
								<div
									key={index}
									style={{
										...styles.profileItem,
										...(!gtMobile && styles.profileItemMobile),
									}}
								>
									<Link
										href={makeProfileLink(profile)}
										title={profile.handle}
										asAnchor
										anchorNoUnderline
										onBeforePress={() => onProfileClick(profile)}
										style={{
											alignItems: "center",
											width: "100%",
										}}
									>
										<UserAvatar
											avatar={profile.avatar}
											type={profile.associated?.labeler ? "labeler" : "user"}
											size={60}
										/>
										<Text
											style={{
												fontSize: 12,
												letterSpacing: 0,
												textAlign: "center",
												...styles.profileName,
											}}
											numberOfLines={1}
										>
											{sanitizeDisplayName(profile.displayName || profile.handle)}
										</Text>
									</Link>
									<button
										type="button"
										onClick={() => onRemoveProfileClick(profile)}
										// hitSlop={createHitslop(6)}
										style={styles.profileRemoveBtn}
									>
										<XIcon size="xs" style={t.atoms.text_contrast_low} />
									</button>
								</div>
							))}
						</div>
					</div>
				)}
				{searchHistory.length > 0 && (
					<div
						style={{
							paddingLeft: 12,
							paddingRight: 4,
							marginTop: 12,
						}}
					>
						{searchHistory.slice(0, 5).map((historyItem, index) => (
							<div
								key={index}
								style={{
									flexDirection: "row",
									alignItems: "center",
									marginTop: 4,
								}}
							>
								<button
									type="button"
									onClick={() => onItemClick(historyItem)}
									// hitSlop={HITSLOP_10}
									style={{
										flex: 1,
										paddingTop: 12,
										paddingBottom: 12,
									}}
								>
									<Text style={{ ...a.text_md }}>{historyItem}</Text>
								</button>
								<Button
									label={`Remove ${historyItem}`}
									onPress={() => onRemoveItemClick(historyItem)}
									size="small"
									variant="ghost"
									color="secondary"
									shape="round"
								>
									<ButtonIcon icon={XIcon} />
								</Button>
							</div>
						))}
					</div>
				)}
			</div>
		</Layout.Content>
	);
}

function scrollToTopWeb() {
	window.scrollTo(0, 0);
}

const styles = {
	selectedProfilesContainer: {
		marginTop: 10,
		paddingLeft: 12,
		paddingRight: 12,
		height: 80,
	},
	selectedProfilesContainerMobile: {
		height: 100,
	},
	profileItem: {
		alignItems: "center",
		marginRight: 15,
		width: 78,
	},
	profileItemMobile: {
		width: 70,
	},
	profileName: {
		width: 78,
		marginTop: 6,
	},
	profileRemoveBtn: {
		position: "absolute",
		top: 0,
		right: 5,
		backgroundColor: "white",
		borderRadius: 10,
		width: 18,
		height: 18,
		alignItems: "center",
		justifyContent: "center",
	},
} satisfies Record<string, React.CSSProperties>;
