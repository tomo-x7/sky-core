import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import * as Layout from "#/components/Layout";
import { usePalette } from "#/lib/hooks/usePalette";
import { useGetTimeAgo } from "#/lib/hooks/useTimeAgo";
import type { CommonNavigatorParams, NativeStackScreenProps } from "#/lib/routes/types";
import { s } from "#/lib/styles";
import { useTickEveryMinute } from "#/state/shell";
import { useSetMinimalShellMode } from "#/state/shell";
import { ViewHeader } from "#/view/com/util/ViewHeader";
import { ScrollView } from "#/view/com/util/Views";
import { Text } from "#/view/com/util/text/Text";

export function LogScreen(props: NativeStackScreenProps<CommonNavigatorParams, "Log">) {
	const pal = usePalette("default");
	const setMinimalShellMode = useSetMinimalShellMode();
	const [expanded, setExpanded] = React.useState<string[]>([]);
	const timeAgo = useGetTimeAgo();
	const tick = useTickEveryMinute();

	useFocusEffect(
		React.useCallback(() => {
			setMinimalShellMode(false);
		}, [setMinimalShellMode]),
	);

	const toggler = (id: string) => () => {
		if (expanded.includes(id)) {
			setExpanded(expanded.filter((v) => v !== id));
		} else {
			setExpanded([...expanded, id]);
		}
	};

	return (
		<Layout.Screen>
			<ViewHeader title="Log" />
			<ScrollView style={s.flex1}>
				
				<View style={s.footerSpacer} />
			</ScrollView>
		</Layout.Screen>
	);
}

const styles = StyleSheet.create({
	entry: {
		flexDirection: "row",
		borderTopWidth: 1,
		paddingVertical: 10,
		paddingHorizontal: 6,
	},
	summary: {
		flex: 1,
	},
	ts: {
		width: 40,
	},
	details: {
		paddingVertical: 10,
		paddingHorizontal: 6,
	},
});
