import { useState } from "react";
import { SHAPE_CATEGORIES, type ShapePreset } from "./shapes";

// Drag source for the canvas' onDrop handler (see App.tsx). The payload is
// just the preset itself — App decides position from the drop coordinates.
function onDragStart(e: React.DragEvent, preset: ShapePreset) {
	e.dataTransfer.setData("application/x-diagram-studio-shape", JSON.stringify(preset));
	e.dataTransfer.effectAllowed = "move";
}

export default function ShapePalette() {
	const [search, setSearch] = useState("");
	const [open, setOpen] = useState<Record<string, boolean>>({ General: true, Flowchart: true });

	const filter = search.trim().toLowerCase();

	return (
		<aside className="ds-palette">
			<input
				className="ds-palette__search"
				placeholder="Cari shape..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>
			{SHAPE_CATEGORIES.map((cat) => {
				const presets = filter
					? cat.presets.filter((p) => p.label.toLowerCase().includes(filter))
					: cat.presets;
				if (presets.length === 0) return null;
				const isOpen = filter ? true : open[cat.name] ?? false;
				return (
					<div key={cat.name} className="ds-palette__category">
						<button
							className="ds-palette__category-title"
							onClick={() => setOpen((o) => ({ ...o, [cat.name]: !o[cat.name] }))}
						>
							{isOpen ? "▾" : "▸"} {cat.name}
						</button>
						{isOpen && (
							<div className="ds-palette__grid">
								{presets.map((preset, i) => (
									<div
										key={`${preset.kind}-${preset.label}-${i}`}
										className="ds-palette__item"
										draggable
										onDragStart={(e) => onDragStart(e, preset)}
										title={preset.label}
									>
										<div
											className={`ds-shape ds-shape--${preset.kind} ds-palette__preview`}
											style={{ background: preset.color }}
										/>
										<span>{preset.label}</span>
									</div>
								))}
							</div>
						)}
					</div>
				);
			})}
		</aside>
	);
}
