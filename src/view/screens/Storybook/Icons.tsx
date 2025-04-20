import { useTheme } from "#/alf";
import { Loader } from "#/components/Loader";
import { H1 } from "#/components/Typography";
import { ArrowTopRight_Stroke2_Corner0_Rounded as ArrowTopRight } from "#/components/icons/Arrow";
import { CalendarDays_Stroke2_Corner0_Rounded as CalendarDays } from "#/components/icons/CalendarDays";
import { Globe_Stroke2_Corner0_Rounded as Globe } from "#/components/icons/Globe";

export function Icons() {
	const t = useTheme();
	return (
		<div style={{ gap: 12 }}>
			<H1>Icons</H1>
			<div
				style={{
					flexDirection: "row",
					gap: 20,
				}}
			>
				<Globe size="xs" fill={t.atoms.text.color} />
				<Globe size="sm" fill={t.atoms.text.color} />
				<Globe size="md" fill={t.atoms.text.color} />
				<Globe size="lg" fill={t.atoms.text.color} />
				<Globe size="xl" fill={t.atoms.text.color} />
			</div>
			<div
				style={{
					flexDirection: "row",
					gap: 20,
				}}
			>
				<ArrowTopRight size="xs" fill={t.atoms.text.color} />
				<ArrowTopRight size="sm" fill={t.atoms.text.color} />
				<ArrowTopRight size="md" fill={t.atoms.text.color} />
				<ArrowTopRight size="lg" fill={t.atoms.text.color} />
				<ArrowTopRight size="xl" fill={t.atoms.text.color} />
			</div>
			<div
				style={{
					flexDirection: "row",
					gap: 20,
				}}
			>
				<CalendarDays size="xs" fill={t.atoms.text.color} />
				<CalendarDays size="sm" fill={t.atoms.text.color} />
				<CalendarDays size="md" fill={t.atoms.text.color} />
				<CalendarDays size="lg" fill={t.atoms.text.color} />
				<CalendarDays size="xl" fill={t.atoms.text.color} />
			</div>
			<div
				style={{
					flexDirection: "row",
					gap: 20,
				}}
			>
				<Loader size="xs" fill={t.atoms.text.color} />
				<Loader size="sm" fill={t.atoms.text.color} />
				<Loader size="md" fill={t.atoms.text.color} />
				<Loader size="lg" fill={t.atoms.text.color} />
				<Loader size="xl" fill={t.atoms.text.color} />
			</div>
			<div
				style={{
					flexDirection: "row",
					gap: 20,
				}}
			>
				<Globe size="xs" gradient="sky" />
				<Globe size="sm" gradient="sky" />
				<Globe size="md" gradient="sky" />
				<Globe size="lg" gradient="sky" />
				<Globe size="xl" gradient="sky" />
			</div>
		</div>
	);
}
