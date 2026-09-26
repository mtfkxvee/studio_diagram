import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
	Background,
	Controls,
	MiniMap,
	addEdge,
	useEdgesState,
	useNodesState,
	type Connection,
	type Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import TextNode from "./nodes/TextNode";
import LinkedNode from "./nodes/LinkedNode";
import LinkPicker from "./LinkPicker";
import {
	createDiagram,
	deleteDiagram,
	getDiagram,
	listDiagrams,
	saveCanvas,
	type DiagramSummary,
} from "./api";

const nodeTypes = { text: TextNode, linked: LinkedNode };

let nodeIdCounter = 1;
function nextNodeId() {
	return `node-${Date.now()}-${nodeIdCounter++}`;
}

export default function App() {
	const [diagrams, setDiagrams] = useState<DiagramSummary[]>([]);
	const [current, setCurrent] = useState<string | null>(null);
	const [dirty, setDirty] = useState(false);
	const [showPicker, setShowPicker] = useState(false);
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);

	const refreshList = useCallback(() => {
		listDiagrams().then(setDiagrams).catch(console.error);
	}, []);

	useEffect(() => {
		refreshList();
	}, [refreshList]);

	function handleLabelChange(id: string, label: string) {
		setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n)));
		setDirty(true);
	}

	async function openDiagram(name: string) {
		const { canvas_json } = await getDiagram(name);
		setNodes(
			canvas_json.nodes.map((n) => ({
				...n,
				data: { ...n.data, onLabelChange: handleLabelChange },
			}))
		);
		setEdges(canvas_json.edges as Edge[]);
		setCurrent(name);
		setDirty(false);
	}

	async function newDiagram() {
		const title = prompt("Nama diagram baru:");
		if (!title) return;
		const name = await createDiagram(title, "Flowchart");
		refreshList();
		setNodes([]);
		setEdges([]);
		setCurrent(name);
		setDirty(false);
	}

	async function handleDelete(name: string) {
		if (!confirm(`Hapus diagram "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
		await deleteDiagram(name);
		if (current === name) {
			setCurrent(null);
			setNodes([]);
			setEdges([]);
		}
		refreshList();
	}

	function addTextNode() {
		const id = nextNodeId();
		setNodes((nds) => [
			...nds,
			{
				id,
				type: "text",
				position: { x: 100 + nds.length * 30, y: 100 + nds.length * 20 },
				data: { label: "Teks baru", onLabelChange: handleLabelChange },
			},
		]);
		setDirty(true);
	}

	function addLinkedNode(doctype: string, name: string, label: string) {
		const id = nextNodeId();
		setNodes((nds) => [
			...nds,
			{
				id,
				type: "linked",
				position: { x: 100 + nds.length * 30, y: 100 + nds.length * 20 },
				data: { label, reference_doctype: doctype, reference_name: name },
			},
		]);
		setShowPicker(false);
		setDirty(true);
	}

	const onConnect = useCallback(
		(params: Connection) => {
			setEdges((eds) => addEdge(params, eds));
			setDirty(true);
		},
		[setEdges]
	);

	async function handleSave() {
		if (!current) return;
		const cleanNodes = nodes.map(({ id, type, position, data }) => ({
			id,
			type,
			position,
			data: {
				label: data.label,
				reference_doctype: data.reference_doctype,
				reference_name: data.reference_name,
			},
		}));
		await saveCanvas(current, { nodes: cleanNodes as any, edges: edges as any });
		setDirty(false);
		refreshList();
	}

	return (
		<div className="ds-layout">
			<aside className="ds-sidebar">
				<button onClick={newDiagram}>+ Diagram baru</button>
				<ul>
					{diagrams.map((d) => (
						<li key={d.name} className={d.name === current ? "active" : ""}>
							<span onClick={() => openDiagram(d.name)}>{d.title}</span>
							<button className="ds-sidebar__delete" onClick={() => handleDelete(d.name)}>
								x
							</button>
						</li>
					))}
				</ul>
			</aside>
			<main className="ds-canvas">
				{current ? (
					<>
						<div className="ds-toolbar">
							<button onClick={addTextNode}>+ Teks</button>
							<button onClick={() => setShowPicker(true)}>+ Node terhubung</button>
							<button onClick={handleSave} disabled={!dirty}>
								{dirty ? "Simpan perubahan" : "Tersimpan"}
							</button>
						</div>
						<ReactFlow
							nodes={nodes}
							edges={edges}
							onNodesChange={onNodesChange}
							onEdgesChange={(changes) => {
								onEdgesChange(changes);
								setDirty(true);
							}}
							onConnect={onConnect}
							nodeTypes={nodeTypes}
							fitView
						>
							<Background />
							<Controls />
							<MiniMap />
						</ReactFlow>
						{showPicker && (
							<LinkPicker onPick={addLinkedNode} onClose={() => setShowPicker(false)} />
						)}
					</>
				) : (
					<div className="ds-empty">Pilih atau buat diagram di sebelah kiri.</div>
				)}
			</main>
		</div>
	);
}
