import "./Panel.css"
import {cx} from "@pkg/util/ReactUtil.js"
import {Flex, FlexProps} from "./Flex.js"

interface PanelProps extends FlexProps {
	id: string
}
export const Panel = ({className, ...rest}: PanelProps) => {
	return <Flex className={cx("Panel", className)} {...rest} />
}
