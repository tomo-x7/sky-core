import type { InterpretedLabelValueDefinition, LabelPreference } from "@atproto/api";
import { useLingui } from "@lingui/react";

export function useLabelBehaviorDescription(labelValueDef: InterpretedLabelValueDefinition, pref: LabelPreference) {
	const { _ } = useLingui();
	if (pref === "ignore") {
		return "Off";
	}
	if (labelValueDef.blurs === "content" || labelValueDef.blurs === "media") {
		if (pref === "hide") {
			return "Hide";
		}
		return "Warn";
	} else if (labelValueDef.severity === "alert") {
		if (pref === "hide") {
			return "Hide";
		}
		return "Warn";
	} else if (labelValueDef.severity === "inform") {
		if (pref === "hide") {
			return "Hide";
		}
		return "Show badge";
	} else {
		if (pref === "hide") {
			return "Hide";
		}
		return "Disabled";
	}
}

export function useLabelLongBehaviorDescription(labelValueDef: InterpretedLabelValueDefinition, pref: LabelPreference) {
	const { _ } = useLingui();
	if (pref === "ignore") {
		return "Disabled";
	}
	if (labelValueDef.blurs === "content") {
		if (pref === "hide") {
			return "Warn content and filter from feeds";
		}
		return "Warn content";
	} else if (labelValueDef.blurs === "media") {
		if (pref === "hide") {
			return "Blur images and filter from feeds";
		}
		return "Blur images";
	} else if (labelValueDef.severity === "alert") {
		if (pref === "hide") {
			return "Show warning and filter from feeds";
		}
		return "Show warning";
	} else if (labelValueDef.severity === "inform") {
		if (pref === "hide") {
			return "Show badge and filter from feeds";
		}
		return "Show badge";
	} else {
		if (pref === "hide") {
			return "Filter from feeds";
		}
		return "Disabled";
	}
}
