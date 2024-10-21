import { serve } from './server'
import { html } from './html'
import { build } from './build'
import { preview } from './preview'
import { loader } from './loader'
import { externalResources } from './externalResources'

export const plugins = [
  html,
  serve,
  //
  // TODO, extract external resources
  // loader,
  // externalResources,
  //
  build,
  preview
]
