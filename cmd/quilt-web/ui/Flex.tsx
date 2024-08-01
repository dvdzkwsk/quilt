import {cx} from "@pkg/util/ReactUtil.js"

export interface FlexProps
	extends React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> {
	wrap?: boolean
	gap?: number
	flex?: number | boolean
	children: React.ReactNode
}

export const Flex = ({
	children,
	style: styleOverrides,
	className,
	wrap,
	gap,
	flex,
	...rest
}: FlexProps) => {
	const style: React.CSSProperties = {display: "flex"}
	if (wrap) {
		style.flexWrap = "wrap"
	}
	if (gap) {
		style.gap = gap
	}
	if (flex) {
		style.flex = typeof flex === "boolean" ? (flex ? 1 : 0) : flex
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
