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

type Props = NativeStackScreenProps<CommonNavigatorParams, "CommunityGuidelines">;
export const CommunityGuidelinesScreen = (_props: Props) => {
	const pal = usePalette("default");
	const setMinimalShellMode = useSetMinimalShellMode();

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	return (
		<Layout.Screen>
			<ViewHeader title={"Community Guidelines"} />
			<ScrollView
				// @ts-expect-error
				style={{
					...s.hContentRegion,
					...pal.view,
				}}
			>
				<div style={s.p20}>
					<Text style={pal.text}>
						<>
							The Community Guidelines have been moved to{" "}
							<TextLink
								style={pal.link}
								href="https://bsky.social/about/support/community-guidelines"
								text="bsky.social/about/support/community-guidelines"
							/>
						</>
					</Text>
				</div>
				<div style={s.footerSpacer} />
			</ScrollView>
		</Layout.Screen>
	);
};
