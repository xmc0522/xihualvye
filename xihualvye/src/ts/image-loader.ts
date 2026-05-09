import { reactive } from 'vue'

// 所有款式共用的 JPG 图片懒加载器
// ----------------------------------------------------------
// 之前：import.meta.glob('.../JPG/*.jpg', { eager: true })
//   → 全部图片同步打包进 bundle，首屏直接吃光
// 现在：eager: false
//   → 每张图片都是 () => Promise<string>，仅在需要时才加载
//   → 加载完成后写入响应式缓存，<img :src="getImage(xinghao)"> 会自动刷新
// ----------------------------------------------------------

// Vite 的懒加载 glob：返回 Record<path, () => Promise<default-export>>
const lazyImageModules = import.meta.glob('../../JPG/*.jpg', {
  import: 'default',
}) as Record<string, () => Promise<string>>

// 路径 → URL 缓存（响应式：任何使用该 URL 的模板会在加载完成后自动重新渲染）
const imageUrlCache = reactive<Record<string, string>>({})
// 进行中的加载，防止重复请求
const loadingMap: Record<string, Promise<string>> = {}

/** 异步加载某个型号对应的图片 URL，返回 url 字符串（加载失败返回 ''） */
export function loadImageByXinghao(xinghao: string): Promise<string> {
  if (!xinghao) return Promise.resolve('')
  if (imageUrlCache[xinghao]) return Promise.resolve(imageUrlCache[xinghao])
  if (loadingMap[xinghao]) return loadingMap[xinghao]

  const key = Object.keys(lazyImageModules).find((k) => k.includes(xinghao))
  if (!key) {
    imageUrlCache[xinghao] = ''
    return Promise.resolve('')
  }
  const loader = lazyImageModules[key]
  if (!loader) {
    imageUrlCache[xinghao] = ''
    return Promise.resolve('')
  }
  const p = loader()
    .then((url) => {
      imageUrlCache[xinghao] = url
      delete loadingMap[xinghao]
      return url
    })
    .catch(() => {
      imageUrlCache[xinghao] = ''
      delete loadingMap[xinghao]
      return ''
    })
  loadingMap[xinghao] = p
  return p
}

/**
 * 同步获取型号图片 URL（用于 <img :src> 绑定）。
 * 第一次访问时返回 ''，并触发异步加载；加载完成后由响应式缓存自动驱动模板刷新。
 */
export function getImageByXinghao(xinghao: string): string {
  if (!xinghao) return ''
  const cached = imageUrlCache[xinghao]
  if (cached !== undefined) return cached
  // 触发懒加载，但不等待
  void loadImageByXinghao(xinghao)
  return ''
}

/**
 * 兼容老接口：构造一个"看起来像 import.meta.glob eager 结果"的代理对象，
 * 使 button1.ts 等老调用方零改动。
 * 注意：访问对象属性会触发懒加载并阻塞返回（仅在 button1 的下载流程使用）。
 */
export async function buildImageModulesForExport(
  xinghaoList: string[],
): Promise<Record<string, string>> {
  // 并行加载所有型号
  const uniqueList = Array.from(new Set(xinghaoList.filter(Boolean)))
  await Promise.all(uniqueList.map((x) => loadImageByXinghao(x)))
  // 构造一份"假 glob 结果"：键名采用 'JPG/{xinghao}.jpg'，值为已加载的 URL
  const result: Record<string, string> = {}
  for (const xinghao of uniqueList) {
    const url = imageUrlCache[xinghao]
    if (url) result[`JPG/${xinghao}.jpg`] = url
  }
  return result
}
