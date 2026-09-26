import { createRoot, type Root } from "react-dom/client";
import App from "./App";
import { configure } from "./api";
import "./style.css";

let root: Root | null = null;

// Entry point loaded by diagram_studio.js (the Frappe Page script) via
// frappe.require(). Exposed on window because the desk page loads this
// bundle as a plain <script>, not an ES module.
function mount(el: HTMLElement, opts: { csrf_token: string }) {
	configure(opts.csrf_token);
	root = createRoot(el);
	root.render(<App />);

	(el as any)._diagramStudioUnmount = () => {
		root?.unmount();
		root = null;
	};
}

(window as any).DiagramStudio = { mount };
