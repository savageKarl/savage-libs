/* eslint-disable camelcase */
interface AreaData {
	province_list: {
		[index: string]: string
	}
	city_list: {
		[index: string]: string
	}
	county_list: {
		[index: string]: string
	}
}

interface Item {
	value: string
	label: string
}

interface ProvinceOrCityItem extends Item {
	children: Item[]
}

/** 解析省市区列表数据，提供给uView组件使用 */
export function parseAreaListData(areaData: AreaData) {
	const temp = []
	const { province_list, city_list, county_list } = areaData

	for (const provinceCode in province_list) {
		const provinceId = provinceCode.substr(0, 2)
		const provinceItem = {} as ProvinceOrCityItem
		provinceItem.value = province_list[provinceCode]
		provinceItem.label = province_list[provinceCode]

		for (const cityCode in city_list) {
			const cityId = cityCode.substr(0, 4)
			const cityItem = {} as ProvinceOrCityItem

			if (cityId.includes(provinceId)) {
				cityItem.value = city_list[cityCode]
				cityItem.label = city_list[cityCode]

				for (const countyCode in county_list) {
					const countyItem = {} as Item
					if (countyCode.includes(cityId)) {
						countyItem.value = county_list[countyCode]
						countyItem.label = county_list[countyCode]
						cityItem.children.push(countyItem)
					}
				}
				provinceItem.children.push(cityItem)
			}
		}
		temp.push(provinceItem)
	}
	return temp
}
