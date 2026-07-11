interface Update {
	date: string;
	title: string;
	note: string;
}

const UPDATES: Update[] = [
	{
		date: "Jul 11, 2026",
		title: "Driver-exact chart",
		note: "Plots the true gain mode sensitivity on a fixed scale, with your mouse's raw DPI marked."
	},
	{
		date: "Jul 11, 2026",
		title: "Crosshair favicon and share cards",
		note: "The app now has its own browser icon and rich link previews."
	},
	{
		date: "Jul 11, 2026",
		title: "Smarter recommendations",
		note: "Contextual tips plus a cm per screen stat, tuned to your DPI and preference."
	},
	{
		date: "Jul 11, 2026",
		title: "100 sensitivity notches",
		note: "The preference slider now runs 1 to 100 for much finer control."
	},
	{
		date: "Jul 11, 2026",
		title: "Readable chart",
		note: "Speed zones, halfway marker, and labeled base, cap, and accel start."
	},
	{
		date: "Jul 11, 2026",
		title: "TypeScript rewrite",
		note: "The whole app is now strictly typed end to end."
	}
];

export default function UpdatesAside() {
	return (
		<aside className="updates card" aria-label="App updates">
			<p className="eyebrow">Updates</p>
			<ul>
				{UPDATES.map((u) => (
					<li key={u.title}>
						<span className="update-date">{u.date}</span>
						<span className="update-title">{u.title}</span>
						<span className="update-note">{u.note}</span>
					</li>
				))}
			</ul>
		</aside>
	);
}
