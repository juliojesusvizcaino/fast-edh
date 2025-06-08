import type { Attachment } from 'svelte/attachments';

export function press(
	opts: { click?: (e: Event) => void; longpress?: (e: Event) => void },
	duration = 500
): Attachment<HTMLElement> {
	return (node) => {
		let timeout: ReturnType<typeof setTimeout>;
		let ignoreClick = false;

		const handleClick = (e: Event) => {
			if (ignoreClick) {
				ignoreClick = false;
				return;
			}

			opts.click?.(e);
		};

		const handleMouseDown = (e: Event) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				ignoreClick = true;
				opts.longpress?.(e);
				handleMouseDown(e);
			}, duration);
		};

		const handleMouseUp = () => {
			clearTimeout(timeout);
		};

		node.addEventListener('click', handleClick);
		node.addEventListener('mousedown', handleMouseDown);
		document.addEventListener('mouseup', handleMouseUp);
		node.addEventListener('touchstart', handleMouseDown);
		document.addEventListener('touchend', handleMouseUp);

		return () => {
			node.removeEventListener('click', handleClick);
			node.removeEventListener('mousedown', handleMouseDown);
			document.removeEventListener('mouseup', handleMouseUp);
			node.removeEventListener('touchstart', handleMouseDown);
			document.removeEventListener('touchend', handleMouseUp);
		};
	};
}
