// src/components/editor/extensions/InlineAutocomplete.ts
// Inline autocomplete extension - shows ghost text at cursor position

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface AutocompleteOptions {
  // Delay before triggering autocomplete (ms)
  delay: number
  // Callback to generate suggestion
  getSuggestion: (context: {
    textBefore: string
    fullDocument: string
    cursorPos: number
  }) => Promise<{ text: string; source?: string } | null>
  // Called when suggestion is accepted
  onAccept?: (text: string, source?: string) => void
}

export interface AutocompleteStorage {
  suggestion: string | null
  source: string | null
  isLoading: boolean
  decorationPos: number | null
  userTypedSinceLastSuggestion: boolean
}

export const autocompletePluginKey = new PluginKey('inlineAutocomplete')

export const InlineAutocomplete = Extension.create<AutocompleteOptions, AutocompleteStorage>({
  name: 'inlineAutocomplete',

  addOptions() {
    return {
      delay: 1500,
      getSuggestion: async () => null,
      onAccept: () => {},
    }
  },

  addStorage() {
    return {
      suggestion: null,
      source: null,
      isLoading: false,
      decorationPos: null,
      userTypedSinceLastSuggestion: true, // Start true so first suggestion can trigger
    }
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        const { suggestion, source } = this.storage
        if (suggestion) {
          // Insert the suggestion
          this.editor.chain()
            .focus()
            .insertContent(suggestion)
            .run()
          
          // Call onAccept callback
          this.options.onAccept?.(suggestion, source || undefined)
          
          // Clear suggestion state
          this.storage.suggestion = null
          this.storage.source = null
          this.storage.decorationPos = null
          this.storage.userTypedSinceLastSuggestion = false // Prevent immediate re-trigger
          
          // Force view update to clear decoration
          this.editor.view.dispatch(this.editor.state.tr)
          
          return true
        }
        return false
      },
      Escape: () => {
        if (this.storage.suggestion) {
          this.storage.suggestion = null
          this.storage.source = null
          this.storage.decorationPos = null
          // Force view update
          this.editor.view.dispatch(this.editor.state.tr)
          return true
        }
        return false
      },
    }
  },

  addProseMirrorPlugins() {
    const extension = this
    let debounceTimer: NodeJS.Timeout | null = null

    return [
      new Plugin({
        key: autocompletePluginKey,
        
        state: {
          init() {
            return DecorationSet.empty
          },
          apply(tr, oldDecorations, oldState, newState) {
            // If suggestion exists, create decoration
            const { suggestion, source, decorationPos } = extension.storage
            
            if (suggestion && decorationPos !== null) {
              // Verify position is still valid in current doc
              if (decorationPos > newState.doc.content.size) {
                extension.storage.suggestion = null
                extension.storage.decorationPos = null
                return DecorationSet.empty
              }
              
              // Create ghost text decoration at cursor position
              const widget = document.createElement('span')
              widget.className = 'inline-autocomplete-ghost'
              widget.textContent = suggestion
              if (source) {
                const sourceTag = document.createElement('span')
                sourceTag.className = 'inline-autocomplete-source'
                sourceTag.textContent = ` [${source}]`
                widget.appendChild(sourceTag)
              }
              
              const decoration = Decoration.widget(decorationPos, widget, {
                side: 1, // After cursor
                key: 'autocomplete-ghost',
              })
              
              return DecorationSet.create(newState.doc, [decoration])
            }
            
            return DecorationSet.empty
          },
        },
        
        props: {
          decorations(state) {
            return this.getState(state)
          },
          
          handleKeyDown(view, event) {
            // Tab and Escape are handled by keyboard shortcuts
            if (event.key === 'Tab' || event.key === 'Escape') {
              return false
            }
            
            // Modifier keys don't count as typing
            if (event.key === 'Shift' || event.key === 'Control' || 
                event.key === 'Alt' || event.key === 'Meta') {
              return false
            }
            
            // Any other key = user is typing
            extension.storage.userTypedSinceLastSuggestion = true
            
            // Clear existing suggestion when user types
            if (extension.storage.suggestion) {
              extension.storage.suggestion = null
              extension.storage.source = null
              extension.storage.decorationPos = null
            }
            
            return false
          },
        },
        
        view() {
          return {
            update(view, prevState) {
              // Clear any pending timer
              if (debounceTimer) {
                clearTimeout(debounceTimer)
              }
              
              // Don't trigger if already have suggestion or loading
              if (extension.storage.suggestion || extension.storage.isLoading) {
                return
              }
              
              // Don't trigger if user hasn't typed since last suggestion
              if (!extension.storage.userTypedSinceLastSuggestion) {
                return
              }
              
              const { state } = view
              const { selection, doc } = state
              const { from } = selection
              
              // Only trigger on cursor position (not selection)
              if (!selection.empty) return
              
              // Get text before cursor
              const textBefore = doc.textBetween(0, from, '\n', '\n')
              
              // Check if we're at end of sentence (. or ? or !)
              const trimmed = textBefore.trimEnd()
              const lastChar = trimmed.slice(-1)
              const atSentenceEnd = ['.', '?', '!'].includes(lastChar)
              
              // Also trigger at end of paragraph (empty line or just whitespace after content)
              const lastLine = textBefore.split('\n').pop() || ''
              const atParagraphEnd = lastLine.trim() === '' && trimmed.length > 0
              
              if (!atSentenceEnd && !atParagraphEnd) return
              
              // Debounce the API call
              debounceTimer = setTimeout(async () => {
                // Re-check conditions (might have changed during debounce)
                if (extension.storage.suggestion || extension.storage.isLoading) return
                if (!extension.storage.userTypedSinceLastSuggestion) return
                
                extension.storage.isLoading = true
                
                try {
                  const fullDocument = doc.textBetween(0, doc.content.size, '\n', '\n')
                  const result = await extension.options.getSuggestion({
                    textBefore,
                    fullDocument,
                    cursorPos: from,
                  })
                  
                  if (result && result.text) {
                    // Verify cursor is still at same position
                    const currentFrom = view.state.selection.from
                    if (currentFrom === from) {
                      extension.storage.suggestion = result.text
                      extension.storage.source = result.source || null
                      extension.storage.decorationPos = from
                      
                      // Force view update to show decoration
                      view.dispatch(view.state.tr)
                    }
                  }
                } catch (err) {
                  console.error('Autocomplete error:', err)
                } finally {
                  extension.storage.isLoading = false
                }
              }, extension.options.delay)
            },
            
            destroy() {
              if (debounceTimer) {
                clearTimeout(debounceTimer)
              }
            },
          }
        },
      }),
    ]
  },
})

// CSS styles for ghost text (add to global styles or inject)
export const autocompleteStyles = `
  .inline-autocomplete-ghost {
    color: #9CA3AF;
    pointer-events: none;
    user-select: none;
  }
  
  .inline-autocomplete-source {
    font-size: 0.75em;
    color: #6B7280;
    margin-left: 4px;
    padding: 1px 4px;
    background: #F3F4F6;
    border-radius: 3px;
    font-family: monospace;
  }
`