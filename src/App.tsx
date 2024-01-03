import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/lara-dark-purple/theme.css'
//SEE: https://primereact.org/configuration/

import { useState } from 'react'
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import './App.css'

function App() {
	const [count, setCount] = useState(0)
	const [date, setDate] = useState(null);

	return (
		<PrimeReactProvider>
			<h1>Vite + React</h1>
			<div className="card">
				<Button onClick={() => setCount((count) => count + 1)}>
					count is {count}
				</Button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
				<Calendar value={date} onChange={(e) => setDate(e.value)} />
			</div>
		</PrimeReactProvider>
	)
}

export default App
