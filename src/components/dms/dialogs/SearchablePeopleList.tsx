import { type ModerationOpts, moderateProfile } from "@atproto/api";
import type React from "react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import { atoms as a, flatten, useTheme } from "#/alf";
import { Button, ButtonIcon } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { Text } from "#/components/Typography";
import { canBeMessaged } from "#/components/dms/util";
import { useInteractionState } from "#/components/hooks/useInteractionState";
import { useOnLayout } from "#/components/hooks/useOnLayout";
import { MagnifyingGlass2_Stroke2_Corner0_Rounded as Search } from "#/components/icons/MagnifyingGlass2";
import { TimesLarge_Stroke2_Corner0_Rounded as X } from "#/components/icons/Times";
import { usePlaceholderStyle } from "#/lib/placeholderStyle";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { sanitizeHandle } from "#/lib/strings/handles";
import { hasOwn } from "#/lib/util";
import { useModerationOpts } from "#/state/preferences/moderation-opts";
import { useActorAutocompleteQuery } from "#/state/queries/actor-autocomplete";
import { useListConvosQuery } from "#/state/queries/messages/list-conversations";
import { useProfileFollowsQuery } from "#/state/queries/profile-follows";
import { useSession } from "#/state/session";
import type * as bsky from "#/types/bsky";
import type { ListMethods } from "#/view/com/util/List";
import { UserAvatar } from "#/view/com/util/UserAvatar";

type Item =
	| {
			type: "profile";
			key: string;
			enabled: boolean;
			profile: bsky.profile.AnyProfileView;
	  }
	| {
			type: "empty";
			key: string;
			message: string;
	  }
	| {
			type: "placeholder";
			key: string;
	  }
	| {
			type: "error";
			key: string;
	  };

