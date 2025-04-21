import { useBreakpoints, useTheme } from "#/alf";
import { H3, Text } from "#/components/Typography";

export function Breakpoints() {
	const t = useTheme();
	const breakpoints = useBreakpoints();

	return (
		<div>
			<H3 style={{ paddingBottom: 12 }}>Breakpoint Debugger</H3>
			<Text style={{ paddingBottom: 12 }}>
				Current breakpoint: {!breakpoints.gtMobile && <Text>mobile</Text>}
				{breakpoints.gtMobile && !breakpoints.gtTablet && <Text>tablet</Text>}
				{breakpoints.gtTablet && <Text>desktop</Text>}
			</Text>
			<Text
				style={{
					padding: 12,
					...t.atoms.bg_contrast_100,
					...{ fontFamily: "monospace" },
				}}
			>
				{JSON.stringify(breakpoints, null, 2)}
			</Text>
		</div>
	);
}
