import React from 'react'
import { cn } from '@/utilities/ui'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { JSXConvertersFunction, RichText as PayloadRichText } from '@payloadcms/richtext-lexical/react'

// Import block components
import { BannerBlock } from '@/blocks/Banner/Component'
import { CodeBlock } from '@/blocks/Code/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'

export interface RichTextProps {
  className?: string
  data?: SerializedEditorState
  enableGutter?: boolean
  enableProse?: boolean
  converters?: JSXConvertersFunction
}

const RichText: React.FC<RichTextProps> = ({
  className,
  data,
  enableGutter = true,
  enableProse = true,
  converters
}) => {
  if (!data) {
    return null
  }

  // Default block converters
  const defaultConverters: JSXConvertersFunction = converters || (() => ({
    blocks: {
      banner: ({ node }: { node: any }) => {
        return <BannerBlock {...node.fields} />
      },
      code: ({ node }: { node: any }) => {
        return <CodeBlock {...node.fields} />
      },
      mediaBlock: ({ node }: { node: any }) => {
        return <MediaBlock {...node.fields} />
      },
    },
  }))

  try {
    return (
      <div
        className={cn(
          {
            'prose prose-slate dark:prose-invert max-w-none': enableProse,
            'container': enableGutter,
          },
          className
        )}
      >
        <PayloadRichText
          data={data}
          converters={defaultConverters}
        />
      </div>
    )
  } catch (error) {
    console.error('Error rendering RichText:', error)
    console.error('RichText data:', JSON.stringify(data, null, 2))

    // Fallback: try to render basic text content if possible
    try {
      const textContent = extractTextFromLexical(data)
      if (textContent) {
        return (
          <div className={cn(
            {
              'prose prose-slate dark:prose-invert max-w-none': enableProse,
              'container': enableGutter,
            },
            className
          )}>
            <div className="whitespace-pre-wrap">{textContent}</div>
          </div>
        )
      }
    } catch (fallbackError) {
      console.error('Fallback text extraction failed:', fallbackError)
    }

    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded">
        <p className="text-red-700 font-semibold">Error rendering content</p>
        <p className="text-red-600 text-sm mt-1">Please try refreshing the page or contact support if the issue persists.</p>
      </div>
    )
  }
}

// Helper function to extract plain text from lexical data
function extractTextFromLexical(data: SerializedEditorState): string {
  if (!data || !data.root || !data.root.children) {
    return ''
  }

  function extractFromChildren(children: any[]): string {
    return children.map(child => {
      if (child.type === 'text') {
        return child.text || ''
      } else if (child.children) {
        return extractFromChildren(child.children)
      }
      return ''
    }).join(' ')
  }

  return extractFromChildren(data.root.children)
}

export default RichText
