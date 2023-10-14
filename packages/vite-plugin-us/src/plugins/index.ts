import { serve } from './server'
import { html } from './html'
import { build } from './build'
import { preview } from './preview'

export const plugins = [html, serve, build, preview]
