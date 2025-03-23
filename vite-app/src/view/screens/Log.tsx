import React from "react";
import { useFocusEffect } from "#/components/hooks/useFocusEffect";

import * as Layout from "#/components/Layout";
import { usePalette } from "#/lib/hooks/usePalette";
import { useGetTimeAgo } from "#/lib/hooks/useTimeAgo";
import { s } from "#/lib/styles";
import { useTickEveryMinute } from "#/state/shell";
import { useSetMinimalShellMode } from "#/state/shell";
import { ViewHeader } from "#/view/com/util/ViewHeader";
import { ScrollView } from "#/view/com/util/Views";

export function LogScreen() {
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
				<div style={s.footerSpacer} />
			</ScrollView>
		</Layout.Screen>
	);
}

const styles = {
	entry: {
		flexDirection: "row",
		borderTopWidth: 1,
		padding: "10px 6px",
	},
	summary: {
		flex: 1,
	},
	ts: {
		width: 40,
	},
	details: {
		padding: "10px 6px",
	},
} satisfies Record<string, React.CSSProperties>;
