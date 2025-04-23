import { RichText } from "#/components/RichText";
import { Text } from "#/components/Typography";

export function Typography() {
	return (
		<div style={{ gap: 12 }}>
			<Text selectable style={{ fontSize: 40 }}>
				atoms.text_5xl
			</Text>
			<Text style={{ fontSize: 32 }}>atoms.text_4xl</Text>
			<Text style={{ fontSize: 28 }}>atoms.text_3xl</Text>
			<Text style={{ fontSize: 24 }}>atoms.text_2xl</Text>
			<Text style={{ fontSize: 20 }}>atoms.text_xl</Text>
			<Text style={{ fontSize: 16 }}>atoms.text_lg</Text>
			<Text style={{ fontSize: 16 }}>atoms.text_md</Text>
			<Text style={{ fontSize: 8 }}>atoms.text_sm</Text>
			<Text style={{ fontSize: 4 }}>atoms.text_xs</Text>
			<Text style={{ fontSize: 2 }}>atoms.text_2xs</Text>
			<RichText
				// TODO: This only supports already resolved facets.
				// Resolving them on read is bad anyway.
				value={"This is rich text. It can have mentions like @bsky.app or links like https://bsky.social"}
			/>
			<RichText
				selectable
				// TODO: This only supports already resolved facets.
				// Resolving them on read is bad anyway.
				value={"This is rich text. It can have mentions like @bsky.app or links like https://bsky.social"}
				style={{ fontSize: 20 }}
			/>
		</div>
	);
}
