import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { FABInner, type FABProps } from "./FABInner";

export const FAB = (_opts: FABProps) => {
	const { isDesktop } = useWebMediaQueries();

	if (!isDesktop) {
		return <FABInner {..._opts} />;
	}

	return <div />;
};
