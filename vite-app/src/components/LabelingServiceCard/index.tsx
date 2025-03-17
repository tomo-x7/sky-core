import type { AppBskyLabelerDefs } from "@atproto/api";
import type React from "react";

import { type ViewStyleProp, atoms as a, useTheme } from "#/alf";
import { Link as InternalLink, type LinkProps } from "#/components/Link";
import { RichText } from "#/components/RichText";
import { Text } from "#/components/Typography";
import { Flag_Stroke2_Corner0_Rounded as Flag } from "#/components/icons/Flag";
import { getLabelingServiceTitle } from "#/lib/moderation";
import { sanitizeHandle } from "#/lib/strings/handles";
import { useLabelerInfoQuery } from "#/state/queries/labeler";
import { UserAvatar } from "#/view/com/util/UserAvatar";
import { ChevronRight_Stroke2_Corner0_Rounded as ChevronRight } from "../icons/Chevron";

type LabelingServiceProps = {
	labeler: AppBskyLabelerDefs.LabelerViewDetailed;
};

export function Outer({ children, style }: React.PropsWithChildren<ViewStyleProp>) {
	return (
		<div
			style={{
				...a.flex_row,
				...a.gap_md,
				...a.w_full,
				...a.p_lg,
				...a.pr_md,
				...a.overflow_hidden,
				...style,
			}}
		>
			{children}
		</div>
	);
}

export function Avatar({ avatar }: { avatar?: string }) {
	return <UserAvatar type="labeler" size={40} avatar={avatar} />;
}

export function Title({ value }: { value: string }) {
	return (
		<Text
			emoji
			style={{
				...a.text_md,
				...a.font_bold,
				...a.leading_tight,
			}}
		>
			{value}
		</Text>
	);
}

export function Description({ value, handle }: { value?: string; handle: string }) {
	return value ? (
		<Text numberOfLines={2}>
			<RichText value={value} style={a.leading_snug} />
		</Text>
	) : (
		<Text emoji style={a.leading_snug}>
			{`By ${sanitizeHandle(handle, "@")}`}
		</Text>
	);
}

export function RegionalNotice() {
	const t = useTheme();
	return (
		<div
			style={{
				...a.flex_row,
				...a.align_center,
				...a.gap_xs,
				...a.pt_2xs,
				...{ marginLeft: -2 },
			}}
		>
			<Flag fill={t.atoms.text_contrast_low.color} size="sm" />
			<Text
				style={{
					...a.italic,
					...a.leading_snug,
				}}
			>
				Required in your region
			</Text>
		</div>
	);
}

export function LikeCount({ likeCount }: { likeCount: number }) {
	const t = useTheme();
	return (
		<Text
			style={{
				...a.mt_sm,
				...a.text_sm,
				...t.atoms.text_contrast_medium,
				...{ fontWeight: "600" },
			}}
		>
			Liked by {likeCount} {likeCount === 1 ? "user" : "users"}
		</Text>
	);
}

export function Content({ children }: React.PropsWithChildren) {
	const t = useTheme();

	return (
		<div
			style={{
				...a.flex_1,
				...a.flex_row,
				...a.gap_md,
				...a.align_center,
				...a.justify_between,
			}}
		>
			<div
				style={{
					...a.gap_2xs,
					...a.flex_1,
				}}
			>
				{children}
			</div>
			<ChevronRight
				size="md"
				style={{
					...a.z_10,
					...t.atoms.text_contrast_low,
				}}
			/>
		</div>
	);
}

/**
 * The canonical view for a labeling service. Use this or compose your own.
 */
export function Default({ labeler, style }: LabelingServiceProps & ViewStyleProp) {
	return (
		<Outer style={style}>
			<Avatar avatar={labeler.creator.avatar} />
			<Content>
				<Title
					value={getLabelingServiceTitle({
						displayName: labeler.creator.displayName,
						handle: labeler.creator.handle,
					})}
				/>
				<Description value={labeler.creator.description} handle={labeler.creator.handle} />
				{labeler.likeCount ? <LikeCount likeCount={labeler.likeCount} /> : null}
			</Content>
		</Outer>
	);
}

export function Link({ children, labeler }: LabelingServiceProps & Pick<LinkProps, "children">) {
	return (
		<InternalLink
			to={{
				screen: "Profile",
				params: {
					name: labeler.creator.handle,
				},
			}}
			label={`View the labeling service provided by @${labeler.creator.handle}`}
		>
			{children}
		</InternalLink>
	);
}

// TODO not finished yet
export function DefaultSkeleton() {
	return (
		<div>
			<Text>Loading</Text>
		</div>
	);
}

export function Loader({
	did,
	loading: LoadingComponent = DefaultSkeleton,
	error: ErrorComponent,
	component: Component,
}: {
	did: string;
	loading?: React.ComponentType;
	error?: React.ComponentType<{ error: string }>;
	component: React.ComponentType<{
		labeler: AppBskyLabelerDefs.LabelerViewDetailed;
	}>;
}) {
	const { isLoading, data, error } = useLabelerInfoQuery({ did });

	return isLoading ? (
		LoadingComponent ? (
			<LoadingComponent />
		) : null
	) : error || !data ? (
		ErrorComponent ? (
			<ErrorComponent error={error?.message || "Unknown error"} />
		) : null
	) : (
		<Component labeler={data} />
	);
}
