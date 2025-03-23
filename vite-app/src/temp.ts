export interface ListRenderItemInfo<ItemT> {
	item: ItemT;

	index: number;

	separators: {
		highlight: () => void;
		unhighlight: () => void;
		updateProps: (select: "leading" | "trailing", newProps: any) => void;
	};
}
// from expo-image-picker
export type ImagePickerAsset = {
	/**
	 * URI to the local image or video file (usable as the source of an `Image` element, in the case of
	 * an image) and `width` and `height` specify the dimensions of the media.
	 */
	uri: string;
	/**
	 * Width of the image or video.
	 */
	width: number;
	/**
	 * Height of the image or video.
	 */
	height: number;
	/**
	 * The type of the asset.
	 * - `'image'` - for images.
	 * - `'video'` - for videos.
	 * - `'livePhoto'` - for live photos. (iOS only)
	 * - `'pairedVideo'` - for videos paired with photos, which can be combined to create a live photo. (iOS only)
	 */
	type?: "image" | "video" | "livePhoto" | "pairedVideo";
	/**
	 * Preferred filename to use when saving this item. This might be `null` when the name is unavailable
	 * or user gave limited permission to access the media library.
	 *
	 */
	fileName?: string | null;
	/**
	 * File size of the picked image or video, in bytes.
	 *
	 */
	fileSize?: number;
	/**
	 * When the `base64` option is truthy, it is a Base64-encoded string of the selected image's JPEG data, otherwise `null`.
	 * If you prepend this with `'data:image/jpeg;base64,'` to create a data URI,
	 * you can use it as the source of an `Image` element; for example:
	 * ```ts
	 * <Image
	 *   source={{ uri: 'data:image/jpeg;base64,' + asset.base64 }}
	 *   style={{ width: 200, height: 200 }}
	 * />
	 * ```
	 */
	base64?: string | null;
	/**
	 * Length of the video in milliseconds or `null` if the asset is not a video.
	 */
	duration?: number | null;
	/**
	 * The MIME type of the selected asset or `null` if could not be determined.
	 */
	mimeType?: string;
	/**
	 * The web `File` object containing the selected media. This property is web-only and can be used to upload to a server with `FormData`.
	 *
	 * @platform web
	 */
	file?: File;
};
export type ImagePickerOptions = {
	/**
	 * An array with two entries `[x, y]` specifying the aspect ratio to maintain if the user is
	 * allowed to edit the image (by passing `allowsEditing: true`). This is only applicable on
	 * Android, since on iOS the crop rectangle is always a square.
	 */
	aspect?: [number, number];
	/**
	 * Choose what type of media to pick.
	 * @default 'images'
	 */
	mediaTypes?: MediaType | MediaType[] | MediaTypeOptions;
	/**
	 * Whether to also include the image data in Base64 format.
	 */
	base64?: boolean;
	/**
	 * Whether or not to allow selecting multiple media files at once.
	 *
	 * > Cropping multiple images is not supported - this option is mutually exclusive with `allowsEditing`.
	 * > If this option is enabled, then `allowsEditing` is ignored.
	 *
	 * @default false
	 * @platform android
	 * @platform ios 14+
	 * @platform web
	 */
	allowsMultipleSelection?: boolean;
	/**
	 * Maximum duration, in seconds, for video recording. Setting this to `0` disables the limit.
	 * Defaults to `0` (no limit).
	 * - **On iOS**, when `allowsEditing` is set to `true`, maximum duration is limited to 10 minutes.
	 *   This limit is applied automatically, if `0` or no value is specified.
	 * - **On Android**, effect of this option depends on support of installed camera app.
	 * - **On Web** this option has no effect - the limit is browser-dependant.
	 */
	videoMaxDuration?: number;
};
export type ImagePickerResult = ImagePickerSuccessResult | ImagePickerCanceledResult;
type ImagePickerSuccessResult = {
	/**
	 * Boolean flag set to `false` showing that the request was successful.
	 */
	canceled: false;
	/**
	 * An array of picked assets.
	 */
	assets: ImagePickerAsset[];
};
export type ImagePickerCanceledResult = {
	/**
	 * Boolean flag set to `true` showing that the request was canceled.
	 */
	canceled: true;
	/**
	 * `null` signifying that the request was canceled.
	 */
	assets: null;
};
type MediaType = "images" | "videos" | "livePhotos";
enum MediaTypeOptions {
	/**
	 * Images and videos.
	 */
	All = "All",
	/**
	 * Only videos.
	 */
	Videos = "Videos",
	/**
	 * Only images.
	 */
	Images = "Images",
}
