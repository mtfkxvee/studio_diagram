import { Handle, NodeResizer, NodeToolbar, Position, type NodeProps } from "reactflow";
import { useState } from "react";
import type { ShapeKind } from "../shapes";

export type ShapeNodeData = {
	label: string;
	shape: ShapeKind;
	color: string;
	onLabelChange: (id: string, label: string) => void;
	onStyleChange: (id: string, patch: Partial<Pick<ShapeNodeData, "shape" | "color">>) => void;
	onDelete: (id: string) => void;
};

const COLORS = ["#ffffff", "#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff"];

// Freeform node for brainstorming — no ERPNext record attached, just a
// shape + color + text. Contrast with LinkedNode, which is bound to a
// real record and pulls live data.
export default function ShapeNode({ id, data, selected }: NodeProps<ShapeNodeData>) {
	const [editing, setEditing] = useState(false);
	const [value, setValue] = useState(data.label);

	function commit() {
		setEditing(false);
		data.onLabelChange(id, value);
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
		<>
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

			<div
				className={`ds-shape ds-shape--${data.shape}`}
				style={{ background: data.shape === "text" ? "transparent" : data.color, width: "100%", height: "100%" }}
				onDoubleClick={() => setEditing(true)}
			>
				<Handle type="target" position={Position.Top} />
				<Handle type="source" position={Position.Bottom} />
				<Handle type="target" position={Position.Left} id="l" />
				<Handle type="source" position={Position.Right} id="r" />

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
		</>
	);
}
