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
		window.DiagramStudio.mount(mount_point.get(0), {
			csrf_token: frappe.csrf_token,
		});
	});

	page.set_secondary_action(__("Refresh"), () => {
		if (mount_point.get(0)._diagramStudioReload) {
			mount_point.get(0)._diagramStudioReload();
		}
	});
};

frappe.pages["diagram-studio"].on_page_unload = function (wrapper) {
	const root = wrapper.querySelector(".diagram-studio-root");
	if (root && root._diagramStudioUnmount) {
		root._diagramStudioUnmount();
	}
};
