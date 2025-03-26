// import type { openCropper } from "react-native-image-crop-picker";
type openCropper = any;

export interface Dimensions {
	width: number;
	height: number;
}

export interface PickerOpts {
	mediaType?: string;
	multiple?: boolean;
	maxFiles?: number;
}

export interface CameraOpts {
	width: number;
	height: number;
	freeStyleCropEnabled?: boolean;
	cropperCircleOverlay?: boolean;
}
// export type CropperOptions = Parameters<typeof openCropper>[0] & {
// 	webAspectRatio?: number;
// 	webCircularCrop?: boolean;
// };
export type CropperOptions = {
	webAspectRatio?: number;
	webCircularCrop?: boolean;
} & any;
