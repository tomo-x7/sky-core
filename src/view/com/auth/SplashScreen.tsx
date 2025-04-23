import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

import { useTheme } from "#/alf";
import { AppLanguageDropdown } from "#/components/AppLanguageDropdown";
import { Button, ButtonText } from "#/components/Button";
import * as Layout from "#/components/Layout";
import { InlineLinkText } from "#/components/Link";
import { Text } from "#/components/Typography";
import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
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
					height: "100%",
					flex: 1,
				}}
				ignoreTabletLayoutOffset
			>
				<div
					style={{
						height: "100%",
						justifyContent: "center",

						paddingBottom: isMobileWeb ? 40 : "20vh",

						...t.atoms.border_contrast_medium,
						alignItems: "center",
						gap: 40,
						flex: 1,
					}}
				>
					<ErrorBoundary>
						<div
							style={{
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<Logo width={kawaii ? 300 : 92} fill="sky" />

							{!kawaii && (
								<div
									style={{
										paddingBottom: 8,
										paddingTop: 40,
									}}
								>
									<Logotype width={161} fill={t.atoms.text.color} />
								</div>
							)}

							<Text
								style={{
									fontSize: 16,
									letterSpacing: 0,
									fontWeight: "600",
									...t.atoms.text_contrast_medium,
								}}
							>
								What's up?
							</Text>
						</div>

						<div
							style={{
								width: "100%",
								paddingLeft: 20,
								paddingRight: 20,
								gap: 12,
								paddingBottom: 24,
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
		</>
	);
};

function Footer() {
	const t = useTheme();

	return (
		<div
			style={{
				position: "absolute",
				left: 0,
				right: 0,
				bottom: 0,
				top: "auto",
				padding: 20,
				borderTop: "1px solid black",
				borderTopWidth: 1,
				flexDirection: "row",
				flexWrap: "wrap",
				gap: 20,
				flex: 1,
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
			<div style={{ flex: 1 }} />
			<AppLanguageDropdown />
		</div>
	);
}
