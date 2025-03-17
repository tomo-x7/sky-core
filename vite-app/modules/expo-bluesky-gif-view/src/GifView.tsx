import * as React from "react";
import type { GifViewProps } from "./GifView.types";

export type GifViewHandle = {
	playAsync: () => Promise<void>;
	pauseAsync: () => Promise<void>;
	toggleAsync: () => Promise<void>;
};

const GifView = React.memo(
	React.forwardRef<GifViewHandle, GifViewProps>((props, ref) => {
		const videoPlayerRef = React.useRef<HTMLVideoElement>(null);
		// isLoaded は再描画の必要がないため useRef で管理
		const isLoadedRef = React.useRef(false);
		// 前回の autoplay 値を保持
		const prevAutoplayRef = React.useRef(props.autoplay);

		// インスタンスメソッド相当の関数を定義
		const playAsync = React.useCallback(async () => {
			videoPlayerRef.current?.play();
		}, []);

		const pauseAsync = React.useCallback(async () => {
			videoPlayerRef.current?.pause();
		}, []);

		const toggleAsync = React.useCallback(async () => {
			if (videoPlayerRef.current?.paused) {
				await playAsync();
			} else {
				await pauseAsync();
			}
		}, [playAsync, pauseAsync]);

		// 外部からメソッド呼び出しできるように公開
		React.useImperativeHandle(ref, () => ({
			playAsync,
			pauseAsync,
			toggleAsync,
		}));

		// プレイヤー状態の変更を外部に通知する関数
		const firePlayerStateChangeEvent = React.useCallback(() => {
			props.onPlayerStateChange?.({
				nativeEvent: {
					isPlaying: !!(videoPlayerRef.current && !videoPlayerRef.current.paused),
					isLoaded: isLoadedRef.current,
				},
			});
		}, [props]);

		// onLoad（初回のみ実行）
		const onLoad = React.useCallback(() => {
			if (isLoadedRef.current) {
				return;
			}
			isLoadedRef.current = true;
			firePlayerStateChangeEvent();
		}, [firePlayerStateChangeEvent]);

		// autoplay プロパティ変更時に再生/停止を制御（componentDidUpdate 相当）
		React.useEffect(() => {
			if (prevAutoplayRef.current !== props.autoplay) {
				if (props.autoplay) {
					playAsync();
				} else {
					pauseAsync();
				}
				prevAutoplayRef.current = props.autoplay;
			}
		}, [props.autoplay, playAsync, pauseAsync]);

		return (
			<video
				src={props.source}
				autoPlay={props.autoplay ? true : undefined}
				preload={props.autoplay ? "auto" : undefined}
				playsInline
				loop
				muted
				style={props.style}
				onCanPlay={onLoad}
				onPlay={firePlayerStateChangeEvent}
				onPause={firePlayerStateChangeEvent}
				aria-label={props.accessibilityLabel}
				ref={videoPlayerRef}
			/>
		);
	}),
);

export { GifView };
