import { useWebMediaQueries } from "#/lib/hooks/useWebMediaQueries";
import { clamp } from "#/lib/numbers";
import { isWeb } from "#/platform/detection";

export function useBottomBarOffset(modifier = 0) {
	const { isTabletOrDesktop } = useWebMediaQueries();
	return (isWeb && isTabletOrDesktop ? 0 : clamp(60, 60, 75)) + modifier;
}
