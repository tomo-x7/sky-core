import { type Action, type ActionCrop, SaveFormat, manipulateAsync } from "expo-image-manipulator";
import { nanoid } from "nanoid/non-secure";

import { POST_IMG_MAX } from "#/lib/constants";
import { getImageDim } from "#/lib/media/manip";
import { getDataUriSize } from "#/lib/media/util";

export type ImageTransformation = {
	crop?: ActionCrop["crop"];
};

export type ImageMeta = {
	path: string;
	width: number;
	height: number;
	mime: string;
};

export type ImageSource = ImageMeta & {
	id: string;
};

type ComposerImageBase = {
	alt: string;
	source: ImageSource;
};
type ComposerImageWithoutTransformation = ComposerImageBase & {
	transformed?: undefined;
	manips?: undefined;
};
type ComposerImageWithTransformation = ComposerImageBase & {
	transformed: ImageMeta;
	manips?: ImageTransformation;
};

export type ComposerImage = ComposerImageWithoutTransformation | ComposerImageWithTransformation;



export async function createComposerImage(raw: ImageMeta): Promise<ComposerImageWithoutTransformation> {
	return {
		alt: "",
		source: {
			id: nanoid(),
			path: await moveIfNecessary(raw.path),
			width: raw.width,
			height: raw.height,
			mime: raw.mime,
		},
	};
}

export type InitialImage = {
	uri: string;
	width: number;
	height: number;
	altText?: string;
};

export function createInitialImages(uris: InitialImage[] = []): ComposerImageWithoutTransformation[] {
	return uris.map(({ uri, width, height, altText = "" }) => {
		return {
			alt: altText,
			source: {
				id: nanoid(),
				path: uri,
				width: width,
				height: height,
				mime: "image/jpeg",
			},
		};
	});
}

export async function pasteImage(uri: string): Promise<ComposerImageWithoutTransformation> {
	const { width, height } = await getImageDim(uri);
	const match = /^data:(.+?);/.exec(uri);

	return {
		alt: "",
		source: {
			id: nanoid(),
			path: uri,
			width: width,
			height: height,
			mime: match ? match[1] : "image/jpeg",
		},
	};
}

export async function cropImage(img: ComposerImage): Promise<ComposerImage> {
	return img;
}

export async function manipulateImage(img: ComposerImage, trans: ImageTransformation): Promise<ComposerImage> {
	const rawActions: (Action | undefined)[] = [trans.crop && { crop: trans.crop }];

	const actions = rawActions.filter((a): a is Action => a !== undefined);

	if (actions.length === 0) {
		if (img.transformed === undefined) {
			return img;
		}

		return { alt: img.alt, source: img.source };
	}

	const source = img.source;
	const result = await manipulateAsync(source.path, actions, {
		format: SaveFormat.PNG,
	});

	return {
		alt: img.alt,
		source: img.source,
		transformed: {
			path: await moveIfNecessary(result.uri),
			width: result.width,
			height: result.height,
			mime: "image/png",
		},
		manips: trans,
	};
}

export function resetImageManipulation(img: ComposerImage): ComposerImageWithoutTransformation {
	if (img.transformed !== undefined) {
		return { alt: img.alt, source: img.source };
	}

	return img;
}

export async function compressImage(img: ComposerImage): Promise<ImageMeta> {
	const source = img.transformed || img.source;

	const [w, h] = containImageRes(source.width, source.height, POST_IMG_MAX);

	for (let i = 10; i > 0; i--) {
		// Float precision
		const factor = i / 10;

		const res = await manipulateAsync(source.path, [{ resize: { width: w, height: h } }], {
			compress: factor,
			format: SaveFormat.JPEG,
			base64: true,
		});

		const base64 = res.base64;

		if (base64 !== undefined && getDataUriSize(base64) <= POST_IMG_MAX.size) {
			return {
				path: await moveIfNecessary(res.uri),
				width: res.width,
				height: res.height,
				mime: "image/jpeg",
			};
		}
	}

	throw new Error("Unable to compress image");
}

async function moveIfNecessary(from: string) {
	return from;
}

/** Purge files that were created to accomodate image manipulation */
export async function purgeTemporaryImageFiles() {}


function containImageRes(
	w: number,
	h: number,
	{ width: maxW, height: maxH }: { width: number; height: number },
): [width: number, height: number] {
	let scale = 1;

	if (w > maxW || h > maxH) {
		scale = w > h ? maxW / w : maxH / h;
		w = Math.floor(w * scale);
		h = Math.floor(h * scale);
	}

	return [w, h];
}
