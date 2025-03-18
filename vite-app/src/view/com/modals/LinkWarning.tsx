import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { StyleSheet } from "react-native";

import { Text } from "#/components/Typography";
import { useOpenLink } from "#/lib/hooks/useOpenLink";
import { usePalette } from "#/lib/hooks/usePalette";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { SafeAreaView } from "#/lib/safe-area-context";
import { shareUrl } from "#/lib/sharing";
import { isPossiblyAUrl, splitApexDomain } from "#/lib/strings/url-helpers";
import { colors, s } from "#/lib/styles";
import { useModalControls } from "#/state/modals";
import { Button } from "#/view/com/util/forms/Button";
import { ScrollView } from "./util";

export const snapPoints = ["50%"];

export function Component({
	text,
	href,
	share,
}: {
	text: string;
	href: string;
	share?: boolean;
}) {
	const pal = usePalette("default");
	const { closeModal } = useModalControls();
	const { isMobile } = useWebMediaQueries();
	const potentiallyMisleading = isPossiblyAUrl(text);
	const openLink = useOpenLink();

	const onPressVisit = () => {
		closeModal();
		if (share) {
			shareUrl(href);
		} else {
			openLink(href);
		}
	};

	return (
		<SafeAreaView
			style={{
				...s.flex1,
				...pal.view,
			}}
		>
			<ScrollView
				style={{
					...s.flex1,
					...(isMobile && { paddingHorizontal: 18 }),
				}}
			>
				<div style={styles.titleSection}>
					{potentiallyMisleading ? (
						<>
							{/* @ts-expect-error */}
							<FontAwesomeIcon icon="circle-exclamation" color={pal.colors.text} size={18} />
							<Text
								type="title-lg"
								style={{
									...pal.text,
									...styles.title,
								}}
							>
								Potentially Misleading Link
							</Text>
						</>
					) : (
						<Text
							type="title-lg"
							style={{
								...pal.text,
								...styles.title,
							}}
						>
							Leaving Bluesky
						</Text>
					)}
				</div>

				<div style={{ gap: 10 }}>
					<Text type="lg" style={pal.text}>
						This link is taking you to the following website:
					</Text>

					<LinkBox href={href} />

					{potentiallyMisleading && (
						<Text type="lg" style={pal.text}>
							Make sure this is where you intend to go!
						</Text>
					)}
				</div>

				<div
					style={{
						...styles.btnContainer,
						...(isMobile && { paddingBottom: 40 }),
					}}
				>
					<Button
						type="primary"
						onPress={onPressVisit}
						accessibilityLabel={share ? "Share Link" : "Visit Site"}
						accessibilityHint={share ? "Shares the linked website" : "Opens the linked website"}
						label={share ? "Share Link" : "Visit Site"}
						labelContainerStyle={{ justifyContent: "center", padding: 4 }}
						labelStyle={s.f18}
					/>
					<Button
						type="default"
						onPress={() => {
							closeModal();
						}}
						accessibilityLabel={"Cancel"}
						accessibilityHint={"Cancels opening the linked website"}
						label={"Cancel"}
						labelContainerStyle={{ justifyContent: "center", padding: 4 }}
						labelStyle={s.f18}
					/>
				</div>
			</ScrollView>
		</SafeAreaView>
	);
}

function LinkBox({ href }: { href: string }) {
	const pal = usePalette("default");
	const [scheme, hostname, rest] = React.useMemo(() => {
		try {
			const urlp = new URL(href);
			const [subdomain, apexdomain] = splitApexDomain(urlp.hostname);
			return [`${urlp.protocol}//${subdomain}`, apexdomain, urlp.pathname + urlp.search + urlp.hash];
		} catch {
			return ["", href, ""];
		}
	}, [href]);
	return (
		<div
			style={{
				...pal.view,
				...pal.border,
				...styles.linkBox,
			}}
		>
			<Text type="lg" style={pal.textLight}>
				{scheme}
				<Text type="lg-bold" style={pal.text}>
					{hostname}
				</Text>
				{rest}
			</Text>
		</div>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingBottom: 0,
	},
	titleSection: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 6,
		paddingTop: 0,
		paddingBottom: 14,
	},
	title: {
		textAlign: "center",
		fontWeight: "600",
	},
	linkBox: {
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 6,
		borderWidth: 1,
	},
	btn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 32,
		padding: 14,
		backgroundColor: colors.blue3,
	},
	btnContainer: {
		paddingTop: 20,
		gap: 6,
	},
});
