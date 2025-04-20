import { Button, ButtonIcon } from "#/components/Button";
import { TimesLarge_Stroke2_Corner0_Rounded as X } from "#/components/icons/Times";

export function ExternalEmbedRemoveBtn({ onRemove }: { onRemove: () => void }) {
	return (
		<div
			style={{
				position: "absolute",
				...{ top: 8, right: 8 },
				zIndex: 50,
			}}
		>
			<Button
				label={"Remove attachment"}
				onPress={onRemove}
				size="small"
				variant="solid"
				color="secondary"
				shape="round"
			>
				<ButtonIcon icon={X} size="sm" />
			</Button>
		</div>
	);
}
