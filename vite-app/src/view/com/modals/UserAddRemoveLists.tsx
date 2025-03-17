import type { AppBskyGraphDefs as GraphDefs } from "@atproto/api";
import React, { useCallback } from "react";
import { ActivityIndicator, StyleSheet, useWindowDimensions } from "react-native";

import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { cleanError } from "#/lib/strings/errors";
import { sanitizeHandle } from "#/lib/strings/handles";
import { s } from "#/lib/styles";
import { isMobileWeb } from "#/platform/detection";
import { useModalControls } from "#/state/modals";
import {
	type ListMembersip,
	getMembership,
	useDangerousListMembershipsQuery,
	useListMembershipAddMutation,
	useListMembershipRemoveMutation,
} from "#/state/queries/list-memberships";
import { useSession } from "#/state/session";
import { MyLists } from "../lists/MyLists";
import * as Toast from "../util/Toast";
import { UserAvatar } from "../util/UserAvatar";
import { Button } from "../util/forms/Button";

export const snapPoints = ["fullscreen"];

export function Component({
	subject,
	handle,
	displayName,
	onAdd,
	onRemove,
}: {
	subject: string;
	handle: string;
	displayName: string;
	onAdd?: (listUri: string) => void;
	onRemove?: (listUri: string) => void;
}) {
	const { closeModal } = useModalControls();
	const pal = usePalette("default");
	const { height: screenHeight } = useWindowDimensions();
	const { data: memberships } = useDangerousListMembershipsQuery();

	const onPressDone = useCallback(() => {
		closeModal();
	}, [closeModal]);

	const listStyle = React.useMemo(() => {
		if (isMobileWeb) {
			return { ...pal.border, height: screenHeight / 2 };
		} else {
			return { ...pal.border, height: screenHeight / 1.5 };
		}
	}, [pal.border, screenHeight]);

	const headerStyles: React.CSSProperties = {
		textAlign: "center",
		fontWeight: "600",
		fontSize: 20,
		marginBottom: 12,
		paddingLeft: 12,
		paddingRight: 12,
		...pal.text,
	};

	return (
		<div style={s.hContentRegion}>
			<Text style={headerStyles} numberOfLines={1}>
				<>
					Update{" "}
					<Text style={headerStyles} numberOfLines={1}>
						{displayName}
					</Text>{" "}
					in Lists
				</>
			</Text>
			<MyLists
				filter="all"
				inline
				renderItem={(list, index) => (
					<ListItem
						key={list.uri}
						index={index}
						list={list}
						memberships={memberships}
						subject={subject}
						handle={handle}
						onAdd={onAdd}
						onRemove={onRemove}
					/>
				)}
				style={listStyle}
			/>
			<div
				style={{
					...styles.btns,
					...pal.border,
				}}
			>
				<Button
					type="default"
					onPress={onPressDone}
					style={styles.footerBtn}
					accessibilityLabel={"Done"}
					accessibilityHint=""
					onAccessibilityEscape={onPressDone}
					label={"Done"}
				/>
			</div>
		</div>
	);
}

function ListItem({
	index,
	list,
	memberships,
	subject,
	handle,
	onAdd,
	onRemove,
}: {
	index: number;
	list: GraphDefs.ListView;
	memberships: ListMembersip[] | undefined;
	subject: string;
	handle: string;
	onAdd?: (listUri: string) => void;
	onRemove?: (listUri: string) => void;
}) {
	const pal = usePalette("default");
	const { currentAccount } = useSession();
	const [isProcessing, setIsProcessing] = React.useState(false);
	const membership = React.useMemo(
		() => getMembership(memberships, list.uri, subject),
		[memberships, list.uri, subject],
	);
	const listMembershipAddMutation = useListMembershipAddMutation();
	const listMembershipRemoveMutation = useListMembershipRemoveMutation();

	const onToggleMembership = useCallback(async () => {
		if (typeof membership === "undefined") {
			return;
		}
		setIsProcessing(true);
		try {
			if (membership === false) {
				await listMembershipAddMutation.mutateAsync({
					listUri: list.uri,
					actorDid: subject,
				});
				Toast.show("Added to list");
				onAdd?.(list.uri);
			} else {
				await listMembershipRemoveMutation.mutateAsync({
					listUri: list.uri,
					actorDid: subject,
					membershipUri: membership,
				});
				Toast.show("Removed from list");
				onRemove?.(list.uri);
			}
		} catch (e) {
			Toast.show(cleanError(e), "xmark");
		} finally {
			setIsProcessing(false);
		}
	}, [list, subject, membership, onAdd, onRemove, listMembershipAddMutation, listMembershipRemoveMutation]);

	return (
		<div
			style={{
				...styles.listItem,
				...pal.border,
				...(index !== 0 && { borderTopWidth: StyleSheet.hairlineWidth }),
			}}
		>
			<div style={styles.listItemAvi}>
				<UserAvatar size={40} avatar={list.avatar} type="list" />
			</div>
			<div style={styles.listItemContent}>
				<Text
					type="lg"
					style={{
						...s.bold,
						...pal.text,
					}}
					numberOfLines={1}
					lineHeight={1.2}
				>
					{sanitizeDisplayName(list.name)}
				</Text>
				<Text type="md" style={pal.textLight} numberOfLines={1}>
					{list.purpose === "app.bsky.graph.defs#curatelist" &&
						(list.creator.did === currentAccount?.did ? (
							<>User list by you</>
						) : (
							<>User list by {sanitizeHandle(list.creator.handle, "@")}</>
						))}
					{list.purpose === "app.bsky.graph.defs#modlist" &&
						(list.creator.did === currentAccount?.did ? (
							<>Moderation list by you</>
						) : (
							<>Moderation list by {sanitizeHandle(list.creator.handle, "@")}</>
						))}
				</Text>
			</div>
			<div>
				{isProcessing || typeof membership === "undefined" ? (
					<ActivityIndicator />
				) : (
					<Button
						type="default"
						label={membership === false ? "Add" : "Remove"}
						onPress={onToggleMembership}
					/>
				)}
			</div>
		</div>
	);
}

const styles: Record<string, React.CSSProperties> = {
	container: {
		paddingLeft: 0,
		paddingRight: 0,
	},
	btns: {
		position: "relative",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
		paddingTop: 10,
		paddingBottom: 0,
		borderTopWidth: StyleSheet.hairlineWidth,
	},
	footerBtn: {
		padding: "12px 24px",
	},

	listItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: "10px 14px",
	},
	listItemAvi: {
		width: 54,
		paddingLeft: 4,
		paddingTop: 8,
		paddingBottom: 10,
	},
	listItemContent: {
		flex: 1,
		paddingRight: 10,
		paddingTop: 10,
		paddingBottom: 10,
	},
	checkbox: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		width: 24,
		height: 24,
		borderRadius: 6,
		marginRight: 8,
	},
	loadingContainer: {
		position: "absolute",
		top: 10,
		right: 0,
		bottom: 0,
		justifyContent: "center",
	},
};
