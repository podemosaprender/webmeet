/** components for fast prototyping
*/

import { InputText } from 'primereact/inputtext';

//SEE: https://react.dev/learn/typescript#typescript-with-react-components
type SetValueFn = (v: string) => void;
interface MyInputProps {
	id: string, 
	value: string, 
	setValue: SetValueFn,
	onEnter: (value: string) => any,
}
export function MyInput({id, value, setValue, onEnter}: MyInputProps) {
	return (
		<span className="p-float-label">
			<InputText 
				id={id} value={value} 
				onChange={(e) => setValue(String(e.target.value))}
				onKeyDown={(e) => { //SEE: https://github.com/primefaces/primereact/blob/2f1ffdc69e6f1ea430fdffcb1d4944d48b386730/components/lib/inputtext/InputText.js#L27
					if (e.key=="Enter") {
						e.stopPropagation()
						typeof(onEnter)=='function' && onEnter(value);
					}
				}}
			/>
			<label htmlFor={id}>{id}</label>
		</span>
	)
}


