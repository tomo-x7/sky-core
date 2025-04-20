import type { FontAwesomeIconProps } from "@fortawesome/react-fontawesome";

export type CommonUnitProps = {
	toast: (text: string, icon?: FontAwesomeIconProps["icon"]) => void;
};
