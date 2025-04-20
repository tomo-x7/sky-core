import { useTheme } from "#/alf";
import { Loader_Stroke2_Corner0_Rounded as Icon } from "#/components/icons/Loader";
import { type Props, useCommonSVGProps } from "#/components/icons/common";

export function Loader(props: Props) {
	const t = useTheme();
	const common = useCommonSVGProps(props);

	return (
		<div
			style={{
				position: "relative",
				justifyContent: "center",
				alignItems: "center",
				...{ width: common.size, height: common.size },
			}}
		>
			{/* css rotation animation - /bskyweb/templates/base.html */}
			<div className="rotate-500ms">
				<Icon
					{...props}
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						...t.atoms.text_contrast_high,
						...props.style,
					}}
				/>
			</div>
		</div>
	);
}
