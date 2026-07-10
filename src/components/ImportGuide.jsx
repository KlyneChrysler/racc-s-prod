export default function ImportGuide() {
	return (
		<section className="guide">
			<h2>How to apply</h2>
			<ol>
				<li>Close the Raw Accel window if it is open.</li>
				<li>
					Move the downloaded <code>settings.json</code> into your Raw Accel install folder,
					replacing the existing file.
				</li>
				<li>
					Open Raw Accel and press <strong>Apply</strong> — or run{" "}
					<code>writer.exe settings.json</code> from that folder.
				</li>
			</ol>
			<p className="note">
				Raw Accel resets after a reboot unless the GUI or <code>writer.exe</code> runs at startup.
			</p>
		</section>
	);
}
