import { serve } from './server'
import { build } from './build'
import { preview } from './preview'

export const plugins = [serve, build, preview]
