import type { ComAtprotoServerDescribeServer } from "@atproto/api";
import { Trans, msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import type { ReactElement } from "react";
import { View } from "react-native";

import { atoms as a, useTheme } from "#/alf";
import { InlineLinkText } from "#/components/Link";
import { Text } from "#/components/Typography";
import { CircleInfo_Stroke2_Corner0_Rounded as CircleInfo } from "#/components/icons/CircleInfo";

export const Policies = ({
	serviceDescription,
	needsGuardian,
	under13,
}: {
	serviceDescription: ComAtprotoServerDescribeServer.OutputSchema;
	needsGuardian: boolean;
	under13: boolean;
}) => {
	const t = useTheme();
	const { _ } = useLingui();

	if (!serviceDescription) {
		return <View />;
	}

	const tos = validWebLink(serviceDescription.links?.termsOfService);
	const pp = validWebLink(serviceDescription.links?.privacyPolicy);

	if (!tos && !pp) {
		return (
			<View style={[a.flex_row, a.align_center, a.gap_xs]}>
				<CircleInfo size="md" fill={t.atoms.text_contrast_low.color} />

				<Text style={[t.atoms.text_contrast_medium]}>
					<>This service has not provided terms of service or a privacy policy.</>
				</Text>
			</View>
		);
	}

	let els: ReactElement;
	if (tos && pp) {
		els = (
			<>
				By creating an account you agree to the{" "}
				<InlineLinkText label={_(msg`Read the Bluesky Terms of Service`)} key="tos" to={tos}>
					Terms of Service
				</InlineLinkText>{" "}
				and{" "}
				<InlineLinkText label={_(msg`Read the Bluesky Privacy Policy`)} key="pp" to={pp}>
					Privacy Policy
				</InlineLinkText>
				.
			</>
		);
	} else if (tos) {
		els = (
			<>
				By creating an account you agree to the{" "}
				<InlineLinkText label={_(msg`Read the Bluesky Terms of Service`)} key="tos" to={tos}>
					Terms of Service
				</InlineLinkText>
				.
			</>
		);
	} else if (pp) {
		els = (
			<>
				By creating an account you agree to the{" "}
				<InlineLinkText label={_(msg`Read the Bluesky Privacy Policy`)} key="pp" to={pp}>
					Privacy Policy
				</InlineLinkText>
				.
			</>
		);
	} else {
		return null;
	}

	return (
		<View style={[a.gap_sm]}>
			{els ? <Text style={[a.leading_snug, t.atoms.text_contrast_medium]}>{els}</Text> : null}

			{under13 ? (
				<Text style={[a.font_bold, a.leading_snug, t.atoms.text_contrast_high]}>
					<>You must be 13 years of age or older to sign up.</>
				</Text>
			) : needsGuardian ? (
				<Text style={[a.font_bold, a.leading_snug, t.atoms.text_contrast_high]}>
					<>
						If you are not yet an adult according to the laws of your country, your parent or legal guardian
						must read these Terms on your behalf.
					</>
				</Text>
			) : undefined}
		</View>
	);
};

function validWebLink(url?: string): string | undefined {
	return url && (url.startsWith("http://") || url.startsWith("https://")) ? url : undefined;
}
