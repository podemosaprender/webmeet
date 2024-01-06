/** components for fast prototyping
*/

import { InputText } from 'primereact/inputtext';

//SEE: https://react.dev/learn/typescript#typescript-with-react-components
type SetValueFn = (v: string) => void;
interface MyInputProps {id: string, value: string, setValue: SetValueFn}
export function MyInput({id, value, setValue}: MyInputProps) {
	return (
		<span className="p-float-label">
			<InputText 
				id={id} value={value} 
				onChange={(e) => setValue(String(e.target.value))}
				//onInput={(e) => console.log(e)} //XXX: catch enter!
			/>
			<label htmlFor={id}>{id}</label>
		</span>
	)
}


