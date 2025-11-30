import './styles.css';

document.addEventListener('DOMContentLoaded', () => {
	const hero = document.querySelector('#hero');
	const heroKicker = document.querySelector('.hero-kicker');
	const primaryButton = document.querySelector('.btn-primary');

	if (!hero || !heroKicker || !primaryButton) {
		return;
	}

	let hasLaunched = false;

	const freezeButton = () => {
		primaryButton.classList.add('btn-primary--static');
	};

	const launch = () => {
		if (hasLaunched) return;
		hasLaunched = true;

		heroKicker.classList.add('hero-kicker--docked');
		freezeButton();
	};

	// 1) Button click triggers launch
	primaryButton.addEventListener('click', () => {
		launch();
		// Anchor navigation continues to handle scrolling
	});

	// 2) Scroll away from hero also triggers launch
	const observer = new IntersectionObserver(
		(entries) => {
			const entry = entries[0];
			if (!entry) return;

			if (entry.intersectionRatio < 0.85) {
				launch();
				// No need to keep observing once launched
				observer.disconnect();
			}
		},
		{
			threshold: [0, 0.85, 1],
		}
	);

	observer.observe(hero);
});
