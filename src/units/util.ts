import type { FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import * as Toast from "#/view/com/util/Toast";

export type CommonUnitProps = {
	toast: (text: string, icon?: FontAwesomeIconProps["icon"]) => void;
};

export function useCommonUnitProps(): CommonUnitProps {
	const toast: CommonUnitProps["toast"] = (...props) => Toast.show(...props);

	return { toast };
}
