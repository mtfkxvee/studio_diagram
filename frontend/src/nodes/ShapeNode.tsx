import { Handle, NodeResizer, NodeToolbar, Position, type NodeProps } from "reactflow";
import { useRef, useState } from "react";
import type { ShapeKind } from "../shapes";

export type Direction = "top" | "right" | "bottom" | "left";

export type ShapeNodeData = {
	label: string;
	shape: ShapeKind;
	color: string;
	onLabelChange: (id: string, label: string) => void;
	onStyleChange: (id: string, patch: Partial<Pick<ShapeNodeData, "shape" | "color">>) => void;
	onDelete: (id: string) => void;
	onQuickCreate: (id: string, direction: Direction, clientX: number, clientY: number) => void;
};

const COLORS = ["#ffffff", "#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff"];

const ARROWS: { dir: Direction; icon: string; position: Position }[] = [
	{ dir: "top", icon: "▲", position: Position.Top },
	{ dir: "right", icon: "▶", position: Position.Right },
	{ dir: "bottom", icon: "▼", position: Position.Bottom },
	{ dir: "left", icon: "◀", position: Position.Left },
];

// Freeform node for brainstorming — no ERPNext record attached, just a
// shape + color + text. Contrast with LinkedNode, which is bound to a
// real record and pulls live data.
export default function ShapeNode({ id, data, selected }: NodeProps<ShapeNodeData>) {
	const [editing, setEditing] = useState(false);
	const [hovered, setHovered] = useState(false);
	const [value, setValue] = useState(data.label);
	const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	function commit() {
		setEditing(false);
		data.onLabelChange(id, value);
	}

	// The quick-create arrows sit just outside the shape's own box, so there's
	// a small gap between "hovering the shape" and "hovering an arrow". A
	// short grace period before hiding means crossing that gap doesn't make
	// the arrows disappear right before the cursor reaches them.
	function handleMouseEnter() {
		if (hideTimeout.current) clearTimeout(hideTimeout.current);
		setHovered(true);
	}

	function handleMouseLeave() {
		hideTimeout.current = setTimeout(() => setHovered(false), 300);
	}

	const label = editing ? (
		<input
			autoFocus
			value={value}
			onChange={(e) => setValue(e.target.value)}
			onBlur={commit}
			onKeyDown={(e) => e.key === "Enter" && commit()}
		/>
	) : (
		<span>{data.label || "(kosong)"}</span>
	);

	return (
		<div className="ds-shape-wrapper" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
			<NodeResizer isVisible={selected} minWidth={40} minHeight={30} />
			<NodeToolbar isVisible={selected} position={Position.Top}>
				{COLORS.map((c) => (
					<button
						key={c}
						className="ds-toolbar__swatch"
						style={{ background: c }}
						onClick={() => data.onStyleChange(id, { color: c })}
					/>
				))}
				<button className="ds-toolbar__btn" title="Hapus" onClick={() => data.onDelete(id)}>
					🗑
				</button>
			</NodeToolbar>

			{hovered &&
				!editing &&
				ARROWS.map((a) => (
					<button
						key={a.dir}
						className={`ds-quick-arrow ds-quick-arrow--${a.dir} nodrag nopan`}
						title={`Tambah shape ke arah ${a.dir}`}
						onClick={(e) => {
							e.stopPropagation();
							data.onQuickCreate(id, a.dir, e.clientX, e.clientY);
						}}
					>
						{a.icon}
					</button>
				))}

			<div
				className={`ds-shape ds-shape--${data.shape}`}
				style={{ background: data.shape === "text" ? "transparent" : data.color, width: "100%", height: "100%" }}
				onDoubleClick={() => setEditing(true)}
			>
				<Handle type="target" position={Position.Top} id="top-target" />
				<Handle type="source" position={Position.Top} id="top-source" />
				<Handle type="source" position={Position.Bottom} id="bottom-source" />
				<Handle type="target" position={Position.Bottom} id="bottom-target" />
				<Handle type="target" position={Position.Left} id="left-target" />
				<Handle type="source" position={Position.Left} id="left-source" />
				<Handle type="source" position={Position.Right} id="right-source" />
				<Handle type="target" position={Position.Right} id="right-target" />

				{data.shape === "actor" ? (
					<div className="ds-shape__content ds-shape__content--actor">
						<svg viewBox="0 0 40 60" className="ds-actor-svg">
							<circle cx="20" cy="10" r="8" fill="none" stroke="#374151" strokeWidth="2" />
							<line x1="20" y1="18" x2="20" y2="40" stroke="#374151" strokeWidth="2" />
							<line x1="4" y1="26" x2="36" y2="26" stroke="#374151" strokeWidth="2" />
							<line x1="20" y1="40" x2="6" y2="58" stroke="#374151" strokeWidth="2" />
							<line x1="20" y1="40" x2="34" y2="58" stroke="#374151" strokeWidth="2" />
						</svg>
						{label}
					</div>
				) : data.shape === "uml-class" ? (
					<div className="ds-shape__content ds-shape__content--uml-class">
						<div className="ds-uml-class__header">{label}</div>
						<div className="ds-uml-class__section" />
						<div className="ds-uml-class__section" />
					</div>
				) : (
					<div className="ds-shape__content">{label}</div>
				)}
			</div>
		</div>
	);
}
