import "./Form.css"
import * as React from "react"
import {cx} from "@pkg/util/ReactUtil.js"

export interface InputProps
	extends React.DetailedHTMLProps<
		React.InputHTMLAttributes<HTMLInputElement>,
		HTMLInputElement
	> {}

export const Input = ({autoFocus, className, ...rest}: InputProps) => {
	const ref = React.useRef<HTMLInputElement | null>(null)

	React.useEffect(() => {
		if (autoFocus) {
			ref.current?.focus()
		}
	}, [])

	return (
		<input
			className={cx("Input", className)}
			autoFocus={autoFocus}
			ref={ref}
			{...rest}
		/>
	)
}
