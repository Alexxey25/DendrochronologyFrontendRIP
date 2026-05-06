import { resolve } from 'path'
import { generateApi } from 'swagger-typescript-api'

await generateApi({
  name: 'Api.ts',
  output: resolve(process.cwd(), './src/api'),
  input: resolve(process.cwd(), '../WEB/docs/swagger.json'),
  httpClientType: 'axios'
})