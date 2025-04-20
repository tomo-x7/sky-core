import type { AppBskyActorDefs, ModerationCause, ModerationUI } from "@atproto/api";
import { useQueryClient } from "@tanstack/react-query";
import React, { type ComponentProps } from "react";

import { useTheme } from "#/alf";
import { Text } from "#/components/Typography";
import { ModerationDetailsDialog } from "#/components/moderation/ModerationDetailsDialog";
import { useModerationCauseDescription } from "#/lib/moderation/useModerationCauseDescription";
import { precacheProfile } from "#/state/queries/profile";
// import {Link} from '#/components/Link' TODO this imposes some styles that screw things up
import { Link } from "#/view/com/util/Link";
import { useDialogControl } from "../Dialog";

interface Props extends ComponentProps<typeof Link> {
	disabled: boolean;
	iconSize: number;
	iconStyles: React.CSSProperties;
	modui: ModerationUI;
	profile: AppBskyActorDefs.ProfileViewBasic;
	interpretFilterAsBlur?: boolean;
}

export function PostHider({
	href,
	disabled,
	modui,
	style,
	children,
	iconSize,
	iconStyles,
	profile,
	interpretFilterAsBlur,
	...props
}: Props) {
	const queryClient = useQueryClient();
	const t = useTheme();
	const [override, setOverride] = React.useState(false);
	const control = useDialogControl();
	const blur = modui.blurs[0] || (interpretFilterAsBlur ? getBlurrableFilter(modui) : undefined);
	const desc = useModerationCauseDescription(blur);

	const onBeforePress = React.useCallback(() => {
		precacheProfile(queryClient, profile);
	}, [queryClient, profile]);

	if (!blur || (disabled && !modui.noOverride)) {
		return (
			<Link style={style} href={href} onBeforePress={onBeforePress} {...props}>
				{children}
			</Link>
		);
	}

	return !override ? (
		<button
			type="button"
			onClick={() => {
				if (!modui.noOverride) {
					setOverride((v) => !v);
				}
			}}
			style={{
				flexDirection: "row",
				alignItems: "center",
				gap: 8,
				paddingTop: 12,
				paddingBottom: 12,

				...{
					paddingLeft: 6,
					paddingRight: 18,
				},

				...(override ? { paddingBottom: 0 } : undefined),
				...t.atoms.bg,
			}}
		>
			<ModerationDetailsDialog control={control} modcause={blur} />
			<button
				type="button"
				onClick={() => {
					control.open();
				}}
			>
				<div
					style={{
						...t.atoms.bg_contrast_25,
						alignItems: "center",
						justifyContent: "center",

						...{
							width: iconSize,
							height: iconSize,
							borderRadius: iconSize,
						},

						...iconStyles,
					}}
				>
					<desc.icon size="sm" fill={t.atoms.text_contrast_medium.color} />
				</div>
			</button>
			<Text
				style={{
					...t.atoms.text_contrast_medium,
					flex: 1,
				}}
				numberOfLines={1}
			>
				{desc.name}
			</Text>
			{!modui.noOverride && (
				<Text style={{ color: t.palette.primary_500 }}>{override ? <>Hide</> : <>Show</>}</Text>
			)}
		</button>
	) : (
		<Link style={{ ...style, ...styles.child }} href={href} {...props}>
			{children}
		</Link>
	);
}

function getBlurrableFilter(modui: ModerationUI): ModerationCause | undefined {
	// moderation causes get "downgraded" when they originate from embedded content
	// a downgraded cause should *only* drive filtering in feeds, so we want to look
	// for filters that arent downgraded
	return modui.filters.find((filter) => !filter.downgraded);
}

const styles = {
	child: {
		borderWidth: 0,
		borderTopWidth: 0,
		borderRadius: 8,
	},
} satisfies Record<string, React.CSSProperties>;
