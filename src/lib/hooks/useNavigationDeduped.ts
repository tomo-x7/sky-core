// export type DebouncedNavigationProp = Pick<
// 	NavigationProp,
// 	"popToTop" | "push" | "navigate" | "canGoBack" | "replace" | "dispatch" | "goBack" | "getState"
// >;

// export function useNavigationDeduped() {
// 	const navigation = useNavigation<NavigationProp>();
// 	const dedupe = useDedupe();

// 	return React.useMemo(
// 		(): DebouncedNavigationProp => ({
// 			// Types from @react-navigation/routers/lib/typescript/src/StackRouter.ts
// 			push: <RouteName extends keyof AllNavigatorParams>(
// 				...args: undefined extends AllNavigatorParams[RouteName]
// 					? [screen: RouteName] | [screen: RouteName, params: AllNavigatorParams[RouteName]]
// 					: [screen: RouteName, params: AllNavigatorParams[RouteName]]
// 			) => {
// 				dedupe(() => navigation.push(...args));
// 			},
// 			// Types from @react-navigation/core/src/types.tsx
// 			navigate: <RouteName extends keyof AllNavigatorParams>(
// 				...args: RouteName extends unknown
// 					? undefined extends AllNavigatorParams[RouteName]
// 						? [screen: RouteName] | [screen: RouteName, params: AllNavigatorParams[RouteName]]
// 						: [screen: RouteName, params: AllNavigatorParams[RouteName]]
// 					: never
// 			) => {
// 				dedupe(() => navigation.navigate(...args));
// 			},
// 			// Types from @react-navigation/routers/lib/typescript/src/StackRouter.ts
// 			replace: <RouteName extends keyof AllNavigatorParams>(
// 				...args: undefined extends AllNavigatorParams[RouteName]
// 					? [screen: RouteName] | [screen: RouteName, params: AllNavigatorParams[RouteName]]
// 					: [screen: RouteName, params: AllNavigatorParams[RouteName]]
// 			) => {
// 				dedupe(() => navigation.replace(...args));
// 			},
// 			dispatch: (action: NavigationAction | ((state: NavigationState) => NavigationAction)) => {
// 				dedupe(() => navigation.dispatch(action));
// 			},
// 			popToTop: () => {
// 				dedupe(() => navigation.popToTop());
// 			},
// 			goBack: () => {
// 				dedupe(() => navigation.goBack());
// 			},
// 			canGoBack: () => {
// 				return navigation.canGoBack();
// 			},
// 			getState: () => {
// 				return navigation.getState();
// 			},
// 		}),
// 		[dedupe, navigation],
// 	);
// }
