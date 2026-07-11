import { useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { CrosshairIcon } from "./icons";

interface LandingProps {
	onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
	const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

	function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
		if (e.key === "Enter" || e.key === " ") {
			onStart();
		}
	}

	function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
		setTip({ x: e.clientX, y: e.clientY });
	}

	return (
		<div
			className="landing"
			role="button"
			tabIndex={0}
			aria-label="Click anywhere to start"
			onClick={onStart}
			onKeyDown={handleKeyDown}
			onMouseMove={handleMouseMove}
		>
			<span className="landing-crosshair">
				<CrosshairIcon size={320} />
			</span>
			<p className="landing-text">Enter your mouse DPI. We decide everything else.</p>
			<span
				className={tip ? "landing-tip" : "landing-tip landing-tip-idle"}
				style={tip ? { left: tip.x, top: tip.y } : undefined}
			>
				click anywhere to start
			</span>
		</div>
	);
}
