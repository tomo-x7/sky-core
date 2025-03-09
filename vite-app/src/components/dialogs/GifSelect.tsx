import React, { useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Image } from "react-native";
import { type TextInput, View } from "react-native";
import { useWindowDimensions } from "react-native";

import { atoms as a, ios, native, useBreakpoints, useTheme, web } from "#/alf";
import { Button, ButtonIcon, ButtonText } from "#/components/Button";
import * as Dialog from "#/components/Dialog";
import { ListFooter, ListMaybePlaceholder } from "#/components/Lists";
import * as TextField from "#/components/forms/TextField";
import { useThrottledValue } from "#/components/hooks/useThrottledValue";
import { ArrowLeft_Stroke2_Corner0_Rounded as Arrow } from "#/components/icons/Arrow";
import { MagnifyingGlass2_Stroke2_Corner0_Rounded as Search } from "#/components/icons/MagnifyingGlass2";
import { cleanError } from "#/lib/strings/errors";
import { isWeb } from "#/platform/detection";
import { type Gif, useFeaturedGifsQuery, useGifSearchQuery } from "#/state/queries/tenor";
import { ErrorBoundary } from "#/view/com/util/ErrorBoundary";
import type { ListMethods } from "#/view/com/util/List";
import { ErrorScreen } from "#/view/com/util/error/ErrorScreen";

export function GifSelectDialog({
	controlRef,
	onClose,
	onSelectGif: onSelectGifProp,
}: {
	controlRef: React.RefObject<{ open: () => void }>;
	onClose?: () => void;
	onSelectGif: (gif: Gif) => void;
}) {
	const control = Dialog.useDialogControl();

	useImperativeHandle(controlRef, () => ({
		open: () => control.open(),
	}));

	const onSelectGif = useCallback(
		(gif: Gif) => {
			control.close(() => onSelectGifProp(gif));
		},
		[control, onSelectGifProp],
	);

	const renderErrorBoundary = useCallback((error: unknown) => <DialogError details={String(error)} />, []);

	return (
		<Dialog.Outer
			control={control}
			onClose={onClose}
			nativeOptions={{
				//@ts-ignore
				bottomInset: 0,
				// use system corner radius on iOS
				...ios({ cornerRadius: undefined }),
			}}
		>
			<Dialog.Handle />
			<ErrorBoundary renderError={renderErrorBoundary}>
				<GifList control={control} onSelectGif={onSelectGif} />
			</ErrorBoundary>
		</Dialog.Outer>
	);
}

