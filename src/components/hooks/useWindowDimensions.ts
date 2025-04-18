import { useEffect, useState } from "react";

export const useWindowDimensions = () => {
	const [dimensions, setDimensions] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
		fontScale: window.devicePixelRatio || 1,
	});

	useEffect(() => {
		const handleResize = () => {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
				fontScale: window.devicePixelRatio || 1,
			});
		};

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return dimensions;
};
