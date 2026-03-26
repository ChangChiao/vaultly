import { browser } from '$app/environment';

let dark = $state(true);

if (browser) {
	const stored = localStorage.getItem('theme');
	dark = stored ? stored === 'dark' : true;
	applyTheme();
}

function applyTheme() {
	if (!browser) return;
	document.documentElement.classList.toggle('dark', dark);
	localStorage.setItem('theme', dark ? 'dark' : 'light');
}

export function getTheme() {
	return {
		get dark() {
			return dark;
		},
		toggle() {
			dark = !dark;
			applyTheme();
		}
	};
}
