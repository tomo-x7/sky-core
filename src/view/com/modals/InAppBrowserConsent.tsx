import React from "react";

import { Text } from "#/components/Typography";
import { useOpenLink } from "#/lib/hooks/useOpenLink";
import { usePalette } from "#/lib/hooks/usePalette";
import { s } from "#/lib/styles";
import { useModalControls } from "#/state/modals";
import { useSetInAppBrowser } from "#/state/preferences/in-app-browser";
import { ScrollView } from "#/view/com/modals/util";
import { Button } from "#/view/com/util/forms/Button";

export const snapPoints = [350];

export function Component({ href }: { href: string }) {
	const pal = usePalette("default");
	const { closeModal } = useModalControls();
	const setInAppBrowser = useSetInAppBrowser();
	const openLink = useOpenLink();

	const onUseIAB = React.useCallback(() => {
		setInAppBrowser(true);
		closeModal();
		openLink(href, true);
	}, [closeModal, setInAppBrowser, href, openLink]);

	const onUseLinking = React.useCallback(() => {
		setInAppBrowser(false);
		closeModal();
		openLink(href, false);
	}, [closeModal, setInAppBrowser, href, openLink]);

	return (
		<ScrollView
			style={{
				...s.flex1,
				...pal.view,
				...{ paddingLeft: 20, paddingRight: 20, paddingTop: 10 },
			}}
		>
			<Text
				style={{
					...pal.text,
					...styles.title,
				}}
			>
				How should we open this link?
			</Text>
			<Text style={pal.text}>Your choice will be saved, but can be changed later in settings.</Text>
			<div style={styles.btnContainer}>
				<Button
					type="inverted"
					onPress={onUseIAB}
					accessibilityLabel={"Use in-app browser"}
					accessibilityHint=""
					label={"Use in-app browser"}
					labelContainerStyle={{ justifyContent: "center", padding: 8 }}
					labelStyle={s.f18}
				/>
				<Button
					type="inverted"
					onPress={onUseLinking}
					accessibilityLabel={"Use my default browser"}
					accessibilityHint=""
					label={"Use my default browser"}
					labelContainerStyle={{ justifyContent: "center", padding: 8 }}
					labelStyle={s.f18}
				/>
				<Button
					type="default"
					onPress={() => {
						closeModal();
					}}
					accessibilityLabel={"Cancel"}
					accessibilityHint=""
					label={"Cancel"}
					labelContainerStyle={{ justifyContent: "center", padding: 8 }}
					labelStyle={s.f18}
				/>
			</div>
		</ScrollView>
	);
}

const styles = {
	title: {
		textAlign: "center",
		fontWeight: "600",
		fontSize: 24,
		marginBottom: 12,
	},
	btnContainer: {
		marginTop: 20,
		flexDirection: "column",
		justifyContent: "center",
		rowGap: 10,
	},
} satisfies Record<string, React.CSSProperties>;
