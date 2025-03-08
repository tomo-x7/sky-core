import { msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";

import * as Layout from "#/components/Layout";
import { HELP_DESK_URL } from "#/lib/constants";
import { usePalette } from "#/lib/hooks/usePalette";
import type { CommonNavigatorParams, NativeStackScreenProps } from "#/lib/routes/types";
import { s } from "#/lib/styles";
import { useSetMinimalShellMode } from "#/state/shell";
import { TextLink } from "#/view/com/util/Link";
import { ViewHeader } from "#/view/com/util/ViewHeader";
import { CenteredView } from "#/view/com/util/Views";
import { Text } from "#/view/com/util/text/Text";

type Props = NativeStackScreenProps<CommonNavigatorParams, "Support">;
export const SupportScreen = (_props: Props) => {
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
			<ViewHeader title={_(msg`Support`)} />
			<CenteredView>
				<Text type="title-xl" style={[pal.text, s.p20, s.pb5]}>
					Support
				</Text>
				<Text style={[pal.text, s.p20]}>
					<>
						The support form has been moved. If you need help, please{" "}
						<TextLink href={HELP_DESK_URL} text={_(msg`click here`)} style={pal.link} /> or visit{" "}
						{HELP_DESK_URL} to get in touch with us.
					</>
				</Text>
			</CenteredView>
		</Layout.Screen>
	);
};
