import { Handle, Position, type NodeProps } from "reactflow";
import { useEffect, useState } from "react";
import { getNodeLiveData } from "../api";

type LinkedNodeData = {
	label: string;
	reference_doctype: string;
	reference_name: string;
	image?: string;
};

// Unlike TextNode, this fetches the referenced ERPNext record on mount so
// the diagram always shows the current title/image instead of whatever was
// true when the node was placed on the canvas.
export default function LinkedNode({ data }: NodeProps<LinkedNodeData>) {
	const [live, setLive] = useState<{ title: string; image?: string } | null>(null);
	const [error, setError] = useState(false);

	useEffect(() => {
		let cancelled = false;
		getNodeLiveData(data.reference_doctype, data.reference_name)
			.then((res) => !cancelled && setLive(res))
			.catch(() => !cancelled && setError(true));
		return () => {
			cancelled = true;
		};
	}, [data.reference_doctype, data.reference_name]);

	const desk_url = `/app/${frappe_route(data.reference_doctype)}/${encodeURIComponent(data.reference_name)}`;

	return (
		<div className="ds-node ds-node--linked">
			<Handle type="target" position={Position.Top} />
			<div className="ds-node__badge">{data.reference_doctype}</div>
			{live?.image && <img className="ds-node__image" src={live.image} alt="" />}
			<a href={desk_url} target="_blank" rel="noreferrer" className="ds-node__title">
				{error ? `${data.label} (gagal dimuat)` : live?.title || data.label}
			</a>
			<Handle type="source" position={Position.Bottom} />
		</div>
	);
}

function frappe_route(doctype: string) {
	return doctype.toLowerCase().replace(/ /g, "-");
}
