import {
  AutoProcessor,
  AutoTokenizer,
  CLIPTextModelWithProjection,
  CLIPVisionModelWithProjection,
  RawImage,
  env,
} from '@huggingface/transformers'
import { CLIP_MODEL_ID } from '../modules/constructionClip'

env.allowLocalModels = false
env.allowRemoteModels = true

type IndexPayload = Array<{
  id: number
  clipDescriptionEn: string
}>

type WorkerIncomingMessage =
  | { type: 'init' }
  | { type: 'index_text'; data: IndexPayload }
  | { type: 'search_image'; data: Blob }

class ClipService {
  private static tokenizer: Awaited<ReturnType<typeof AutoTokenizer.from_pretrained>> | null = null
  private static processor: Awaited<ReturnType<typeof AutoProcessor.from_pretrained>> | null = null
  private static textModel:
    | Awaited<ReturnType<typeof CLIPTextModelWithProjection.from_pretrained>>
    | null = null
  private static visionModel:
    | Awaited<ReturnType<typeof CLIPVisionModelWithProjection.from_pretrained>>
    | null = null

  static async init() {
    if (this.tokenizer && this.processor && this.textModel && this.visionModel) {
      return
    }

    const modelOptions = {
      device: 'wasm',
      quantized: true,
    } as const

    this.tokenizer = await AutoTokenizer.from_pretrained(CLIP_MODEL_ID)
    this.processor = await AutoProcessor.from_pretrained(CLIP_MODEL_ID)
    this.textModel = await CLIPTextModelWithProjection.from_pretrained(CLIP_MODEL_ID, modelOptions)
    this.visionModel = await CLIPVisionModelWithProjection.from_pretrained(CLIP_MODEL_ID, modelOptions)
  }

  static async indexText(items: IndexPayload) {
    await this.init()

    if (!this.tokenizer || !this.textModel) {
      throw new Error('CLIP text model is not initialized')
    }

    const textInputs = await this.tokenizer(
      items.map((item) => item.clipDescriptionEn),
      {
        padding: true,
        truncation: true,
      }
    )

    const { text_embeds } = await this.textModel(textInputs)
    const embeddingSize = text_embeds.dims[text_embeds.dims.length - 1]
    const embeddings: Record<number, number[]> = {}

    for (let index = 0; index < items.length; index += 1) {
      const start = index * embeddingSize
      const end = start + embeddingSize
      embeddings[items[index].id] = Array.from(text_embeds.data.slice(start, end))
    }

    return embeddings
  }

  static async embedImage(file: Blob) {
    await this.init()

    if (!this.processor || !this.visionModel) {
      throw new Error('CLIP vision model is not initialized')
    }

    const image = await RawImage.fromBlob(file)
    const imageInputs = await this.processor(image)
    const { image_embeds } = await this.visionModel(imageInputs)

    return Array.from(image_embeds.data)
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown CLIP worker error'
}

self.addEventListener('message', async (event: MessageEvent<WorkerIncomingMessage>) => {
  const { type } = event.data

  try {
    if (type === 'init') {
      await ClipService.init()
      self.postMessage({ type: 'ready' })
      return
    }

    if (type === 'index_text') {
      const embeddings = await ClipService.indexText(event.data.data)

      self.postMessage({
        type: 'text_embeddings_ready',
        data: embeddings,
      })
      return
    }

    if (type === 'search_image') {
      const embedding = await ClipService.embedImage(event.data.data)

      self.postMessage({
        type: 'image_embedding_ready',
        data: embedding,
      })
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: toErrorMessage(error),
    })
  }
})
