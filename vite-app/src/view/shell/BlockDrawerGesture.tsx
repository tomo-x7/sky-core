export function BlockDrawerGesture({ children }: { children: React.ReactNode }) {
	return children;
	// const drawerGesture = useContext(DrawerGestureContext) ?? Gesture.Native(); // noop for web
	// const scrollGesture = Gesture.Native().blocksExternalGesture(drawerGesture);
	// return <GestureDetector gesture={scrollGesture}>{children}</GestureDetector>;
}
