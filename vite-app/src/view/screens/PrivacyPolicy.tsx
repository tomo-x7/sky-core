import { useFocusEffect } from "@react-navigation/native";
import React from "react";

import * as Layout from "#/components/Layout";
import { Text } from "#/components/Typography";
import { usePalette } from "#/lib/hooks/usePalette";
import type { CommonNavigatorParams, NativeStackScreenProps } from "#/lib/routes/types";
import { s } from "#/lib/styles";
import { useSetMinimalShellMode } from "#/state/shell";
import { TextLink } from "#/view/com/util/Link";
import { ScrollView } from "#/view/com/util/Views";
import { ViewHeader } from "../com/util/ViewHeader";

type Props = NativeStackScreenProps<CommonNavigatorParams, "PrivacyPolicy">;
export const PrivacyPolicyScreen = (_props: Props) => {
	const pal = usePalette("default");
	const setMinimalShellMode = useSetMinimalShellMode();

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	return (
		<Layout.Screen>
			<ViewHeader title={"Privacy Policy"} />
			<ScrollView
				style={{
					...s.hContentRegion,
					...pal.view,
				}}
			>
				<div style={s.p20}>
					<Text style={pal.text}>
						<>
							The Privacy Policy has been moved to{" "}
							<TextLink
								style={pal.link}
								href="https://bsky.social/about/support/privacy-policy"
								text="bsky.social/about/support/privacy-policy"
							/>
						</>
					</Text>
				</div>
				<div style={s.footerSpacer} />
			</ScrollView>
		</Layout.Screen>
	);
};
