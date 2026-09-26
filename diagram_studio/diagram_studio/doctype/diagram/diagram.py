import json

import frappe
from frappe.model.document import Document


class Diagram(Document):
	pass


def sync_references(doc, method=None):
	"""Rebuild the `references` child table from canvas_json so linked
	records stay queryable (e.g. "which diagrams mention Item X") without
	having to parse the JSON blob on every read.
	"""
	nodes = _extract_nodes(doc.canvas_json)

	doc.set("references", [])
	seen = set()
	for node in nodes:
		data = node.get("data") or {}
		reference_doctype = data.get("reference_doctype")
		reference_name = data.get("reference_name")
		if not reference_doctype or not reference_name:
			continue

		key = (reference_doctype, reference_name)
		if key in seen:
			continue
		seen.add(key)

		doc.append("references", {
			"node_id": node.get("id"),
			"reference_doctype": reference_doctype,
			"reference_name": reference_name,
			"label": data.get("label"),
		})


def _extract_nodes(canvas_json):
	if not canvas_json:
		return []
	try:
		parsed = json.loads(canvas_json)
	except (TypeError, ValueError):
		return []
	return parsed.get("nodes", [])


@frappe.whitelist()
def get_node_live_data(reference_doctype, reference_name):
	"""Fetch a fresh display snapshot for a node bound to a real ERPNext
	record, so the diagram reflects the current state of that record
	instead of a stale copy from when the node was created.
	"""
	if not frappe.has_permission(reference_doctype, "read", reference_name):
		frappe.throw(frappe.gettext("Not permitted to read this record"), frappe.PermissionError)

	doc = frappe.get_doc(reference_doctype, reference_name)
	meta = frappe.get_meta(reference_doctype)

	title_field = meta.get_title_field()
	image_field = meta.image_field

	return {
		"reference_doctype": reference_doctype,
		"reference_name": reference_name,
		"title": doc.get(title_field) if title_field else reference_name,
		"image": doc.get(image_field) if image_field else None,
		"modified": doc.modified,
	}


@frappe.whitelist()
def find_diagrams_referencing(reference_doctype, reference_name):
	"""Reverse lookup: every Diagram that has a node pointing at this record."""
	return frappe.get_all(
		"Diagram Reference",
		filters={
			"reference_doctype": reference_doctype,
			"reference_name": reference_name,
		},
		fields=["parent as diagram"],
		distinct=True,
	)
