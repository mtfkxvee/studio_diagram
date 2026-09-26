import { createRoot, type Root } from "react-dom/client";
import App from "./App";
import { configure } from "./api";
import "./style.css";

let root: Root | null = null;
let openHandler: ((name: string) => void) | null = null;

// Entry point loaded by diagram_studio.js (the Frappe Page script) via
// frappe.require(). Exposed on window because the desk page loads this
// bundle as a plain <script>, not an ES module.
function mount(el: HTMLElement, opts: { csrf_token: string; open_diagram?: string | null }) {
	configure(opts.csrf_token);
	root = createRoot(el);
	root.render(
		<App
			initialOpen={opts.open_diagram || null}
			onReady={(fn) => {
				openHandler = fn;
			}}
		/>
	);

	(el as any)._diagramStudioUnmount = () => {
		root?.unmount();
		root = null;
		openHandler = null;
	};
}

// Called by diagram_studio.js's on_page_show when the desk router navigates
// to /app/diagram-studio/<name> on an already-mounted page (the app instance
// is reused across route changes, so this is how a second visit — e.g. via
// the Diagram form's "Buka di Diagram Studio" button — opens a new diagram
// without a full remount).
function open(name: string) {
	openHandler?.(name);
}

(window as any).DiagramStudio = { mount, open };
