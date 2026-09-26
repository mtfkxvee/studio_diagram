import { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
	Background,
	Controls,
	MiniMap,
	ReactFlowProvider,
	addEdge,
	useEdgesState,
	useNodesState,
	useReactFlow,
	type Connection,
	type Edge,
	type EdgeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import ShapeNode, { type Direction } from "./nodes/ShapeNode";
import LinkedNode from "./nodes/LinkedNode";
import LinkPicker from "./LinkPicker";
import ShapePalette from "./ShapePalette";
import QuickCreateMenu, { type QuickPreset } from "./QuickCreateMenu";
import type { ShapePreset } from "./shapes";
import { getDiagram, saveCanvas } from "./api";

const nodeTypes = { shape: ShapeNode, linked: LinkedNode };

let nodeIdCounter = 1;
function nextNodeId() {
	return `node-${Date.now()}-${nodeIdCounter++}`;
}

type EditorProps = {
	initialOpen?: string | null;
	onReady?: (open: (name: string) => void) => void;
};

function Editor({ initialOpen, onReady }: EditorProps) {
	const [current, setCurrent] = useState<string | null>(null);
	const [dirty, setDirty] = useState(false);
	const [showPicker, setShowPicker] = useState(false);
	const [quickCreate, setQuickCreate] = useState<{ sourceId: string; direction: Direction; x: number; y: number } | null>(null);
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const { screenToFlowPosition } = useReactFlow();

	function handleLabelChange(id: string, label: string) {
		setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n)));
		setDirty(true);
	}

	function handleStyleChange(id: string, patch: Partial<{ shape: string; color: string }>) {
		setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));
		setDirty(true);
	}

	function handleDeleteNode(id: string) {
		setNodes((nds) => nds.filter((n) => n.id !== id));
		setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
		setDirty(true);
	}

	function handleQuickCreate(sourceId: string, direction: Direction, clientX: number, clientY: number) {
		setQuickCreate({ sourceId, direction, x: clientX, y: clientY });
	}

	const OPPOSITE: Record<Direction, Direction> = { top: "bottom", bottom: "top", left: "right", right: "left" };
	const QUICK_GAP = 60;

	function handleQuickPick(preset: QuickPreset) {
		if (!quickCreate) return;
		const { sourceId, direction } = quickCreate;
		const source = nodes.find((n) => n.id === sourceId);
		setQuickCreate(null);
		if (!source) return;

		const sw = source.width ?? 120;
		const sh = source.height ?? 60;
		let x = source.position.x;
		let y = source.position.y;
		if (direction === "right") {
			x = source.position.x + sw + QUICK_GAP;
			y = source.position.y + sh / 2 - preset.height / 2;
		} else if (direction === "left") {
			x = source.position.x - preset.width - QUICK_GAP;
			y = source.position.y + sh / 2 - preset.height / 2;
		} else if (direction === "bottom") {
			y = source.position.y + sh + QUICK_GAP;
			x = source.position.x + sw / 2 - preset.width / 2;
		} else {
			y = source.position.y - preset.height - QUICK_GAP;
			x = source.position.x + sw / 2 - preset.width / 2;
		}

		const newId = nextNodeId();
		setNodes((nds) => [
			...nds,
			{
				id: newId,
				type: "shape",
				position: { x, y },
				width: preset.width,
				height: preset.height,
				data: {
					label: preset.label,
					shape: preset.kind,
					color: preset.color,
					onLabelChange: handleLabelChange,
					onStyleChange: handleStyleChange,
					onDelete: handleDeleteNode,
					onQuickCreate: handleQuickCreate,
				},
			},
		]);
		setEdges((eds) => [
			...eds,
			{
				id: `edge-${sourceId}-${newId}`,
				source: sourceId,
				sourceHandle: `${direction}-source`,
				target: newId,
				targetHandle: `${OPPOSITE[direction]}-target`,
				label: "",
			},
		]);
		setDirty(true);
	}

	function decorate(n: any) {
		// Diagrams saved before ShapeNode existed used type "text" with no
		// shape/color — treat those as plain rectangles so old diagrams still
		// open instead of rendering blank.
		if (n.type === "text" || n.type === "shape") {
			return {
				...n,
				type: "shape",
				data: {
					shape: "rectangle",
					color: "#ffffff",
					...n.data,
					onLabelChange: handleLabelChange,
					onStyleChange: handleStyleChange,
					onDelete: handleDeleteNode,
					onQuickCreate: handleQuickCreate,
				},
			};
		}
		return { ...n, data: { ...n.data, onLabelChange: handleLabelChange } };
	}

	async function openDiagram(name: string) {
		const { canvas_json } = await getDiagram(name);
		setNodes(canvas_json.nodes.map(decorate));
		setEdges(canvas_json.edges as Edge[]);
		setCurrent(name);
		setDirty(false);
	}

	useEffect(() => {
		onReady?.(openDiagram);
		if (initialOpen) openDiagram(initialOpen);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function goToNewDiagramForm() {
		// A JS prompt() for the title felt cramped, and there was nowhere to
		// pick Diagram Type / write a description. The standard "New Diagram"
		// desk form has room for all of that — creating a diagram is now just
		// creating any other ERPNext document. The form's own "Buka di
		// Diagram Studio" button (diagram.js) is the way back into the canvas.
		(window as any).frappe?.new_doc("Diagram");
	}

	function goToDiagramList() {
		(window as any).frappe?.set_route("List", "Diagram");
	}

	function addShapeNodeAt(preset: ShapePreset, position: { x: number; y: number }) {
		const id = nextNodeId();
		setNodes((nds) => [
			...nds,
			{
				id,
				type: "shape",
				position,
				width: preset.width,
				height: preset.height,
				data: {
					label: preset.label,
					shape: preset.kind,
					color: preset.color,
					onLabelChange: handleLabelChange,
					onStyleChange: handleStyleChange,
					onDelete: handleDeleteNode,
					onQuickCreate: handleQuickCreate,
				},
			},
		]);
		setDirty(true);
	}

	const onDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	}, []);

	const onDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			const raw = e.dataTransfer.getData("application/x-diagram-studio-shape");
			if (!raw) return;
			const preset: ShapePreset = JSON.parse(raw);
			const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
			addShapeNodeAt(preset, {
				x: position.x - preset.width / 2,
				y: position.y - preset.height / 2,
			});
		},
		[screenToFlowPosition]
	);

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
			setEdges((eds) => addEdge({ ...params, label: "" }, eds));
			setDirty(true);
		},
		[setEdges]
	);

	const onEdgeDoubleClick: EdgeMouseHandler = useCallback(
		(_, edge) => {
			const label = prompt("Label garis:", (edge.label as string) || "");
			if (label === null) return;
			setEdges((eds) => eds.map((e) => (e.id === edge.id ? { ...e, label } : e)));
			setDirty(true);
		},
		[setEdges]
	);

	async function handleSave() {
		if (!current) return;
		const cleanNodes = nodes.map(({ id, type, position, width, height, data }) => ({
			id,
			type,
			position,
			width,
			height,
			data: {
				label: data.label,
				shape: data.shape,
				color: data.color,
				reference_doctype: data.reference_doctype,
				reference_name: data.reference_name,
			},
		}));
		const cleanEdges = edges.map(({ id, source, target, sourceHandle, targetHandle, label }) => ({
			id,
			source,
			target,
			sourceHandle,
			targetHandle,
			label,
		}));
		await saveCanvas(current, { nodes: cleanNodes as any, edges: cleanEdges as any });
		setDirty(false);
	}

	return (
		<div className="ds-layout">
			{current && <ShapePalette />}
			<main className="ds-canvas">
				{current ? (
					<>
						<div className="ds-toolbar">
							<button onClick={() => setShowPicker(true)}>+ Node terhubung ke ERP</button>
							<button onClick={handleSave} disabled={!dirty}>
								{dirty ? "Simpan perubahan" : "Tersimpan"}
							</button>
						</div>
						<div className="ds-flow-wrapper" ref={wrapperRef} onDragOver={onDragOver} onDrop={onDrop}>
							<ReactFlow
								nodes={nodes}
								edges={edges}
								onNodesChange={onNodesChange}
								onEdgesChange={(changes) => {
									onEdgesChange(changes);
									setDirty(true);
								}}
								onConnect={onConnect}
								onEdgeDoubleClick={onEdgeDoubleClick}
								nodeTypes={nodeTypes}
								deleteKeyCode={["Backspace", "Delete"]}
								fitView
							>
								<Background />
								<Controls />
								<MiniMap />
							</ReactFlow>
						</div>
						{showPicker && (
							<LinkPicker onPick={addLinkedNode} onClose={() => setShowPicker(false)} />
						)}
						{quickCreate && (
							<QuickCreateMenu
								x={quickCreate.x}
								y={quickCreate.y}
								onPick={handleQuickPick}
								onClose={() => setQuickCreate(null)}
							/>
						)}
					</>
				) : (
					<div className="ds-empty">
						<p>Belum ada diagram yang dibuka.</p>
						<div className="ds-empty__actions">
							<button onClick={goToNewDiagramForm}>+ Diagram baru</button>
							<button onClick={goToDiagramList}>Lihat semua diagram</button>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}

export default function App(props: EditorProps) {
	return (
		<ReactFlowProvider>
			<Editor {...props} />
		</ReactFlowProvider>
	);
}
