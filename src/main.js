import './styles.css';

// Check for mobile with screen size or pointer type
const isMobile =
	window.matchMedia('(max-width: 768px)').matches ||
	window.matchMedia('(pointer: coarse)').matches;

document.addEventListener('DOMContentLoaded', () => {
	const hero = document.querySelector('#hero');
	const heroKicker = document.querySelector('.hero-kicker');
	const primaryButton = document.querySelector('.btn-primary');

	/* 
		Initial page-load behavior, button glow, and hero-kicker repositioning.
		After the user scrolls far enough, or the "Get Started" button is
		pressed, the button glow ceases and the hero-kicker DIV is moved to the
		upper left hand corner.
	*/ 

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

	// Contact form: AJAX submit to avoid redirect and update button text
	const contactForm = document.querySelector('#contact form');

	if (contactForm) {
		contactForm.addEventListener('submit', async (event) => {
			event.preventDefault();

			const form = event.target;
			const submitButton = form.querySelector('button[type="submit"]');

			if (!submitButton) {
				form.submit(); // fallback
				return;
			}

			const originalText = submitButton.textContent;
			submitButton.disabled = true;
			submitButton.textContent = 'Sending…';

			try {
				const formData = new FormData(form);
				const response = await fetch(form.action, {
					method: form.method || 'POST',
					body: formData,
					headers: {
						Accept: 'application/json',
					},
				});

				if (response.ok) {
					submitButton.textContent = 'Message sent';
					form.reset();
				} else {
					submitButton.textContent = 'Try again';
					submitButton.disabled = false;
				}
			} catch (error) {
				submitButton.textContent = 'Error — try again';
				submitButton.disabled = false;
			}
		});
	}


	// If mobile, bail.
	if (isMobile) {
		return;
	}

	/*
		Paper-page style sticky scrolling.
		* Intercepts wheel scrolling to create a “paged” vertical experience:
		* - Small scrolls → small nudge + snap back
		* - Strong scrolls → immediate smooth page flip
		* - No flipping while animating
		* - Touch/keyboard/mobile unaffected
		* Adjust THRESHOLD, MAX_NUDGE, NUDGE_FACTOR to tune feel.
	*/

	const sections = Array.from(document.querySelectorAll('.page-section'));
	if (sections.length) {
	let isFlipping = false;

	let gestureActive = false;
	let scrollAccumulator = 0;
	let baseIndex = 0;
	let baseScrollTop = 0;
	let lastWheelTime = 0;
	let settleTimeoutId = null;

	const THRESHOLD = 220;   // how hard you have to scroll to flip
	const RESET_MS = 320;    // gesture timeout
	const MAX_NUDGE = 40;    // max px the page will move as a "nudge"
	const NUDGE_FACTOR = 0.25; // how much of the accumulated delta we use for the nudge

	const getCurrentSectionIndex = () => {
		const viewportMiddle = window.innerHeight / 2;

		let closestIndex = 0;
		let closestDistance = Infinity;

		sections.forEach((section, index) => {
			const rect = section.getBoundingClientRect();
			const sectionMiddle = rect.top + rect.height / 2;
			const distance = Math.abs(sectionMiddle - viewportMiddle);

			if (distance < closestDistance) {
				closestDistance = distance;
				closestIndex = index;
			}
		});

		return closestIndex;
	};

	const scrollToSection = (index) => {
		if (index < 0 || index >= sections.length) return;

		isFlipping = true;

		const target = sections[index];
		const top = window.scrollY + target.getBoundingClientRect().top;

		window.scrollTo({
			top,
			behavior: "smooth",
		});

		setTimeout(() => {
			isFlipping = false;
		}, 600);
	};

	window.addEventListener(
		"wheel",
		(event) => {
			if (event.ctrlKey) return;
			if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

			if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
				return;
			}

			if (isFlipping) {
				event.preventDefault();
				return;
			}

			event.preventDefault();

			const now = performance.now();
			if (!gestureActive || now - lastWheelTime > RESET_MS) {
				// new gesture
				gestureActive = true;
				scrollAccumulator = 0;
				baseIndex = getCurrentSectionIndex();
				baseScrollTop = window.scrollY;
			}
			lastWheelTime = now;

			scrollAccumulator += event.deltaY;

			// VISUAL NUDGE:
			const offset = Math.max(
				-MAX_NUDGE,
				Math.min(MAX_NUDGE, scrollAccumulator * NUDGE_FACTOR)
			);

			window.scrollTo({
				top: baseScrollTop + offset,
				behavior: "auto",
			});

			// 🟧 NEW FAST-PATH: Flip immediately when threshold reached
			if (Math.abs(scrollAccumulator) >= THRESHOLD) {
				const direction = Math.sign(scrollAccumulator);

				const targetIndex =
					direction > 0
						? Math.min(baseIndex + 1, sections.length - 1)
						: Math.max(baseIndex - 1, 0);

				if (targetIndex !== baseIndex) {
					scrollToSection(targetIndex);
				} else {
					scrollToSection(baseIndex); // at edge
				}

				// reset state
				gestureActive = false;
				scrollAccumulator = 0;
				clearTimeout(settleTimeoutId);
				return;
			}

			// 🟦 Otherwise: restart settle timer for snap-back
			clearTimeout(settleTimeoutId);
			settleTimeoutId = setTimeout(() => {
				gestureActive = false;

				// below threshold → snap back
				scrollToSection(baseIndex);
				scrollAccumulator = 0;
			}, 200);
		},
		{ passive: false }
	);
	}

	/**
	 * Parallax dust system
	 * --------------------
	 * Renders a subtle drifting "dust" field across the viewport.
	 *
	 * - Default: enabled, unless `prefers-reduced-motion: reduce` is set.
	 * - Can be toggled ON/OFF at runtime via events:
	 *     window.dispatchEvent(new Event('dust:enable'));
	 *     window.dispatchEvent(new Event('dust:disable'));
	 *     window.dispatchEvent(new Event('dust:toggle'));
	 *
	 * - Safe: cleans up its own RAF + resize listeners on disable.
	 * - Future-proof: if #dust-layer is missing or motion is reduced, it no-ops.
	 */

	(function setupDustSystem() {
		const dustLayer = document.getElementById('dust-layer');
		if (!dustLayer) return;

		const prefersReducedMotion = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) {
			// Respect user setting: never run dust if reduced motion is requested
			return;
		}

		const NUM_PARTICLES = 200;

		const state = {
			enabled: true,        // default ON
			particles: [],
			rafId: null,
			lastTime: performance.now(),
			lastScrollY: window.scrollY,
			resizeHandler: null,
		};

		const createParticles = () => {
			const vw = window.innerWidth;
			const vh = window.innerHeight;

			dustLayer.innerHTML = '';
			state.particles.length = 0;

			for (let i = 0; i < NUM_PARTICLES; i++) {
				const el = document.createElement('span');
				el.className = 'dust-particle';

				const depth = 0.3 + Math.random() * 0.7; // 0.3..1

				// Particle size adjustment
				const size = 2.5 + Math.random() * 3.5 * depth;
				el.style.width = `${size}px`;
				el.style.height = `${size}px`;

				// Particle opacity adjustment
				const opacity = 0.50 + Math.random() * 0.35;
				el.style.opacity = opacity.toFixed(2);

				if (Math.random() < 0.6) {
					el.style.backgroundColor = 'var(--color-dust-1)';
				} else {
					el.style.backgroundColor = 'var(--color-dust-2)';
				}

				el.style.filter = `blur(${(0.6 + Math.random() * 1.4).toFixed(2)}px)`;

				dustLayer.appendChild(el);

				state.particles.push({
					el,
					x: Math.random() * vw,
					y: Math.random() * vh,
					depth,
					// "Deeper" → slower
					vx: (Math.random() - 0.5) * 0.01 * depth,
					vy: (0.004 + Math.random() * 0.01) * depth,
				});
			}
		};

		const step = (time) => {
			if (!state.enabled) return; // safety guard
			const dt = time - state.lastTime;
			state.lastTime = time;

			const vw = window.innerWidth;
			const vh = window.innerHeight;

			const scrollY = window.scrollY;
			const scrollDelta = scrollY - state.lastScrollY;
			state.lastScrollY = scrollY;

			for (const p of state.particles) {
				// time-based drift
				p.x += p.vx * dt;
				p.y += p.vy * dt;

				// subtle parallax on scroll
				const parallaxOffsetY = scrollDelta * (1 - p.depth) * 0.15;

				// wrap around edges
				if (p.x < -20) p.x = vw + 20;
				if (p.x > vw + 20) p.x = -20;
				if (p.y > vh + 20) p.y = -20;
				if (p.y < -20) p.y = vh + 20;

				const tx = p.x;
				const ty = p.y + parallaxOffsetY;

				p.el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(
					2
				)}px, 0) scale(${p.depth.toFixed(2)})`;
			}

			state.rafId = requestAnimationFrame(step);
		};

		const start = () => {
			if (state.rafId != null) return; // already running
			state.lastTime = performance.now();
			state.lastScrollY = window.scrollY;
			state.rafId = requestAnimationFrame(step);
		};

		const stop = () => {
			if (state.rafId != null) {
				cancelAnimationFrame(state.rafId);
				state.rafId = null;
			}
		};

		const enable = () => {
			if (state.enabled) return;
			state.enabled = true;
			createParticles();
			start();

			if (!state.resizeHandler) {
				state.resizeHandler = () => {
					if (!state.enabled) return;
					createParticles();
				};
				window.addEventListener('resize', state.resizeHandler);
			}
		};

		const disable = () => {
			if (!state.enabled) return;
			state.enabled = false;
			stop();
			state.particles.length = 0;
			dustLayer.innerHTML = '';

			if (state.resizeHandler) {
				window.removeEventListener('resize', state.resizeHandler);
				state.resizeHandler = null;
			}
		};

		const toggle = () => {
			if (state.enabled) {
				disable();
			} else {
				enable();
			}
		};

		// Initial start (default ON)
		createParticles();
		start();
		state.resizeHandler = () => {
			if (!state.enabled) return;
			createParticles();
		};
		window.addEventListener('resize', state.resizeHandler);

		// Event-driven toggles
		window.addEventListener('dust:enable', enable);
		window.addEventListener('dust:disable', disable);
		window.addEventListener('dust:toggle', toggle);
	})();

	const page2 = document.getElementById('page2');
	const scrollIndicator = document.querySelector('.scroll-indicator');

	if (page2 && scrollIndicator && 'IntersectionObserver' in window) {
		const indicatorObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					// Only show when Page 2 is effectively "the page in frame"
					if (entry.isIntersecting && entry.intersectionRatio >= 0.99) {
						scrollIndicator.classList.add('scroll-indicator--visible');
					} else {
						scrollIndicator.classList.remove('scroll-indicator--visible');
					}
				});
			},
			{
				// we only care about near-full visibility
				threshold: [0.5, 0.75, 0.95, 1],
			}
		);

		indicatorObserver.observe(page2);
	}

});
