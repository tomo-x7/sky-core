import type { ViewProps } from "react-native";

export interface GifViewStateChangeEvent {
	nativeEvent: {
		isPlaying: boolean;
		isLoaded: boolean;
	};
}

export interface GifViewProps {
	autoplay?: boolean;
	source?: string;
	placeholderSource?: string;
	onPlayerStateChange?: (event: GifViewStateChangeEvent) => void;
	style: React.CSSProperties;
	accessibilityLabel: string;
	accessibilityHint:string
}