export function SearchablePeopleList({
	title,
	onSelectChat,
	showRecentConvos,
}: {
	title: string;
	onSelectChat: (did: string) => void;
	showRecentConvos?: boolean;
}) {
	const t = useTheme();
	const moderationOpts = useModerationOpts();
	const control = Dialog.useDialogContext();
	const [headerHeight, setHeaderHeight] = useState(0);
	const listRef = useRef<ListMethods>(null);
	const { currentAccount } = useSession();
	const inputRef = useRef<HTMLInputElement>(null);

	const [searchText, setSearchText] = useState("");

	const { data: results, isError, isFetching } = useActorAutocompleteQuery(searchText, true, 12);
	const { data: follows } = useProfileFollowsQuery(currentAccount?.did);
	const { data: convos } = useListConvosQuery({ enabled: showRecentConvos });

	const items = useMemo(() => {
		let _items: Item[] = [];

		if (isError) {
			_items.push({
				type: "empty",
				key: "empty",
				message: "We're having network issues, try again",
			});
		} else if (searchText.length) {
			if (results?.length) {
				for (const profile of results) {
					if (profile.did === currentAccount?.did) continue;
					_items.push({
						type: "profile",
						key: profile.did,
						enabled: canBeMessaged(profile),
						profile,
					});
				}

				_items = _items.sort((item) => {
					return hasOwn(item, "enabled") && item.enabled ? -1 : 1;
				});
			}
		} else {
			const placeholders: Item[] = Array(10)
				.fill(0)
				.map((__, i) => ({
					type: "placeholder",
					key: `${i}`,
				}));

			if (showRecentConvos) {
				if (convos && follows) {
					const usedDids = new Set();

					for (const page of convos.pages) {
						for (const convo of page.convos) {
							const profiles = convo.members.filter((m) => m.did !== currentAccount?.did);

							for (const profile of profiles) {
								if (usedDids.has(profile.did)) continue;

								usedDids.add(profile.did);

								_items.push({
									type: "profile",
									key: profile.did,
									enabled: true,
									profile,
								});
							}
						}
					}

					let followsItems: typeof _items = [];

					for (const page of follows.pages) {
						for (const profile of page.follows) {
							if (usedDids.has(profile.did)) continue;

							followsItems.push({
								type: "profile",
								key: profile.did,
								enabled: canBeMessaged(profile),
								profile,
							});
						}
					}

					// only sort follows
					followsItems = followsItems.sort((item) => {
						return hasOwn(item, "enabled") && item.enabled ? -1 : 1;
					});

					// then append
					_items.push(...followsItems);
				} else {
					_items.push(...placeholders);
				}
			} else if (follows) {
				for (const page of follows.pages) {
					for (const profile of page.follows) {
						_items.push({
							type: "profile",
							key: profile.did,
							enabled: canBeMessaged(profile),
							profile,
						});
					}
				}

				_items = _items.sort((item) => {
					return hasOwn(item, "enabled") && item.enabled ? -1 : 1;
				});
			} else {
				_items.push(...placeholders);
			}
		}

		return _items;
	}, [searchText, results, isError, currentAccount?.did, follows, convos, showRecentConvos]);

	if (searchText && !isFetching && !items.length && !isError) {
		items.push({ type: "empty", key: "empty", message: "No results" });
	}

	const renderItems = useCallback(
		({ item }: { item: Item }) => {
			switch (item.type) {
				case "profile": {
					return (
						<ProfileCard
							key={item.key}
							enabled={item.enabled}
							profile={item.profile}
							moderationOpts={moderationOpts!}
							onPress={onSelectChat}
						/>
					);
				}
				case "placeholder": {
					return <ProfileCardSkeleton key={item.key} />;
				}
				case "empty": {
					return <Empty key={item.key} message={item.message} />;
				}
				default:
					return null;
			}
		},
		[moderationOpts, onSelectChat],
	);

	useLayoutEffect(() => {
		setTimeout(() => {
			inputRef?.current?.focus();
		}, 0);
	}, []);

	const listHeader = useMemo(() => {
		const ref = useOnLayout((evt) => setHeaderHeight(evt.height));
		return (
			<div
				ref={ref}
				style={{
					...a.relative,
					...a.pt_lg,
					...a.pb_xs,
					...a.px_lg,
					...a.border_b,
					...t.atoms.border_contrast_low,
					...t.atoms.bg,
				}}
			>
				<div
					style={{
						...a.relative,
						...a.justify_center,
					}}
				>
					<Text
						style={{
							...a.z_10,
							...a.text_lg,
							...a.font_heavy,
							...a.leading_tight,
							...t.atoms.text_contrast_high,
						}}
					>
						{title}
					</Text>
					<Button
						label={"Close"}
						size="small"
						shape="round"
						variant={"ghost"}
						color="secondary"
						style={{
							...a.absolute,
							...a.z_20,
							...{ right: -4 },
						}}
						onPress={() => control.close()}
					>
						<ButtonIcon icon={X} size="md" />
					</Button>
				</div>
				<div style={a.pt_xs}>
					<SearchInput
						inputRef={inputRef}
						value={searchText}
						onChangeText={(text) => {
							setSearchText(text);
							listRef.current?.scrollToOffset({ offset: 0, animated: false });
						}}
						onEscape={control.close}
					/>
				</div>
			</div>
		);
	}, [t.atoms.border_contrast_low, t.atoms.bg, t.atoms.text_contrast_high, title, searchText, control]);

	return (
		<Dialog.InnerFlatList
			ref={listRef}
			data={items}
			renderItem={renderItems}
			ListHeaderComponent={listHeader}
			stickyHeaderIndices={[0]}
			keyExtractor={(item: Item) => item.key}
			style={{ ...a.py_0, height: "100vh", maxHeight: 600, ...a.px_0 }}
			webInnerContentContainerStyle={a.py_0}
			webInnerStyle={flatten([a.py_0, { maxWidth: 500, minWidth: 200 }])}
			scrollIndicatorInsets={{ top: headerHeight }}
			keyboardDismissMode="on-drag"
		/>
	);
}

