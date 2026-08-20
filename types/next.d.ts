declare module 'next' {
  export default function Next(...args: unknown[]): unknown
  export type Metadata = {
    title?: string
    description?: string
    [key: string]: unknown
  }
  export type Viewport = {
    width?: string | number
    initialScale?: number
    [key: string]: unknown
  }
}

declare module 'next/server' {
  export class NextRequest extends Request {
    nextUrl: URL
    cookies: {
      get(name: string): { value: string } | undefined
      set(name: string, value: string): void
    }
  }
  export class NextResponse extends Response {
    static json(data: unknown, init?: ResponseInit): NextResponse
    static redirect(url: string | URL, init?: ResponseInit): NextResponse
  }
}

declare module 'next/navigation' {
  export function useRouter(): {
    push(url: string): void
    replace(url: string): void
    refresh(): void
    back(): void
    forward(): void
  }
  export function useSearchParams(): URLSearchParams
  export function usePathname(): string
  export function useParams(): Record<string, string | string[]>
}

declare module 'next/link' {
  import { ComponentType, ReactNode } from 'react'
  interface LinkProps {
    href: string
    children: ReactNode
    className?: string
    [key: string]: unknown
  }
  const Link: ComponentType<LinkProps>
  export default Link
}

declare module 'next/types' {
  export type NextApiRequest = {
    query: Record<string, string | string[]>
    body: unknown
    method: string
    url: string
    headers: Record<string, string | string[] | undefined>
  }
  export type NextApiResponse = {
    status(code: number): NextApiResponse
    json(data: unknown): void
    send(data: unknown): void
    redirect(url: string): void
  }
}
