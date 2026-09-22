import "./styles.css";

// Check for mobile with screen size or pointer type
const isMobile =
	window.matchMedia("(max-width: 768px)").matches ||
	window.matchMedia("(pointer: coarse)").matches;

document.addEventListener("DOMContentLoaded", () => {
	// Hero video: force muted + play explicitly. Some browsers/dev-reload
	// scenarios don't reliably honor the HTML autoplay/muted attributes alone.
	const heroVideo = document.querySelector(".hero-video");
	if (heroVideo) {
		heroVideo.muted = true;
		heroVideo.playsInline = true;

		const resumeOnInteraction = () => {
			heroVideo.play().catch(() => {});
			window.removeEventListener("click", resumeOnInteraction);
			window.removeEventListener("touchstart", resumeOnInteraction);
		};

		const tryPlay = () => {
			heroVideo.play().catch(() => {
				window.addEventListener("click", resumeOnInteraction, { once: true });
				window.addEventListener("touchstart", resumeOnInteraction, {
					once: true,
				});
			});
		};

		// If metadata is already loaded (cached / fast load), try immediately.
		// Otherwise wait for the browser to signal readiness before calling play().
		if (heroVideo.readyState >= 2) {
			tryPlay();
		} else {
			heroVideo.addEventListener("loadeddata", tryPlay, { once: true });
		}
	}

	// Accordion: one open at a time, all closed by default
	const accordionTriggers = document.querySelectorAll(".accordion-trigger");

	accordionTriggers.forEach((trigger) => {
		const panel = trigger.nextElementSibling;
		panel.setAttribute("aria-hidden", "true");

		trigger.addEventListener("click", () => {
			const isOpen = trigger.getAttribute("aria-expanded") === "true";

			// Close all
			accordionTriggers.forEach((t) => {
				t.setAttribute("aria-expanded", "false");
				t.nextElementSibling.setAttribute("aria-hidden", "true");
			});

			// If it was closed, open it
			if (!isOpen) {
				trigger.setAttribute("aria-expanded", "true");
				panel.setAttribute("aria-hidden", "false");
			}
		});
	});

	const hero = document.querySelector("#hero");
	const navHomeLink = document.querySelector(".nav-home-link");
	const primaryButton = document.querySelector(".btn-primary");

	/* 
		Initial page-load behavior: button glow freezes and the navbar's
		home link fades in once the user scrolls past the hero or clicks
		the primary button. The in-hero kicker no longer docks; it stays
		put and a separate, always-in-the-navbar link takes over that job.
	*/

	if (!hero || !navHomeLink || !primaryButton) {
		return;
	}

	let hasFrozenButton = false;

	const freezeButton = () => {
		if (hasFrozenButton) return;
		hasFrozenButton = true;
		primaryButton.classList.add("btn-primary--static");
	};

	const setNavHomeLinkVisible = (visible) => {
		navHomeLink.classList.toggle("nav-home-link--visible", visible);
	};

	const siteNavbar = document.getElementById("site-navbar");

	const setNavBackground = (visible) => {
		if (!isMobile) return;
		siteNavbar.classList.toggle("nav--scrolled", visible);
	};

	// 1) Button click freezes the glow once (kept one-way; intentional)
	primaryButton.addEventListener("click", () => {
		freezeButton();
		// Anchor navigation continues to handle scrolling
	});

	// 2) Nav home link visibility tracks whether the hero is in view,
	//    continuously, so it hides again if the user scrolls/clicks back up.
	//    On mobile, also toggles a background on the navbar once hero is gone.
	const observer = new IntersectionObserver(
		(entries) => {
			const entry = entries[0];
			if (!entry) return;

			const heroInView = entry.intersectionRatio >= 0.85;
			const heroAlmostGone = entry.intersectionRatio <= 0.15;

			setNavHomeLinkVisible(!heroInView);
			setNavBackground(heroAlmostGone);

			if (!heroInView) {
				freezeButton();
			}
		},
		{
			threshold: [0, 0.15, 0.85, 1],
		},
	);

	observer.observe(hero);

	const navContactBtn = document.querySelector(".nav-contact-btn");
	const contactSection = document.getElementById("contact");

	if (navContactBtn && contactSection && "IntersectionObserver" in window) {
		const contactObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
						// On the contact page → hide the navbar contact button
						navContactBtn.classList.add("nav-contact-btn--hidden");
					} else {
						navContactBtn.classList.remove("nav-contact-btn--hidden");
					}
				});
			},
			{
				threshold: [0.4, 0.6, 0.8],
			},
		);

		contactObserver.observe(contactSection);
	}

	// Contact form: AJAX submit to avoid redirect and update button text
	const contactForm = document.querySelector("#contact form");

	if (contactForm) {
		contactForm.addEventListener("submit", async (event) => {
			event.preventDefault();

			const form = event.target;
			const submitButton = form.querySelector('button[type="submit"]');

			if (!submitButton) {
				form.submit(); // fallback
				return;
			}

			const originalText = submitButton.textContent;
			submitButton.disabled = true;
			submitButton.textContent = "Sending…";

			try {
				const formData = new FormData(form);
				const response = await fetch(form.action, {
					method: form.method || "POST",
					body: formData,
					headers: {
						Accept: "application/json",
					},
				});

				if (response.ok) {
					submitButton.textContent = "Message sent";
					form.reset();
				} else {
					submitButton.textContent = "Try again";
					submitButton.disabled = false;
				}
			} catch (error) {
				submitButton.textContent = "Error – try again";
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
		* Intercepts wheel scrolling to create a "paged" vertical experience:
		* - Small scrolls → small nudge + snap back
		* - Strong scrolls → immediate smooth page flip
		* - No flipping while animating
		* - Touch/keyboard/mobile unaffected
		* Adjust THRESHOLD, MAX_NUDGE, NUDGE_FACTOR to tune feel.
	*/

	const sections = Array.from(document.querySelectorAll(".page-section"));
	if (sections.length) {
		let isFlipping = false;

		let gestureActive = false;
		let scrollAccumulator = 0;
		let baseIndex = 0;
		let baseScrollTop = 0;
		let lastWheelTime = 0;
		let settleTimeoutId = null;

		const THRESHOLD = 150; // how hard you have to scroll to flip
		const RESET_MS = 320; // gesture timeout
		const MAX_NUDGE = 40; // max px the page will move as a "nudge"
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
					Math.min(MAX_NUDGE, scrollAccumulator * NUDGE_FACTOR),
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
			{ passive: false },
		);
	}

	const page2 = document.getElementById("page2");
	const scrollIndicator = document.querySelector(".scroll-indicator");

	if (page2 && scrollIndicator && "IntersectionObserver" in window) {
		const indicatorObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					// Only show when Page 2 is effectively "the page in frame"
					if (entry.isIntersecting && entry.intersectionRatio >= 0.99) {
						scrollIndicator.classList.add("scroll-indicator--visible");
					} else {
						scrollIndicator.classList.remove("scroll-indicator--visible");
					}
				});
			},
			{
				// we only care about near-full visibility
				threshold: [0.5, 0.75, 0.95, 1],
			},
		);

		indicatorObserver.observe(page2);
	}
});
