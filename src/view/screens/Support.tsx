import React from "react";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";

import * as Layout from "#/components/Layout";
import { Text } from "#/components/Typography";
import { HELP_DESK_URL } from "#/lib/constants";
import { usePalette } from "#/lib/hooks/usePalette";
import { s } from "#/lib/styles";
import { useSetMinimalShellMode } from "#/state/shell";
import { TextLink } from "#/view/com/util/Link";
import { ViewHeader } from "#/view/com/util/ViewHeader";
import { CenteredView } from "#/view/com/util/Views";

export const SupportScreen = () => {
	const pal = usePalette("default");
	const setMinimalShellMode = useSetMinimalShellMode();

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	return (
		<Layout.Screen>
			<ViewHeader title={"Support"} />
			<CenteredView>
				<Text
					type="title-xl"
					style={{
						...pal.text,
						...s.p20,
						...s.pb5,
					}}
				>
					Support
				</Text>
				<Text
					style={{
						...pal.text,
						...s.p20,
					}}
				>
					<>
						The support form has been moved. If you need help, please{" "}
						<TextLink href={HELP_DESK_URL} text={"click here"} style={pal.link} /> or visit {HELP_DESK_URL}{" "}
						to get in touch with us.
					</>
				</Text>
			</CenteredView>
		</Layout.Screen>
	);
};
