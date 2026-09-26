frappe.pages["diagram-studio"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: "Diagram Studio",
		single_column: true,
	});

	const mount_point = $('<div class="diagram-studio-root" style="height: calc(100vh - 200px);"></div>')
		.appendTo(page.body);

	frappe.require("/assets/diagram_studio/js/diagram_studio.js", () => {
		// Exposed by frontend/src/main.tsx via the Vite build (see frontend/README).
		// The second route segment (/app/diagram-studio/<name>) is how the
		// "Buka di Diagram Studio" button on the Diagram form links back here.
		window.DiagramStudio.mount(mount_point.get(0), {
			csrf_token: frappe.csrf_token,
			open_diagram: frappe.get_route()[1] || null,
		});
	});

	page.set_secondary_action(__("Refresh"), () => {
		if (mount_point.get(0)._diagramStudioReload) {
			mount_point.get(0)._diagramStudioReload();
		}
	});
};

// The desk router reuses the same page instance across route changes, so
// navigating from /app/diagram-studio to /app/diagram-studio/<name> (or back)
// does not re-run on_page_load — it fires this instead.
frappe.pages["diagram-studio"].on_page_show = function () {
	const name = frappe.get_route()[1];
	if (name && window.DiagramStudio && window.DiagramStudio.open) {
		window.DiagramStudio.open(name);
	}
};

frappe.pages["diagram-studio"].on_page_unload = function (wrapper) {
	const root = wrapper.querySelector(".diagram-studio-root");
	if (root && root._diagramStudioUnmount) {
		root._diagramStudioUnmount();
	}
};
