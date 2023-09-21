
/**
 * Default game width.
 * @const
 */
var DEFAULT_WIDTH = 600;

/**
 * Frames per second.
 * @const
 */
var FPS = 60;

/** @const */
var IS_HIDPI = window.devicePixelRatio > 1;

/** @const */
var IS_IOS = /iPad|iPhone|iPod/.test(window.navigator.platform);

/** @const */
var IS_MOBILE = /Android/.test(window.navigator.userAgent) || IS_IOS;

/** @const */
var IS_TOUCH_ENABLED = "ontouchstart" in window;

export {DEFAULT_WIDTH, FPS, IS_HIDPI, IS_IOS, IS_MOBILE, IS_TOUCH_ENABLED}