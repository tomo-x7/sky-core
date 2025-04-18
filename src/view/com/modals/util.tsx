/**@deprecated */
export function ScrollView(rest: Omit<JSX.IntrinsicElements["div"], "ref"> & Record<string, unknown>) {
	return <div {...rest} />;
}
