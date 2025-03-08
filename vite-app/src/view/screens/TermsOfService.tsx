import { useLingui } from "@lingui/react";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";

import * as Layout from "#/components/Layout";
import { usePalette } from "#/lib/hooks/usePalette";
import type { CommonNavigatorParams, NativeStackScreenProps } from "#/lib/routes/types";
import { s } from "#/lib/styles";
import { useSetMinimalShellMode } from "#/state/shell";
import { TextLink } from "#/view/com/util/Link";
import { ScrollView } from "#/view/com/util/Views";
import { Text } from "#/view/com/util/text/Text";
import { ViewHeader } from "../com/util/ViewHeader";

type Props = NativeStackScreenProps<CommonNavigatorParams, "TermsOfService">;
export const TermsOfServiceScreen = (_props: Props) => {
	const pal = usePalette("default");
	const setMinimalShellMode = useSetMinimalShellMode();
	const { _ } = useLingui();

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	return (
		<Layout.Screen>
			<ViewHeader title={"Terms of Service"} />
			<ScrollView style={[s.hContentRegion, pal.view]}>
				<View style={[s.p20]}>
					<Text style={pal.text}>
						The Terms of Service have been moved to{" "}
						<TextLink
							style={pal.link}
							href="https://bsky.social/about/support/tos"
							text="bsky.social/about/support/tos"
						/>
					</Text>
				</View>
				<View style={s.footerSpacer} />
			</ScrollView>
		</Layout.Screen>
	);
};
