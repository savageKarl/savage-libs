import connect, { type Server } from 'connect'
import request from 'supertest'
import mock from 'mock-fs'
import {
  redirectMiddleware,
  bundleMiddware,
  serverMiddleware
} from '../../src/utils/middleware'
import { previewPath } from '../../src/utils/constants'

import { splicePath } from './common'

describe('middleware', () => {
  let app: Server

  beforeEach(() => {
    app = connect()
  })

  describe('redirectMiddleware', () => {
    it('should redirect to dev install page', async () => {
      app.use('/', redirectMiddleware('dev'))
      app.use('/index.html', redirectMiddleware('dev'))
      const res = await request(app).get('/').expect(200)
      expect(res.text).toMatchFileSnapshot(
        splicePath('redirectMiddleware.dev.html')
      )
    })

    it('should redirect to preview install page', async () => {
      app.use('/', redirectMiddleware('preview'))
      app.use('/index.html', redirectMiddleware('preview'))
      const res = await request(app).get('/').expect(200)
      expect(res.text).toMatchFileSnapshot(
        splicePath('redirectMiddleware.preview.html')
      )
    })

    it('should redirect to build install page', async () => {
      app.use('/', redirectMiddleware('prod'))
      app.use('/index.html', redirectMiddleware('prod'))
      const res = await request(app).get('/index.html').expect(200)
      expect(res.text).toMatchFileSnapshot(
        splicePath('redirectMiddleware.build.html')
      )
    })

    it('can not redirect to target page', async () => {
      app.use('/', redirectMiddleware('prod'))
      app.use('/index.html', redirectMiddleware('prod'))
      const res = await request(app).get('/foo.html').expect(404)
    })
  })

  describe('bundleMiddware', () => {
    function resovledConfig() {
      return {
        build: {
          outDir: 'dist'
        }
      } as any
    }

    function usOptions() {
      return {
        metaData: {
          name: 'foo'
        }
      } as any
    }

    it('should return correct content', async () => {
      mock({
        dist: {
          'foo.user.js': 'wow'
        }
      })
      app.use(bundleMiddware(resovledConfig(), usOptions()))

      const res = await request(app).get(`/${previewPath}`).expect(200)
      expect(res.text).toBe('wow')
      expect(res.headers).toMatchObject({
        'access-control-allow-origin': '*',
        'content-type': 'application/javascript'
      })
    })

    it('should return nothing', async () => {
      app.use(bundleMiddware(resovledConfig(), usOptions()))
      await request(app).get(`/`).expect(404)
      await request(app).get(`/foo.html`).expect(404)
    })
  })
})
