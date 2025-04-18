import React from "react";

import { Portal } from "#/components/Portal";
import { Layout, OnboardingControls } from "#/screens/Onboarding/Layout";
import { StepFinished } from "#/screens/Onboarding/StepFinished";
import { StepInterests } from "#/screens/Onboarding/StepInterests";
import { StepProfile } from "#/screens/Onboarding/StepProfile";
import { Context, initialState, reducer } from "#/screens/Onboarding/state";

export function Onboarding() {
	const [state, dispatch] = React.useReducer(reducer, {
		...initialState,
	});

	const interestsDisplayNames = React.useMemo(() => {
		return {
			news: "News",
			journalism: "Journalism",
			nature: "Nature",
			art: "Art",
			comics: "Comics",
			writers: "Writers",
			culture: "Culture",
			sports: "Sports",
			pets: "Pets",
			animals: "Animals",
			books: "Books",
			education: "Education",
			climate: "Climate",
			science: "Science",
			politics: "Politics",
			fitness: "Fitness",
			tech: "Tech",
			dev: "Software Dev",
			comedy: "Comedy",
			gaming: "Video Games",
			food: "Food",
			cooking: "Cooking",
		};
	}, []);

	return (
		<Portal>
			<OnboardingControls.Provider>
				<Context.Provider
					value={React.useMemo(
						() => ({ state, dispatch, interestsDisplayNames }),
						[state, interestsDisplayNames],
					)}
				>
					<Layout>
						{state.activeStep === "profile" && <StepProfile />}
						{state.activeStep === "interests" && <StepInterests />}
						{state.activeStep === "finished" && <StepFinished />}
					</Layout>
				</Context.Provider>
			</OnboardingControls.Provider>
		</Portal>
	);
}
