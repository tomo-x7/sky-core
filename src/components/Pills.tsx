import { BSKY_LABELER_DID, type ModerationCause } from "@atproto/api";
import React from "react";

import { type ViewStyleProp, atoms as a, flatten, useTheme } from "#/alf";
import { Button } from "#/components/Button";
import { Text } from "#/components/Typography";
import { ModerationDetailsDialog } from "#/components/moderation/ModerationDetailsDialog";
import { useModerationCauseDescription } from "#/lib/moderation/useModerationCauseDescription";
import { UserAvatar } from "#/view/com/util/UserAvatar";
import { useDialogControl } from "./Dialog";

export type AppModerationCause =
	| ModerationCause
	| {
			type: "reply-hidden";
			source: { type: "user"; did: string };
			priority: 6;
			downgraded?: boolean;
	  };

export type CommonProps = {
	size?: "sm" | "lg";
};

export function Row({
	children,
	style,
	size = "sm",
}: { children: React.ReactNode | React.ReactNode[] } & CommonProps & ViewStyleProp) {
	const styles = React.useMemo(() => {
		switch (size) {
			case "lg":
				return [{ gap: 5 }];
			default:
				return [{ gap: 3 }];
		}
	}, [size]);
	return (
		<div
			style={{
				flexDirection: "row",
				flexWrap: "wrap",
				gap: 4,
				...flatten(styles),
				...style,
			}}
		>
			{children}
		</div>
	);
}

export type LabelProps = {
	cause: AppModerationCause;
	disableDetailsDialog?: boolean;
	noBg?: boolean;
} & CommonProps;

export function Label({ cause, size = "sm", disableDetailsDialog, noBg }: LabelProps) {
	const t = useTheme();
	const control = useDialogControl();
	const desc = useModerationCauseDescription(cause);
	const isLabeler = Boolean(desc.sourceType && desc.sourceDid);
	const isBlueskyLabel = desc.sourceType === "labeler" && desc.sourceDid === BSKY_LABELER_DID;

	const { outer, avi, text } = React.useMemo(() => {
		switch (size) {
			case "lg": {
				return {
					outer: [
						t.atoms.bg_contrast_25,
						{
							gap: 5,
							paddingLeft: 5,
							paddingRight: 5,
							paddingTop: 5,
							paddingBottom: 5,
						},
					],
					avi: 16,
					text: [a.text_sm],
				};
			}
			default: {
				return {
					outer: [
						!noBg ? t.atoms.bg_contrast_25 : {},
						{
							gap: 3,
							paddingLeft: 3,
							paddingRight: 3,
							paddingTop: 3,
							paddingBottom: 3,
						},
					],
					avi: 12,
					text: [a.text_xs],
				};
			}
		}
	}, [t, size, noBg]);

	return (
		<>
			<Button
				disabled={disableDetailsDialog}
				label={desc.name}
				onPress={(e) => {
					e.preventDefault();
					e.stopPropagation();
					control.open();
				}}
			>
				{({ hovered, pressed }) => (
					<div
						style={{
							flexDirection: "row",
							alignItems: "center",
							borderRadius: 999,
							...flatten(outer),
							...((hovered || pressed) && t.atoms.bg_contrast_50),
						}}
					>
						{isBlueskyLabel || !isLabeler ? (
							<desc.icon width={avi} fill={t.atoms.text_contrast_medium.color} />
						) : (
							<UserAvatar avatar={desc.sourceAvi} type="user" size={avi} />
						)}

						<Text
							style={{
								...flatten(text),
								fontWeight: "600",
								lineHeight: 1.15,
								...t.atoms.text_contrast_medium,
								paddingRight: 3,
							}}
						>
							{desc.name}
						</Text>
					</div>
				)}
			</Button>
			{!disableDetailsDialog && <ModerationDetailsDialog control={control} modcause={cause} />}
		</>
	);
}

export function FollowsYou({ size = "sm" }: CommonProps) {
	const t = useTheme();

	const variantStyles = React.useMemo(() => {
		switch (size) {
			default:
				return [
					{
						paddingLeft: 6,
						paddingRight: 6,
						paddingTop: 3,
						paddingBottom: 3,
						borderRadius: 4,
					},
				];
		}
	}, [size]);

	return (
		<div
			style={{
				...flatten(variantStyles),
				justifyContent: "center",
				...t.atoms.bg_contrast_25,
			}}
		>
			<Text
				style={{
					fontSize: 12,
					letterSpacing: 0,
					lineHeight: 1.15,
				}}
			>
				Follows You
			</Text>
		</div>
	);
}
