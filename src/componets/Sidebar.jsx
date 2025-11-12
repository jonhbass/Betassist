import React from 'react'

// Sidebar receives callbacks from parent (Dashboard)
export default function Sidebar({
	onCopyReferral = () => {},
	onPlay = () => {},
	onLoad = () => {},
	onWithdraw = () => {},
	onHistory = () => {},
}) {
	return (
		<nav className="ba-sidebar-nav" aria-label="Main">
			<ul className="ba-sidebar-list">
				<li>
					<button className="ba-action primary" onClick={onCopyReferral}>
						🔗 Copiar link de referido
					</button>
				</li>
				<li>
					<button className="ba-action highlight" onClick={onPlay}>
						Ir a jugar <strong>CLUBUNO.NET</strong>
					</button>
				</li>
				<li>
					<button className="ba-action" onClick={onLoad}>
						💳 Cargar fichas
					</button>
				</li>
				<li>
					<button className="ba-action" onClick={onWithdraw}>
						💸 Retirar fichas
					</button>
				</li>
				<li>
					<button className="ba-action" onClick={onHistory}>
						🧾 Historial
					</button>
				</li>
			</ul>
		</nav>
	)
}
