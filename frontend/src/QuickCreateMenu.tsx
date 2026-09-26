import type { ShapeKind } from "./shapes";

export type QuickPreset = { kind: ShapeKind; label: string; color: string; width: number; height: number };

// A curated subset of the full palette — this is a "quick pick" popover, not
// the whole sidebar, so it only lists the shapes people reach for most often
// when extending a flow from an existing node.
export const QUICK_PRESETS: QuickPreset[] = [
	{ kind: "rectangle", label: "Rectangle", color: "#ffffff", width: 120, height: 60 },
	{ kind: "rounded", label: "Rounded", color: "#ffffff", width: 120, height: 60 },
	{ kind: "diamond", label: "Decision", color: "#ffffff", width: 110, height: 80 },
	{ kind: "ellipse", label: "Ellipse", color: "#ffffff", width: 120, height: 80 },
	{ kind: "terminator", label: "Terminator", color: "#ffffff", width: 120, height: 55 },
	{ kind: "parallelogram", label: "Data", color: "#ffffff", width: 120, height: 60 },
	{ kind: "note", label: "Sticky Note", color: "#fef08a", width: 110, height: 90 },
	{ kind: "text", label: "Text", color: "#ffffff", width: 100, height: 30 },
];

type Props = {
	x: number;
	y: number;
	onPick: (preset: QuickPreset) => void;
	onClose: () => void;
};

export default function QuickCreateMenu({ x, y, onPick, onClose }: Props) {
	return (
		<div className="ds-quickmenu-backdrop" onClick={onClose}>
			<div
				className="ds-quickmenu"
				style={{ left: x, top: y }}
				onClick={(e) => e.stopPropagation()}
			>
				{QUICK_PRESETS.map((preset) => (
					<button
						key={preset.kind + preset.label}
						className="ds-quickmenu__item"
						title={preset.label}
						onClick={() => onPick(preset)}
					>
						<div className={`ds-shape ds-shape--${preset.kind} ds-palette__preview`} style={{ background: preset.color }} />
						<span>{preset.label}</span>
					</button>
				))}
			</div>
		</div>
	);
}
