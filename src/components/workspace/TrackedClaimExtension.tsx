// Route: src/components/workspace/TrackedClaimExtension.tsx

import { Mark, mergeAttributes } from '@tiptap/core'

export interface TrackedClaimOptions {
  HTMLAttributes: Record<string, any>
  onClaimClick?: (claimId: string) => void
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    trackedClaim: {
      setTrackedClaim: (attributes: { claimId: string }) => ReturnType
      unsetTrackedClaim: () => ReturnType
    }
  }
}

export const TrackedClaimMark = Mark.create<TrackedClaimOptions>({
  name: 'trackedClaim',

  addOptions() {
    return {
      HTMLAttributes: {},
      onClaimClick: undefined,
    }
  },

  addAttributes() {
    return {
      claimId: {
        default: null,
        parseHTML: element => element.getAttribute('data-claim-id'),
        renderHTML: attributes => {
          if (!attributes.claimId) return {}
          return { 'data-claim-id': attributes.claimId }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-claim-id]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'tracked-claim',
        style: `
          background-color: rgba(91, 223, 250, 0.15);
          border-bottom: 2px solid #5BDFFA;
          padding: 1px 2px;
          border-radius: 2px;
          cursor: pointer;
          transition: background-color 0.15s ease;
        `,
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setTrackedClaim:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes)
        },
      unsetTrackedClaim:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },
})

// CSS to add to your global styles:
/*
.tracked-claim:hover {
  background-color: rgba(91, 223, 250, 0.25);
}

.tracked-claim::before {
  content: '○ ';
  font-size: 0.75em;
  color: #5BDFFA;
}
*/
