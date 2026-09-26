import { Handle, NodeResizer, NodeToolbar, Position, type NodeProps } from "reactflow";
import { useState } from "react";

export type ShapeKind = "rectangle" | "diamond" | "ellipse" | "note";

export type ShapeNodeData = {
	label: string;
	shape: ShapeKind;
	color: string;
	onLabelChange: (id: string, label: string) => void;
	onStyleChange: (id: string, patch: Partial<Pick<ShapeNodeData, "shape" | "color">>) => void;
	onDelete: (id: string) => void;
};

const COLORS = ["#ffffff", "#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff"];
const SHAPES: { kind: ShapeKind; label: string }[] = [
	{ kind: "rectangle", label: "▭" },
	{ kind: "diamond", label: "◇" },
	{ kind: "ellipse", label: "○" },
	{ kind: "note", label: "🗒" },
];

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

	return (
		<>
			<NodeResizer isVisible={selected} minWidth={80} minHeight={40} />
			<NodeToolbar isVisible={selected} position={Position.Top}>
				{SHAPES.map((s) => (
					<button
						key={s.kind}
						className={`ds-toolbar__btn ${data.shape === s.kind ? "active" : ""}`}
						title={s.kind}
						onClick={() => data.onStyleChange(id, { shape: s.kind })}
					>
						{s.label}
					</button>
				))}
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
				style={{ background: data.color, width: "100%", height: "100%" }}
				onDoubleClick={() => setEditing(true)}
			>
				<Handle type="target" position={Position.Top} />
				<Handle type="source" position={Position.Bottom} />
				<Handle type="target" position={Position.Left} id="l" />
				<Handle type="source" position={Position.Right} id="r" />
				<div className="ds-shape__content">
					{editing ? (
						<input
							autoFocus
							value={value}
							onChange={(e) => setValue(e.target.value)}
							onBlur={commit}
							onKeyDown={(e) => e.key === "Enter" && commit()}
						/>
					) : (
						<span>{data.label || "(kosong)"}</span>
					)}
				</div>
			</div>
		</>
	);
}
