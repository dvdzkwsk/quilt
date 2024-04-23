import {cx} from "@pkg/util/ReactUtil.js"

interface FlexProps
	extends React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> {
	wrap?: boolean
	gap?: number
	children: React.ReactNode
}
export const Flex = ({
	children,
	style: styleOverrides,
	className,
	wrap,
	gap,
	...rest
}: FlexProps) => {
	const style: React.CSSProperties = {display: "flex"}
	if (wrap) {
		style.flexWrap = "wrap"
	}
	if (gap) {
		style.gap = gap
	}
	return (
		<div
			className={cx("Flex", className)}
			style={{...style, ...styleOverrides}}
			{...rest}
		>
			{children}
		</div>
	)
}
