import { AxiosRequestConfig, AxiosResponse } from 'axios'

declare module 'axios' {
	export interface AxiosRequestConfig {
		time: number
	}

	export interface AxiosResponse {
		time: number
	}
}
