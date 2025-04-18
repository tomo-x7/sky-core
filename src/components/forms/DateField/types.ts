export type DateFieldProps = {
	value: string | Date;
	onChangeDate: (date: string) => void;
	label: string;
	inputRef?: React.Ref<HTMLInputElement>;
	isInvalid?: boolean;
	maximumDate?: string | Date;
};
