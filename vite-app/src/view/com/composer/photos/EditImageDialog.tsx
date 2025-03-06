import type React from "react";

import type * as Dialog from "#/components/Dialog";
import type { ComposerImage } from "#/state/gallery";

export type EditImageDialogProps = {
	control: Dialog.DialogOuterProps["control"];
	image: ComposerImage;
	onChange: (next: ComposerImage) => void;
};

export const EditImageDialog = ({}: EditImageDialogProps): React.ReactNode => {
	return null;
};
