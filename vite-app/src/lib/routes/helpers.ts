// function getCurrentRoute(state?: State) {
// 	if (!state) {
// 		return { name: "Home" };
// 	}

// 	let node = state.routes[state.index || 0];
// 	while (node.state?.routes && typeof node.state?.index === "number") {
// 		node = node.state?.routes[node.state?.index];
// 	}
// 	return node;
// }

// function isTab(current: string, route: string) {
// 	// NOTE
// 	// our tab routes can be variously referenced by 3 different names
// 	// this helper deals with that weirdness
// 	// -prf
// 	return current === route || current === `${route}Tab` || current === `${route}Inner`;
// }

// enum TabState {
// 	InsideAtRoot = 0,
// 	Inside = 1,
// 	Outside = 2,
// }
// function getTabState(state: State | undefined, tab: string): TabState {
// 	if (!state) {
// 		return TabState.Outside;
// 	}
// 	const currentRoute = getCurrentRoute(state);
// 	if (isTab(currentRoute.name, tab)) {
// 		return TabState.InsideAtRoot;
// 	} else if (isTab(state.routes[state.index || 0].name, tab)) {
// 		return TabState.Inside;
// 	}
// 	return TabState.Outside;
// }

// type ExistingState = {
// 	name: string;
// 	params?: RouteParams;
// };
// function buildStateObject(stack: string, route: string, params: RouteParams, state: ExistingState[] = []) {
// 	if (stack === "Flat") {
// 		return {
// 			routes: [{ name: route, params }],
// 		};
// 	}
// 	return {
// 		routes: [
// 			{
// 				name: stack,
// 				state: {
// 					routes: [...state, { name: route, params }],
// 				},
// 			},
// 		],
// 	};
// }
