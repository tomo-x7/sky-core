import type { TypographyVariant } from "#/lib/ThemeContext";
import { sanitizeDisplayName } from "#/lib/strings/display-names";
import { useFeedSourceInfoQuery } from "#/state/queries/feed";
import { TextLink } from "./Link";
import { LoadingPlaceholder } from "./LoadingPlaceholder";

export function FeedNameText({
	type = "md",
	uri,
	href,
	lineHeight,
	numberOfLines,
	style,
}: {
	type?: TypographyVariant;
	uri: string;
	href: string;
	lineHeight?: number;
	numberOfLines?: number;
	style?: React.CSSProperties;
}) {
	const { data, isError } = useFeedSourceInfoQuery({ uri });

	let inner;
	if (data?.displayName || isError) {
		const displayName = data?.displayName || uri.split("/").pop() || "";
		inner = (
			<TextLink
				type={type}
				style={style}
				lineHeight={lineHeight}
				numberOfLines={numberOfLines}
				href={href}
				text={sanitizeDisplayName(displayName)}
			/>
		);
	} else {
		inner = <LoadingPlaceholder width={80} height={8} style={styles.loadingPlaceholder} />;
	}

	return inner;
}

const styles = {
	loadingPlaceholder: { position: "relative", top: 1, left: 2 },
} satisfies Record<string, React.CSSProperties>;
