import { useEffect, useState } from "react";
import { searchLink } from "./api";

type Props = {
	onPick: (doctype: string, name: string, label: string) => void;
	onClose: () => void;
};

const COMMON_DOCTYPES = ["Item", "Warehouse", "Employee", "Customer", "Supplier", "Sales Order", "Purchase Order"];

export default function LinkPicker({ onPick, onClose }: Props) {
	const [doctype, setDoctype] = useState(COMMON_DOCTYPES[0]);
	const [txt, setTxt] = useState("");
	const [results, setResults] = useState<Array<{ value: string; label?: string }>>([]);

	useEffect(() => {
		const handle = setTimeout(() => {
			searchLink(doctype, txt).then(setResults).catch(() => setResults([]));
		}, 200);
		return () => clearTimeout(handle);
	}, [doctype, txt]);

	return (
		<div className="ds-modal-backdrop" onClick={onClose}>
			<div className="ds-modal" onClick={(e) => e.stopPropagation()}>
				<h3>Tambah node terhubung ke record</h3>
				<div className="ds-modal__row">
					<select value={doctype} onChange={(e) => setDoctype(e.target.value)}>
						{COMMON_DOCTYPES.map((d) => (
							<option key={d} value={d}>
								{d}
							</option>
						))}
					</select>
					<input
						autoFocus
						placeholder="Cari record..."
						value={txt}
						onChange={(e) => setTxt(e.target.value)}
					/>
				</div>
				<ul className="ds-modal__results">
					{results.map((r) => (
						<li key={r.value} onClick={() => onPick(doctype, r.value, r.label || r.value)}>
							{r.label || r.value}
						</li>
					))}
					{results.length === 0 && <li className="ds-modal__empty">Ketik untuk mencari...</li>}
				</ul>
				<button onClick={onClose}>Batal</button>
			</div>
		</div>
	);
}
