import { useReactFlow } from "reactflow";

export type Guides = { x?: number; y?: number };

// Renders the pink "smart guide" lines draw.io shows while dragging a shape
// that lines up with another one. Positions come in as flow coordinates
// (from the alignment check in App.tsx) and get converted to screen pixels
// here via the current pan/zoom, since this overlay sits above the canvas,
// not inside its transformed coordinate space.
export default function AlignmentGuides({ guides }: { guides: Guides }) {
	const { getViewport } = useReactFlow();
	if (guides.x === undefined && guides.y === undefined) return null;

	const { x: vx, y: vy, zoom } = getViewport();

	return (
		<div className="ds-guides">
			{guides.x !== undefined && (
				<div className="ds-guides__v" style={{ left: guides.x * zoom + vx }} />
			)}
			{guides.y !== undefined && (
				<div className="ds-guides__h" style={{ top: guides.y * zoom + vy }} />
			)}
		</div>
	);
}
