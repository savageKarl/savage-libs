import { serve } from './server'
import { analyze } from './analyze'
import { html } from './html'
import { build } from './build'
import { preview } from './preview'

export const plugins = [html, serve, analyze, build, preview]
