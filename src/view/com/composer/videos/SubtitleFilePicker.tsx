import type React from "react";
import { useRef } from "react";

import { atoms as a } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import { CC_Stroke2_Corner0_Rounded as CCIcon } from "#/components/icons/CC";
import * as Toast from "#/view/com/util/Toast";

export function SubtitleFilePicker({
	onSelectFile,
	disabled,
}: {
	onSelectFile: (file: File) => void;
	disabled?: boolean;
}) {
	const ref = useRef<HTMLInputElement>(null);

	const handleClick = () => {
		ref.current?.click();
	};

	const handlePick = (evt: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = evt.target.files?.[0];
		if (selectedFile) {
			if (
				selectedFile.type === "text/vtt" ||
				// HACK: sometimes the mime type is just straight-up missing
				// best we can do is check the file extension and hope for the best
				selectedFile.name.endsWith(".vtt")
			) {
				onSelectFile(selectedFile);
			} else {
				console.error("Invalid subtitle file type", {
					safeMessage: `File: ${selectedFile.name} (${selectedFile.type})`,
				});
				Toast.show("Only WebVTT (.vtt) files are supported");
			}
		}
	};

	return (
		<div style={{ gap:16 }}>
			<input
				type="file"
				accept=".vtt"
				ref={ref}
				style={{ ...a.hidden }}
				onChange={handlePick}
				disabled={disabled}
				aria-disabled={disabled}
			/>
			<div style={{ ...a.flex_row }}>
				<Button
					onPress={handleClick}
					label={"Select subtitle file (.vtt)"}
					size="large"
					color="primary"
					variant="solid"
					disabled={disabled}
				>
					<ButtonIcon icon={CCIcon} />
					<ButtonText>Select subtitle file (.vtt)</ButtonText>
				</Button>
			</div>
		</div>
	);
}
