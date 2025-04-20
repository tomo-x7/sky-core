import { atoms as a, useTheme } from "#/alf";
import { ButtonText } from "#/components/Button";
import { InlineLinkText, Link } from "#/components/Link";
import { H1, Text } from "#/components/Typography";

export function Links() {
	const t = useTheme();
	return (
		<div
			style={{
				gap: 12,
				alignItems: "flex-start",
			}}
		>
			<H1>Links</H1>
			<div
				style={{
					gap: 12,
					alignItems: "flex-start",
				}}
			>
				<InlineLinkText label="foo" to="https://google.com" style={{ ...a.text_lg }}>
					https://google.com
				</InlineLinkText>
				<InlineLinkText label="foo" to="https://google.com" style={{ ...a.text_lg }}>
					External with custom children (google.com)
				</InlineLinkText>
				<InlineLinkText
					label="foo"
					to="https://bsky.social"
					style={{
						fontSize: 16,
						letterSpacing: 0,
						...t.atoms.text_contrast_low,
					}}
				>
					Internal (bsky.social)
				</InlineLinkText>
				<InlineLinkText label="foo" to="https://bsky.app/profile/bsky.app" style={{ ...a.text_md }}>
					Internal (bsky.app)
				</InlineLinkText>

				<Link
					variant="solid"
					color="primary"
					size="large"
					label="View @bsky.app's profile"
					to="https://bsky.app/profile/bsky.app"
				>
					<ButtonText>Link as a button</ButtonText>
				</Link>

				<Link label="View @bsky.app's profile" to="https://bsky.app/profile/bsky.app">
					<div
						style={{
							flexDirection: "row",
							alignItems: "center",
							gap: 12,
							borderRadius: 12,
							padding: 12,
							...t.atoms.bg_contrast_25,
						}}
					>
						<div
							style={{
								...{ width: 32, height: 32 },
								borderRadius: 999,
								...t.atoms.bg_contrast_200,
							}}
						/>
						<Text>View @bsky.app's profile</Text>
					</div>
				</Link>
			</div>
		</div>
	);
}
