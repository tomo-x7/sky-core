const isMobileWebMediaQuery = "only screen and (max-width: 1300px)";
export const isMobileWeb = window.matchMedia(isMobileWebMediaQuery)?.matches;
export const isIPhoneWeb = /iPhone/.test(navigator.userAgent);
