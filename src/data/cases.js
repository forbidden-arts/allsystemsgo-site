// Every case, newest first. Edit copy here and every page that shows the case updates.
// year is only displayed when showYear is true.

export const cases = [
	{
		id: "wartsila",
		name: "Wärtsilä",
		year: "2025",
		showYear: false,
		tags: ["Strategy", "Roadmapping"],
		offerings: ["strategy", "roadmapping"],
		headline:
			"From technical plans to real strategy: teaching engineering teams to think, plan, and present strategically",
		facts: [
			["Offering", "Strategy, roadmapping"],
			["Format", "Four workshops"],
			["Result", "Expanded to three more teams"],
		],
		situation:
			"A team of engineers was treating its technical development plans as a strategy roadmap.",
		did: [
			"Strategy fundamentals",
			"Stakeholder management",
			"Roadmapping and OKRs",
			"Strategy communication",
		],
		result:
			"The teams moved from describing technology to making a case for it. The program expanded to three additional teams.",
		quote: {
			text: "When our engineers gave their presentions, it was very obvious which speakers had worked with Dan.",
			by: "Tom Backlund, General Manager, Wärtsilä",
		},
	},
	{
		id: "asana",
		name: "Asana",
		year: "2023",
		showYear: false,
		tags: ["Strategy", "Roadmapping", "AI"],
		offerings: ["strategy", "roadmapping"],
		headline:
			"How do you reposition a work-management product when GenAI and agentic workflows rewrite the market?",
		facts: [
			["Offering", "Strategy, AI roadmapping"],
			["Format", "A running series of calls over nine months"],
			["Partner", "Head of Market Strategy"],
		],
		situation:
			"Asana's value proposition was not well defined. GPT-3 disrupted whatever plans were in place, and the market was rewriting itself around AI.",
		did: "Together with the Head of Market Strategy we analyzed the landscape, mapped the options, and set out the capabilities to build, in a running series of calls over nine months.",
		result: "Asana repositioned itself around the Coordination Layer.",
		quote: {
			text: "Dan's big-picture perspective helped us understand where we were, what options were available, and the steps necessary to start building those capabilities.",
			by: "Tim Bowman, Head of Market Strategy, Asana",
		},
	},
	{
		id: "beiersdorf",
		name: "Beiersdorf",
		year: "2020",
		showYear: false,
		tags: ["Growth", "Business design", "MVP"],
		offerings: ["growth"],
		headline:
			"Out-moving an agile startup: a personalized-at-scale product and a live store in under three weeks",
		facts: [
			["Offering", "Growth, business design"],
			["Format", "Two-week design sprint"],
			["Result", "Store live two days after the sprint"],
			["Production", "Four weeks after launch"],
		],
		situation:
			"An agile startup was out-moving a global brand with a personalized product, around 8,000 options driven by machine learning and an app.",
		did: "We led the sprint at the start and facilitated from the first converge, from zero to an MVP and a working website. We coordinated the website launch.",
		result:
			"The full store went live two days after the sprint. Production started four weeks later.",
	},
	{
		id: "f5",
		name: "F5",
		showYear: false,
		tags: ["Roadmapping", "Proof of concept", "Business design"],
		offerings: ["roadmapping", "growth"],
		headline:
			"From hardware to as-a-Service: a working sales and operations tool, taken from proof of concept to production",
		facts: [
			["Offering", "Roadmapping, proof of concept, business design"],
			["Format", "Working tool in Excel and VBA"],
			["Result", "Rebuilt for production by F5 developers"],
		],
		situation:
			"F5 was moving from selling physical products to selling as a service, and the sales and operations teams needed tools that matched the new model.",
		did: "We built an internal sales and operational tool as a proof of concept, in VBA within Excel, and piloted it with the teams.",
		result:
			"After the pilot, F5's own developers built the production version.",
	},
	{
		id: "samsung",
		name: "Samsung",
		year: "2019",
		showYear: false,
		tags: ["Strategy", "Roadmapping", "Market entry"],
		offerings: ["strategy", "roadmapping"],
		headline:
			"Not another smart speaker: the blueprint for a true SmartHome ecosystem",
		facts: [
			["Offering", "Roadmapping, strategy, market entry"],
			["Year", "2019"],
			["Duration", "Four months"],
			["Deliverable", "The SmartHome blueprint"],
		],
		situation:
			"Samsung was catching up to Alexa and needed a way into the home that was not another smart speaker.",
		did: "We developed the blueprint for a true SmartHome ecosystem: the strategy, the roadmap, and the market entry plan.",
		result: "The blueprint became version 1.0 of Samsung's SmartHome strategy.",
	},
	{
		id: "microsoft",
		name: "Microsoft",
		year: "2017 to 2018",
		showYear: false,
		tags: ["Strategy", "Foresight"],
		offerings: ["strategy", "growth"],
		headline:
			"From follower to thought leader: a 17-paper future series that mapped the AI era five years before ChatGPT",
		facts: [
			["Offering", "Strategy, foresight"],
			["Period", "March 2017 to December 2018"],
			["Scope", "17 papers"],
			["Credit", "Eight written end to end, three also designed"],
		],
		situation:
			"Microsoft wanted to be seen as a thought leader on where industries were going, rather than a follower reacting to them.",
		did: "Concept and outline for all 17 papers: the scenarios, causal chains, opportunities, threats, and business model changes, with stakeholder interviews to keep them grounded. Eight written end to end, three also designed.",
		result:
			"Papers on banking, manufacturing, retail, cybersecurity, and more, published and showcased through 2017 and 2018. Several saw the AI era coming four to five years before ChatGPT.",
		link: {
			href: "/strategy.html#papers",
			text: "Read the papers and what they saw coming",
		},
	},
];

export const casesById = Object.fromEntries(cases.map((c) => [c.id, c]));
