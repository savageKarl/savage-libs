export interface TypeInfoItem {
	isGenerics?: boolean
	isLowerCase?: boolean
	isExclude?: boolean
	genericsLen?: number
	weakGenerics?: boolean
	tsIgnore?: boolean
}

export type TypeInfo = Record<string, TypeInfoItem>
