export type ShapeKind =
	| "rectangle"
	| "rounded"
	| "text"
	| "ellipse"
	| "diamond"
	| "parallelogram"
	| "triangle"
	| "hexagon"
	| "cylinder"
	| "cloud"
	| "document"
	| "note"
	| "callout"
	| "actor"
	| "terminator"
	| "predefined"
	| "manual-input"
	| "arrow-right"
	| "arrow-left"
	| "arrow-double"
	| "uml-class";

export type ShapePreset = {
	kind: ShapeKind;
	label: string;
	color: string;
	width: number;
	height: number;
};

export type ShapeCategory = {
	name: string;
	presets: ShapePreset[];
};

// One entry here = one draggable item in the sidebar. Several presets
// deliberately reuse the same `kind` (Process/Square/Circle etc.) with a
// different label and default size — the visual shape is the same CSS
// class, only the palette label and starting dimensions differ.
export const SHAPE_CATEGORIES: ShapeCategory[] = [
	{
		name: "General",
		presets: [
			{ kind: "rectangle", label: "Rectangle", color: "#ffffff", width: 120, height: 60 },
			{ kind: "rounded", label: "Rounded Rectangle", color: "#ffffff", width: 120, height: 60 },
			{ kind: "text", label: "Text", color: "#ffffff", width: 100, height: 30 },
			{ kind: "ellipse", label: "Ellipse", color: "#ffffff", width: 120, height: 80 },
			{ kind: "rectangle", label: "Square", color: "#ffffff", width: 70, height: 70 },
			{ kind: "ellipse", label: "Circle", color: "#ffffff", width: 70, height: 70 },
			{ kind: "diamond", label: "Diamond", color: "#ffffff", width: 100, height: 80 },
			{ kind: "parallelogram", label: "Parallelogram", color: "#ffffff", width: 120, height: 60 },
			{ kind: "triangle", label: "Triangle", color: "#ffffff", width: 90, height: 80 },
			{ kind: "hexagon", label: "Hexagon", color: "#ffffff", width: 110, height: 70 },
			{ kind: "cylinder", label: "Cylinder", color: "#ffffff", width: 90, height: 90 },
			{ kind: "cloud", label: "Cloud", color: "#ffffff", width: 120, height: 80 },
			{ kind: "document", label: "Document", color: "#ffffff", width: 120, height: 80 },
			{ kind: "note", label: "Sticky Note", color: "#fef08a", width: 110, height: 90 },
			{ kind: "callout", label: "Callout", color: "#ffffff", width: 120, height: 70 },
			{ kind: "actor", label: "Actor", color: "#ffffff", width: 60, height: 90 },
		],
	},
	{
		name: "Flowchart",
		presets: [
			{ kind: "rectangle", label: "Process", color: "#ffffff", width: 120, height: 60 },
			{ kind: "diamond", label: "Decision", color: "#ffffff", width: 110, height: 80 },
			{ kind: "terminator", label: "Terminator", color: "#ffffff", width: 120, height: 55 },
			{ kind: "parallelogram", label: "Data", color: "#ffffff", width: 120, height: 60 },
			{ kind: "predefined", label: "Predefined Process", color: "#ffffff", width: 130, height: 60 },
			{ kind: "manual-input", label: "Manual Input", color: "#ffffff", width: 120, height: 60 },
			{ kind: "hexagon", label: "Preparation", color: "#ffffff", width: 120, height: 60 },
			{ kind: "document", label: "Document", color: "#ffffff", width: 120, height: 70 },
		],
	},
	{
		name: "Arrows",
		presets: [
			{ kind: "arrow-right", label: "Arrow Right", color: "#ffffff", width: 100, height: 50 },
			{ kind: "arrow-left", label: "Arrow Left", color: "#ffffff", width: 100, height: 50 },
			{ kind: "arrow-double", label: "Double Arrow", color: "#ffffff", width: 110, height: 50 },
		],
	},
	{
		name: "UML",
		presets: [
			{ kind: "actor", label: "Actor", color: "#ffffff", width: 60, height: 90 },
			{ kind: "uml-class", label: "Class", color: "#ffffff", width: 140, height: 100 },
		],
	},
];