function GifList({
	control,
	onSelectGif,
}: {
	control: Dialog.DialogControlProps;
	onSelectGif: (gif: Gif) => void;
}) {
	const t = useTheme();
	const { gtMobile } = useBreakpoints();
	const textInputRef = useRef<TextInput>(null);
	const listRef = useRef<ListMethods>(null);
	const [undeferredSearch, setSearch] = useState("");
	const search = useThrottledValue(undeferredSearch, 500);
	const { height } = useWindowDimensions();

	const isSearching = search.length > 0;

	const trendingQuery = useFeaturedGifsQuery();
	const searchQuery = useGifSearchQuery(search);

	const { data, fetchNextPage, isFetchingNextPage, hasNextPage, error, isPending, isError, refetch } = isSearching
		? searchQuery
		: trendingQuery;

	const flattenedData = useMemo(() => {
		return data?.pages.flatMap((page) => page.results) || [];
	}, [data]);

	const renderItem = useCallback(
		({ item }: { item: Gif }) => {
			return <GifPreview gif={item} onSelectGif={onSelectGif} />;
		},
		[onSelectGif],
	);

	const onEndReached = React.useCallback(() => {
		if (isFetchingNextPage || !hasNextPage || error) return;
		fetchNextPage();
	}, [isFetchingNextPage, hasNextPage, error, fetchNextPage]);

	const hasData = flattenedData.length > 0;

	const onGoBack = useCallback(() => {
		if (isSearching) {
			// clear the input and reset the state
			textInputRef.current?.clear();
			setSearch("");
		} else {
			control.close();
		}
	}, [control, isSearching]);

	const listHeader = useMemo(() => {
		return (
			<View
				style={[native(a.pt_4xl), a.relative, a.mb_lg, a.flex_row, a.align_center, !gtMobile && web(a.gap_md)]}
			>
				{/* cover top corners */}
				<View
					style={[
						a.absolute,
						a.inset_0,
						{
							borderBottomLeftRadius: 8,
							borderBottomRightRadius: 8,
						},
						t.atoms.bg,
					]}
				/>

				{!gtMobile && isWeb && (
					<Button
						size="small"
						variant="ghost"
						color="secondary"
						shape="round"
						onPress={() => control.close()}
						label="Close GIF dialog"
					>
						<ButtonIcon icon={Arrow} size="md" />
					</Button>
				)}

				<TextField.Root>
					<TextField.Icon icon={Search} />
					<TextField.Input
						label="Search GIFs"
						placeholder="Search Tenor"
						onChangeText={(text) => {
							setSearch(text);
							listRef.current?.scrollToOffset({ offset: 0, animated: false });
						}}
						returnKeyType="search"
						clearButtonMode="while-editing"
						inputRef={textInputRef}
						maxLength={50}
						onKeyPress={({ nativeEvent }) => {
							if (nativeEvent.key === "Escape") {
								control.close();
							}
						}}
					/>
				</TextField.Root>
			</View>
		);
	}, [gtMobile, t.atoms.bg, control]);

	return (
		<>
			{gtMobile && <Dialog.Close />}
			<Dialog.InnerFlatList
				ref={listRef}
				key={gtMobile ? "3 cols" : "2 cols"}
				data={flattenedData}
				renderItem={renderItem}
				numColumns={gtMobile ? 3 : 2}
				columnWrapperStyle={[a.gap_sm]}
				//@ts-ignore
				contentContainerStyle={[web(a.h_full_vh)]}
				//@ts-ignore
				style={[web(a.h_full_vh)]}
				ListHeaderComponent={
					<>
						{listHeader}
						{!hasData && (
							<ListMaybePlaceholder
								isLoading={isPending}
								isError={isError}
								onRetry={refetch}
								onGoBack={onGoBack}
								emptyType="results"
								sideBorders={false}
								topBorder={false}
								errorTitle="Failed to load GIFs"
								errorMessage="There was an issue connecting to Tenor."
								emptyMessage={
									isSearching
										? `No search results found for "${search}".`
										: "No featured GIFs found. There may be an issue with Tenor."
								}
							/>
						)}
					</>
				}
				stickyHeaderIndices={[0]}
				onEndReached={onEndReached}
				onEndReachedThreshold={4}
				keyExtractor={(item: Gif) => item.id}
				keyboardDismissMode="on-drag"
				ListFooterComponent={
					hasData ? (
						<ListFooter
							isFetchingNextPage={isFetchingNextPage}
							error={cleanError(error)}
							onRetry={fetchNextPage}
							style={{ borderTopWidth: 0 }}
						/>
					) : null
				}
			/>
		</>
	);
}

function DialogError({ details }: { details?: string }) {
	const control = Dialog.useDialogContext();

	return (
		<Dialog.ScrollableInner style={a.gap_md} label="An error has occurred">
			<Dialog.Close />
			<ErrorScreen
				title="Oh no!"
				message="There was an unexpected issue in the application. Please let us know if this happened to you!"
				details={details}
			/>
			<Button label="Close dialog" onPress={() => control.close()} color="primary" size="large" variant="solid">
				<ButtonText>Close</ButtonText>
			</Button>
		</Dialog.ScrollableInner>
	);
}

export function GifPreview({
	gif,
	onSelectGif,
}: {
	gif: Gif;
	onSelectGif: (gif: Gif) => void;
}) {
	const { gtTablet } = useBreakpoints();
	const t = useTheme();

	const onPress = useCallback(() => {
		logEvent("composer:gif:select", {});
		onSelectGif(gif);
	}, [onSelectGif, gif]);

	return (
		<Button
			label={`Select GIF "${gif.title}"`}
			style={[a.flex_1, gtTablet ? { maxWidth: "33%" } : { maxWidth: "50%" }]}
			onPress={onPress}
		>
			{({ pressed }) => (
				<Image
					style={[
						a.flex_1,
						a.mb_sm,
						a.rounded_sm,
						{ aspectRatio: 1, opacity: pressed ? 0.8 : 1 },
						t.atoms.bg_contrast_25,
					]}
					source={{
						uri: gif.media_formats.tinygif.url,
					}}
					//@ts-ignore
					contentFit="cover"
					accessibilityLabel={gif.title}
					accessibilityHint=""
					cachePolicy="none"
					accessibilityIgnoresInvertColors
				/>
			)}
		</Button>
	);
}
