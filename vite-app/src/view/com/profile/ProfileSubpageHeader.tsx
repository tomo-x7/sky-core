import type { AppBskyGraphDefs } from "@atproto/api";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { type MeasuredDimensions, runOnJS, runOnUI } from "react-native-reanimated";

import * as Layout from "#/components/Layout";
import { Text } from "#/components/Typography";
import { StarterPack } from "#/components/icons/StarterPack";
import { measureHandle, useHandleRef } from "#/lib/hooks/useHandleRef";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { makeProfileLink } from "#/lib/routes/links";
import type { NavigationProp } from "#/lib/routes/types";
import { sanitizeHandle } from "#/lib/strings/handles";
import { emitSoftReset } from "#/state/events";
import { useLightboxControls } from "#/state/lightbox";
import { TextLink } from "#/view/com/util/Link";
import { LoadingPlaceholder } from "#/view/com/util/LoadingPlaceholder";
import { UserAvatar, type UserAvatarType } from "#/view/com/util/UserAvatar";

export function ProfileSubpageHeader({
	isLoading,
	href,
	title,
	avatar,
	isOwner,
	purpose,
	creator,
	avatarType,
	children,
}: React.PropsWithChildren<{
	isLoading?: boolean;
	href: string;
	title: string | undefined;
	avatar: string | undefined;
	isOwner: boolean | undefined;
	purpose: AppBskyGraphDefs.ListPurpose | undefined;
	creator:
		| {
				did: string;
				handle: string;
		  }
		| undefined;
	avatarType: UserAvatarType | "starter-pack";
}>) {
	const navigation = useNavigation<NavigationProp>();
	const { isMobile } = useWebMediaQueries();
	const { openLightbox } = useLightboxControls();
	const pal = usePalette("default");
	const canGoBack = navigation.canGoBack();
	const aviRef = useHandleRef();

	const _openLightbox = React.useCallback(
		(uri: string, thumbRect: MeasuredDimensions | null) => {
			openLightbox({
				images: [
					{
						uri,
						thumbUri: uri,
						thumbRect,
						dimensions: {
							// It's fine if it's actually smaller but we know it's 1:1.
							height: 1000,
							width: 1000,
						},
						thumbDimensions: null,
						type: "rect-avi",
					},
				],
				index: 0,
			});
		},
		[openLightbox],
	);

	const onPressAvi = React.useCallback(() => {
		if (
			avatar // TODO && !(view.moderation.avatar.blur && view.moderation.avatar.noOverride)
		) {
			const aviHandle = aviRef.current;
			runOnUI(() => {
				"worklet";
				const rect = measureHandle(aviHandle);
				runOnJS(_openLightbox)(avatar, rect);
			})();
		}
	}, [_openLightbox, avatar, aviRef]);

	return (
		<>
			<Layout.Header.Outer>
				{canGoBack ? <Layout.Header.BackButton /> : <Layout.Header.MenuButton />}
				<Layout.Header.Content />
				{children}
			</Layout.Header.Outer>
			<div
				style={{
					flexDirection: "row",
					alignItems: "flex-start",
					gap: 10,
					padding: `14px ${isMobile ? 12 : 14}px`,
				}}
			>
				<div ref={aviRef}>
					<button type="button" onClick={onPressAvi} style={{ width: 58 }}>
						{avatarType === "starter-pack" ? (
							<StarterPack width={58} gradient="sky" />
						) : (
							<UserAvatar type={avatarType} size={58} avatar={avatar} />
						)}
					</button>
				</div>
				<div style={{ flex: 1, gap: 4 }}>
					{isLoading ? (
						<LoadingPlaceholder width={200} height={32} style={{ marginTop: 6, marginBottom: 6 }} />
					) : (
						<TextLink
							type="title-xl"
							href={href}
							style={{
								...pal.text,
								...{ fontWeight: "600" },
							}}
							text={title || ""}
							onPress={emitSoftReset}
							numberOfLines={4}
						/>
					)}

					{isLoading || !creator ? (
						<LoadingPlaceholder width={50} height={8} />
					) : (
						<Text type="lg" style={pal.textLight} numberOfLines={1}>
							{purpose === "app.bsky.graph.defs#curatelist" ? (
								isOwner ? (
									<>List by you</>
								) : (
									<>
										List by{" "}
										<TextLink
											text={sanitizeHandle(creator.handle || "", "@")}
											href={makeProfileLink(creator)}
											style={pal.textLight}
										/>
									</>
								)
							) : purpose === "app.bsky.graph.defs#modlist" ? (
								isOwner ? (
									<>Moderation list by you</>
								) : (
									<>
										Moderation list by{" "}
										<TextLink
											text={sanitizeHandle(creator.handle || "", "@")}
											href={makeProfileLink(creator)}
											style={pal.textLight}
										/>
									</>
								)
							) : purpose === "app.bsky.graph.defs#referencelist" ? (
								isOwner ? (
									<>Starter pack by you</>
								) : (
									<>
										Starter pack by{" "}
										<TextLink
											text={sanitizeHandle(creator.handle || "", "@")}
											href={makeProfileLink(creator)}
											style={pal.textLight}
										/>
									</>
								)
							) : null}
						</Text>
					)}
				</div>
			</div>
		</>
	);
}
