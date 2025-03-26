import { useNavigate } from "react-router-dom";
import { atoms as a, flatten, useTheme } from "#/alf";
import { InlineLinkText, createStaticClick } from "#/components/Link";
import { emitSoftReset } from "#/state/events";
import { usePinnedFeedsInfos } from "#/state/queries/feed";
import { useSelectedFeed, useSetSelectedFeed } from "#/state/shell/selected-feed";

export function DesktopFeeds() {
	const t = useTheme();
	const { data: pinnedFeedInfos, error, isLoading } = usePinnedFeedsInfos();
	const selectedFeed = useSelectedFeed();
	const setSelectedFeed = useSetSelectedFeed();
	const navigate = useNavigate();
	// TODO!!
	const isHome = false; //useMatch(routes.Home);

	if (isLoading) {
		return (
			<div
				style={{
					gap: 12,
				}}
			>
				{Array(5)
					.fill(0)
					.map((_, i) => (
						<div
							key={i}
							style={{
								...a.rounded_sm,
								...t.atoms.bg_contrast_25,

								...{
									height: 16,
									width: i % 2 === 0 ? "60%" : "80%",
								},
							}}
						/>
					))}
			</div>
		);
	}

	if (error || !pinnedFeedInfos) {
		return null;
	}

	return (
		<div
			style={{
				gap: 10,
				/*
				 * Small padding prevents overflow prior to actually overflowing the
				 * height of the screen with lots of feeds.
				 */
				paddingTop: 2,
				paddingBottom: 2,
				overflowY: "auto",
			}}
		>
			{pinnedFeedInfos.map((feedInfo) => {
				const feed = feedInfo.feedDescriptor;
				const current = isHome && feed === selectedFeed;

				return (
					<InlineLinkText
						key={feedInfo.uri}
						label={feedInfo.displayName}
						{...createStaticClick(() => {
							setSelectedFeed(feed);
							navigate("/");
							if (isHome && feed === selectedFeed) {
								emitSoftReset();
							}
						})}
						style={{
							...a.text_md,
							...a.leading_snug,
							...flatten(current ? [a.font_bold, t.atoms.text] : [t.atoms.text_contrast_medium]),
						}}
						// TODO
						// numberOfLines={1}
					>
						{feedInfo.displayName}
					</InlineLinkText>
				);
			})}
			<InlineLinkText
				to="/feeds"
				label={"More feeds"}
				style={{
					...a.text_md,
					...a.leading_snug,
				}}
				// TODO
				// numberOfLines={1}
			>
				{"More feeds"}
			</InlineLinkText>
		</div>
	);
}
