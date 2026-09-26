import { Handle, Position, type NodeProps } from "reactflow";
import { useState } from "react";

export default function TextNode({ id, data }: NodeProps<{ label: string; onLabelChange: (id: string, label: string) => void }>) {
	const [editing, setEditing] = useState(false);
	const [value, setValue] = useState(data.label);

	function commit() {
		setEditing(false);
		data.onLabelChange(id, value);
	}

	return (
		<div
			className="ds-node ds-node--text"
			onDoubleClick={() => setEditing(true)}
			title="Double-click untuk edit teks"
		>
			<Handle type="target" position={Position.Top} />
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
			<Handle type="source" position={Position.Bottom} />
		</div>
	);
}
