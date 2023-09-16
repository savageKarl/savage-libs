import { serve } from './server'
import { analyze } from './analyze'
import { build } from './build'
import { preview } from './preview'

export const plugins = [serve, analyze, build, preview]
