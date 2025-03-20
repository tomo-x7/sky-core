import type { MeasuredDimensions } from "react-native-reanimated";

export type Dimensions = {
	width: number;
	height: number;
};

export type Position = {
	x: number;
	y: number;
};

export type ImageSource = {
	uri: string;
	dimensions: Dimensions | null;
	thumbUri: string;
	thumbDimensions: Dimensions | null;
	thumbRect: MeasuredDimensions | null;
	alt?: string;
	type: "image" | "circle-avi" | "rect-avi";
};