function ProfileCard({
	enabled,
	profile,
	moderationOpts,
	onPress,
}: {
	enabled: boolean;
	profile: bsky.profile.AnyProfileView;
	moderationOpts: ModerationOpts;
	onPress: (did: string) => void;
}) {
	const t = useTheme();
	const moderation = moderateProfile(profile, moderationOpts);
	const handle = sanitizeHandle(profile.handle, "@");
	const displayName = sanitizeDisplayName(
		profile.displayName || sanitizeHandle(profile.handle),
		moderation.ui("displayName"),
	);

	const handleOnPress = useCallback(() => {
		onPress(profile.did);
	}, [onPress, profile.did]);

	return (
		<Button disabled={!enabled} label={`Start chat with ${displayName}`} onPress={handleOnPress}>
			{({ hovered, pressed, focused }) => (
				<div
					style={{
						...a.flex_1,
						...a.py_md,
						...a.px_lg,
						...a.gap_md,
						...a.align_center,
						...a.flex_row,

						...(!enabled
							? { opacity: 0.5 }
							: pressed || focused
								? t.atoms.bg_contrast_25
								: hovered
									? t.atoms.bg_contrast_50
									: t.atoms.bg),
					}}
				>
					<UserAvatar
						size={42}
						avatar={profile.avatar}
						moderation={moderation.ui("avatar")}
						type={profile.associated?.labeler ? "labeler" : "user"}
					/>
					<div
						style={{
							...a.flex_1,
							...a.gap_2xs,
						}}
					>
						<Text
							style={{
								...t.atoms.text,
								...a.font_bold,
								...a.leading_tight,
								...a.self_start,
							}}
							numberOfLines={1}
						>
							{displayName}
						</Text>
						<Text
							style={{
								...a.leading_tight,
								...t.atoms.text_contrast_high,
							}}
							numberOfLines={2}
						>
							{!enabled ? <>{handle} can't be messaged</> : handle}
						</Text>
					</div>
				</div>
			)}
		</Button>
	);
}

function ProfileCardSkeleton() {
	const t = useTheme();

	return (
		<div
			style={{
				...a.flex_1,
				...a.py_md,
				...a.px_lg,
				...a.gap_md,
				...a.align_center,
				...a.flex_row,
			}}
		>
			<div
				style={{
					...a.rounded_full,
					...{ width: 42, height: 42 },
					...t.atoms.bg_contrast_25,
				}}
			/>
			<div
				style={{
					...a.flex_1,
					...a.gap_sm,
				}}
			>
				<div
					style={{
						...a.rounded_xs,
						...{ width: 80, height: 14 },
						...t.atoms.bg_contrast_25,
					}}
				/>
				<div
					style={{
						...a.rounded_xs,
						...{ width: 120, height: 10 },
						...t.atoms.bg_contrast_25,
					}}
				/>
			</div>
		</div>
	);
}

function Empty({ message }: { message: string }) {
	const t = useTheme();
	return (
		<div
			style={{
				...a.p_lg,
				...a.py_xl,
				...a.align_center,
				...a.gap_md,
			}}
		>
			<Text
				style={{
					...a.text_sm,
					...a.italic,
					...t.atoms.text_contrast_high,
				}}
			>
				{message}
			</Text>
			<Text
				style={{
					...a.text_xs,
					...t.atoms.text_contrast_low,
				}}
			>
				(╯°□°)╯︵ ┻━┻
			</Text>
		</div>
	);
}

function SearchInput({
	value,
	onChangeText,
	onEscape,
	inputRef,
}: {
	value: string;
	onChangeText: (text: string) => void;
	onEscape: () => void;
	inputRef: React.RefObject<HTMLInputElement>;
}) {
	const t = useTheme();
	const { state: hovered, onIn: onMouseEnter, onOut: onMouseLeave } = useInteractionState();
	const { state: focused, onIn: onFocus, onOut: onBlur } = useInteractionState();
	const interacted = hovered || focused;
	const phStyleCName = usePlaceholderStyle(t.palette.contrast_500);

	return (
		<div
			{...{
				onMouseEnter,
				onMouseLeave,
			}}
			style={{
				...a.flex_row,
				...a.align_center,
				...a.gap_sm,
			}}
		>
			<Search size="md" fill={interacted ? t.palette.primary_500 : t.palette.contrast_300} />
			<input
				type="text"
				ref={inputRef}
				placeholder={"Search"}
				value={value}
				onChange={(ev) => onChangeText(ev.target.value)}
				onFocus={onFocus}
				onBlur={onBlur}
				style={{
					...a.flex_1,
					...a.py_md,
					...a.text_md,
					...t.atoms.text,
				}}
				className={phStyleCName}
				enterKeyHint="search"
				// clearButtonMode="while-editing"
				maxLength={50}
				onKeyDown={({ nativeEvent }) => {
					if (nativeEvent.key === "Escape") {
						onEscape();
					}
				}}
				autoCorrect={"off"}
				autoComplete="off"
				autoCapitalize="none"
				// biome-ignore lint/a11y/noAutofocus: <explanation>
				autoFocus
			/>
		</div>
	);
}
