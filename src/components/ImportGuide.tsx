export default function ImportGuide() {
	return (
		<section className="guide">
			<h2>How to apply</h2>
			<ol>
				<li>Close Raw Accel.</li>
				<li>
					Drop <code>settings.json</code> into the Raw Accel folder, replacing the old file.
				</li>
				<li>
					Open Raw Accel and press <strong>Apply</strong>.
				</li>
			</ol>
			<p className="note">
				Settings reset on reboot. Add <code>writer.exe settings.json</code> to Windows startup to
				keep them.
			</p>
		</section>
	);
}
