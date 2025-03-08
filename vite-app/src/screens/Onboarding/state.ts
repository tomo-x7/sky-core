import { useLingui } from "@lingui/react";
import React from "react";

import { logger } from "#/logger";
import type { AvatarColor, Emoji } from "#/screens/Onboarding/StepProfile/types";

export type OnboardingState = {
	hasPrev: boolean;
	totalSteps: number;
	activeStep: "profile" | "interests" | "finished";
	activeStepIndex: number;

	interestsStepResults: {
		selectedInterests: string[];
		apiResponse: ApiResponseMap;
	};
	profileStepResults: {
		isCreatedAvatar: boolean;
		image?: {
			path: string;
			mime: string;
			size: number;
			width: number;
			height: number;
		};
		imageUri?: string;
		imageMime?: string;
		creatorState?: {
			emoji: Emoji;
			backgroundColor: AvatarColor;
		};
	};
};

export type OnboardingAction =
	| {
			type: "next";
	  }
	| {
			type: "prev";
	  }
	| {
			type: "finish";
	  }
	| {
			type: "setInterestsStepResults";
			selectedInterests: string[];
			apiResponse: ApiResponseMap;
	  }
	| {
			type: "setProfileStepResults";
			isCreatedAvatar: boolean;
			image: OnboardingState["profileStepResults"]["image"] | undefined;
			imageUri: string | undefined;
			imageMime: string;
			creatorState:
				| {
						emoji: Emoji;
						backgroundColor: AvatarColor;
				  }
				| undefined;
	  };

export type ApiResponseMap = {
	interests: string[];
	suggestedAccountDids: {
		[key: string]: string[];
	};
	suggestedFeedUris: {
		[key: string]: string[];
	};
};

// most popular selected interests
export const popularInterests = [
	"art",
	"gaming",
	"sports",
	"comics",
	"music",
	"politics",
	"photography",
	"science",
	"news",
];

export function useInterestsDisplayNames() {
	const { _ } = useLingui();

	return React.useMemo<Record<string, string>>(() => {
		return {
			// Keep this alphabetized
			animals: "Animals",
			art: "Art",
			books: "Books",
			comedy: "Comedy",
			comics: "Comics",
			culture: "Culture",
			dev: "Software Dev",
			education: "Education",
			food: "Food",
			gaming: "Video Games",
			journalism: "Journalism",
			movies: "Movies",
			music: "Music",
			nature: "Nature",
			news: "News",
			pets: "Pets",
			photography: "Photography",
			politics: "Politics",
			science: "Science",
			sports: "Sports",
			tech: "Tech",
			tv: "TV",
			writers: "Writers",
		};
	}, [_]);
}

export const initialState: OnboardingState = {
	hasPrev: false,
	totalSteps: 3,
	activeStep: "profile",
	activeStepIndex: 1,

	interestsStepResults: {
		selectedInterests: [],
		apiResponse: {
			interests: [],
			suggestedAccountDids: {},
			suggestedFeedUris: {},
		},
	},
	profileStepResults: {
		isCreatedAvatar: false,
		image: undefined,
		imageUri: "",
		imageMime: "",
	},
};

export const Context = React.createContext<{
	state: OnboardingState;
	dispatch: React.Dispatch<OnboardingAction>;
}>({
	state: { ...initialState },
	dispatch: () => {},
});

export function reducer(s: OnboardingState, a: OnboardingAction): OnboardingState {
	let next = { ...s };

	switch (a.type) {
		case "next": {
			if (s.activeStep === "profile") {
				next.activeStep = "interests";
				next.activeStepIndex = 2;
			} else if (s.activeStep === "interests") {
				next.activeStep = "finished";
				next.activeStepIndex = 3;
			}
			break;
		}
		case "prev": {
			if (s.activeStep === "interests") {
				next.activeStep = "profile";
				next.activeStepIndex = 1;
			} else if (s.activeStep === "finished") {
				next.activeStep = "interests";
				next.activeStepIndex = 2;
			}
			break;
		}
		case "finish": {
			next = initialState;
			break;
		}
		case "setInterestsStepResults": {
			next.interestsStepResults = {
				selectedInterests: a.selectedInterests,
				apiResponse: a.apiResponse,
			};
			break;
		}
		case "setProfileStepResults": {
			next.profileStepResults = {
				isCreatedAvatar: a.isCreatedAvatar,
				image: a.image,
				imageUri: a.imageUri,
				imageMime: a.imageMime,
				creatorState: a.creatorState,
			};
			break;
		}
	}

	const state = {
		...next,
		hasPrev: next.activeStep !== "profile",
	};

	logger.debug("onboarding", {
		hasPrev: state.hasPrev,
		activeStep: state.activeStep,
		activeStepIndex: state.activeStepIndex,
		interestsStepResults: {
			selectedInterests: state.interestsStepResults.selectedInterests,
		},
		profileStepResults: state.profileStepResults,
	});

	if (s.activeStep !== state.activeStep) {
		logger.debug("onboarding: step changed", { activeStep: state.activeStep });
	}

	return state;
}
