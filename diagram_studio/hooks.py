app_name = "diagram_studio"
app_title = "Diagram Studio"
app_publisher = "X-Sha"
app_description = "Editor diagram (flowchart/org chart/dsb) yang node-nya bisa terhubung langsung ke data ERPNext."
app_icon = "octicon octicon-git-branch"
app_color = "grey"
app_email = "it@x-sha.id"
app_license = "MIT"

# Bundle JS/CSS yang dipakai halaman "Diagram Studio"
app_include_js = []
app_include_css = []

# Doctype events: sinkronkan child table "references" tiap kali Diagram disimpan,
# supaya query "diagram mana yang mereferensikan record X" tetap jalan tanpa parse JSON manual.
doc_events = {
    "Diagram": {
        "validate": "diagram_studio.diagram_studio.doctype.diagram.diagram.sync_references",
    }
}
