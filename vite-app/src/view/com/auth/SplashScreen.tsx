import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

import { atoms as a, useTheme } from "#/alf";
import { AppLanguageDropdown } from "#/components/AppLanguageDropdown";
import { Button, ButtonText } from "#/components/Button";
import * as Layout from "#/components/Layout";
import { InlineLinkText } from "#/components/Link";
import { Text } from "#/components/Typography";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { AppClipOverlay } from "#/screens/StarterPack/StarterPackLandingScreen";
import { useKawaiiMode } from "#/state/preferences/kawaii";
import { ErrorBoundary } from "#/view/com/util/ErrorBoundary";
import { Logo } from "#/view/icons/Logo";
import { Logotype } from "#/view/icons/Logotype";

export const SplashScreen = ({
	onDismiss,
	onPressSignin,
	onPressCreateAccount,
}: {
	onDismiss?: () => void;
	onPressSignin: () => void;
	onPressCreateAccount: () => void;
}) => {
	const t = useTheme();
	const { isTabletOrMobile: isMobileWeb } = useWebMediaQueries();
	const [showClipOverlay, setShowClipOverlay] = React.useState(false);

	React.useEffect(() => {
		const getParams = new URLSearchParams(window.location.search);
		const clip = getParams.get("clip");
		if (clip === "true") {
			setShowClipOverlay(true);
		}
	}, []);

	const kawaii = useKawaiiMode();

	return (
		<>
			{onDismiss && (
				<button
					type="button"
					style={{
						position: "absolute",
						top: 20,
						right: 20,
						padding: 20,
						zIndex: 100,
					}}
					onClick={onDismiss}
				>
					<FontAwesomeIcon
						icon="x"
						// size={24}
						size="2xl"
						style={{
							color: String(t.atoms.text.color),
						}}
					/>
				</button>
			)}
			<Layout.Center
				style={{
					...a.h_full,
					...a.flex_1,
				}}
				ignoreTabletLayoutOffset
			>
				<div
					style={{
						...a.h_full,
						...a.justify_center,

						paddingBottom: "20vh",

						...(isMobileWeb && a.pb_5xl),
						...t.atoms.border_contrast_medium,
						...a.align_center,
						...a.gap_5xl,
						...a.flex_1,
					}}
				>
					<ErrorBoundary>
						<div
							style={{
								...a.justify_center,
								...a.align_center,
							}}
						>
							<Logo width={kawaii ? 300 : 92} fill="sky" />

							{!kawaii && (
								<div
									style={{
										...a.pb_sm,
										...a.pt_5xl,
									}}
								>
									<Logotype width={161} fill={t.atoms.text.color} />
								</div>
							)}

							<Text
								style={{
									...a.text_md,
									...a.font_bold,
									...t.atoms.text_contrast_medium,
								}}
							>
								What's up?
							</Text>
						</div>

						<div
							style={{
								...a.w_full,
								...a.px_xl,
								...a.gap_md,
								...a.pb_2xl,
								...{ maxWidth: 320 },
							}}
						>
							<Button
								onPress={onPressCreateAccount}
								label={"Create new account"}
								size="large"
								variant="solid"
								color="primary"
							>
								<ButtonText>Create account</ButtonText>
							</Button>
							<Button
								onPress={onPressSignin}
								label={"Sign in"}
								size="large"
								variant="solid"
								color="secondary"
							>
								<ButtonText>Sign in</ButtonText>
							</Button>
						</div>
					</ErrorBoundary>
				</div>
				<Footer />
			</Layout.Center>
			<AppClipOverlay visible={showClipOverlay} setIsVisible={setShowClipOverlay} />
		</>
	);
};

function Footer() {
	const t = useTheme();

	return (
		<div
			style={{
				...a.absolute,
				...a.inset_0,
				...{ top: "auto" },
				...a.p_xl,
				...a.border_t,
				...a.flex_row,
				...a.flex_wrap,
				...a.gap_xl,
				...a.flex_1,
				...t.atoms.border_contrast_medium,
			}}
		>
			<InlineLinkText label={"Learn more about Bluesky"} to="https://bsky.social">
				Business
			</InlineLinkText>
			<InlineLinkText label={"Read the Bluesky blog"} to="https://bsky.social/about/blog">
				Blog
			</InlineLinkText>
			<InlineLinkText label={"See jobs at Bluesky"} to="https://bsky.social/about/join">
				Jobs
			</InlineLinkText>
			<div style={a.flex_1} />
			<AppLanguageDropdown />
		</div>
	);
}
