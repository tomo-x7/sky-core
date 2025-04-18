import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { clamp } from "#/lib/numbers";

export function useBottomBarOffset(modifier = 0) {
	const { isTabletOrDesktop } = useWebMediaQueries();
	return (isTabletOrDesktop ? 0 : clamp(60, 60, 75)) + modifier;
}
