// Thin wrapper around ERPNext's own REST API. No separate backend —
// everything goes through the Frappe session cookie + CSRF token that the
// desk page already has, so permissions/roles are enforced by ERPNext itself.

import type { ShapeKind } from "./shapes";

export type DiagramNode = {
	id: string;
	type: "shape" | "linked";
	position: { x: number; y: number };
	width?: number;
	height?: number;
	data: {
		label: string;
		shape?: ShapeKind;
		color?: string;
		reference_doctype?: string;
		reference_name?: string;
		image?: string;
	};
};

export type DiagramEdge = {
	id: string;
	source: string;
	target: string;
	sourceHandle?: string | null;
	targetHandle?: string | null;
	label?: string;
};

export type CanvasJson = {
	nodes: DiagramNode[];
	edges: DiagramEdge[];
};

export type DiagramSummary = {
	name: string;
	title: string;
	diagram_type: string;
	modified: string;
};

let csrfToken = "";

export function configure(token: string) {
	csrfToken = token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
	const res = await fetch(path, {
		credentials: "same-origin",
		...options,
		headers: {
			"Content-Type": "application/json",
			"X-Frappe-CSRF-Token": csrfToken,
			...(options.headers || {}),
		},
	});
	if (!res.ok) {
		const body = await res.text();
		throw new Error(`${res.status} ${res.statusText}: ${body}`);
	}
	return res.json();
}

export async function listDiagrams(): Promise<DiagramSummary[]> {
	const data = await request<{ data: DiagramSummary[] }>(
		"/api/resource/Diagram?fields=" +
			encodeURIComponent(JSON.stringify(["name", "title", "diagram_type", "modified"])) +
			"&order_by=modified desc&limit_page_length=0"
	);
	return data.data;
}

export async function getDiagram(name: string): Promise<{ title: string; diagram_type: string; canvas_json: CanvasJson }> {
	const data = await request<{ data: any }>(`/api/resource/Diagram/${encodeURIComponent(name)}`);
	let canvas_json: CanvasJson = { nodes: [], edges: [] };
	try {
		canvas_json = data.data.canvas_json ? JSON.parse(data.data.canvas_json) : canvas_json;
	} catch {
		// corrupt/empty canvas_json — start from a blank canvas rather than crash
	}
	return { title: data.data.title, diagram_type: data.data.diagram_type, canvas_json };
}

export async function saveCanvas(name: string, canvas: CanvasJson): Promise<void> {
	await request(`/api/resource/Diagram/${encodeURIComponent(name)}`, {
		method: "PUT",
		body: JSON.stringify({ canvas_json: JSON.stringify(canvas) }),
	});
}

export async function deleteDiagram(name: string): Promise<void> {
	await request(`/api/resource/Diagram/${encodeURIComponent(name)}`, { method: "DELETE" });
}

// Live data for a node bound to a real record — this is what makes a node
// "hidup" instead of a frozen snapshot of whatever it looked like when added.
export async function getNodeLiveData(reference_doctype: string, reference_name: string) {
	const data = await request<{ message: any }>(
		"/api/method/diagram_studio.diagram_studio.doctype.diagram.diagram.get_node_live_data",
		{
			method: "POST",
			body: JSON.stringify({ reference_doctype, reference_name }),
		}
	);
	return data.message;
}

// Search-as-you-type against any doctype, same endpoint Frappe's own Link
// fields use — so the picker respects the same permissions.
export async function searchLink(doctype: string, txt: string) {
	const data = await request<{ message: Array<{ value: string; label?: string }> }>(
		"/api/method/frappe.desk.search.search_link",
		{
			method: "POST",
			body: JSON.stringify({ doctype, txt, page_length: 20 }),
		}
	);
	return data.message || [];
}
