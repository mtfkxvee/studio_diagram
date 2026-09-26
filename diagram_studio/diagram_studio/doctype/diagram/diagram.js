frappe.ui.form.on("Diagram", {
	refresh(frm) {
		if (!frm.is_new()) {
			frm.add_custom_button(__("Buka di Diagram Studio"), () => {
				frappe.set_route("diagram-studio", frm.doc.name);
			});
		}
	},
});
