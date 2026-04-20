import React from 'react'
import { createRoot } from 'react-dom/client'

/**
 * Shadow DOM UI Creator
 * 
 * Creates an isolated Shadow DOM container for React components
 * Prevents CSS conflicts between the extension and the host page
 */

interface ShadowRootConfig {
  styles?: string
  attributes?: Record<string, string>
}

/**
 * Create a Shadow DOM container for React components
 */
export function createShadowRootUI(
  container: HTMLElement,
  componentType: string,
  props: Record<string, unknown> = {},
  config: ShadowRootConfig = {}
): { shadow: ShadowRoot; root: ReturnType<typeof createRoot> } {
  // Create shadow root
  const shadow = container.attachShadow({ mode: 'open' })
  
  // Inject styles
  const styleSheet = document.createElement('style')
  styleSheet.textContent = `
    /* Reset styles for isolation */
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    /* Your extension styles */
    .react-extension-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      padding: 16px;
      min-width: 300px;
    }
    
    .react-extension-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .react-extension-title {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }
    
    .react-extension-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      color: #6b7280;
      transition: color 0.2s;
    }
    
    .react-extension-close:hover {
      color: #111827;
      background: #f3f4f6;
    }
    
    .react-extension-content {
      color: #374151;
      font-size: 14px;
      line-height: 1.5;
    }
    
    ${config.styles || ''}
  `
  shadow.appendChild(styleSheet)
  
  // Create React root container
  const reactContainer = document.createElement('div')
  reactContainer.className = 'react-extension-container'
  shadow.appendChild(reactContainer)
  
  // Render component
  const root = createRoot(reactContainer)
  
  // Render a placeholder component
  // In a real implementation, you'd dynamically import the actual component
  root.render(
    React.createElement(InjectedComponent, { 
      type: componentType, 
      ...props,
      onClose: () => {
        root.unmount()
        container.remove()
      }
    })
  )
  
  return { shadow, root }
}

/**
 * Placeholder component for injected UI
 */
function InjectedComponent({ 
  type, 
  onClose,
  ...props 
}: { 
  type: string
  onClose: () => void
  [key: string]: unknown 
}) {
  const [count, setCount] = React.useState(0)
  
  return (
    <div>
      <div className="react-extension-header">
        <h3 className="react-extension-title">React Extension - {type}</h3>
        <button className="react-extension-close" onClick={onClose}>×</button>
      </div>
      <div className="react-extension-content">
        <p>This is a React component injected into the page via Shadow DOM.</p>
        <p>Component type: {type}</p>
        <p>Props: {JSON.stringify(props)}</p>
        <div style={{ marginTop: '12px' }}>
          <button 
            onClick={() => setCount(c => c + 1)}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Count: {count}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Remove all injected UI elements
 */
export function removeAllInjectedUI(): void {
  const hosts = document.querySelectorAll('[id^="react-extension-"]')
  hosts.forEach(host => host.remove())
}

/**
 * Check if an element is within an extension shadow DOM
 */
export function isInExtensionShadowDOM(element: Element): boolean {
  let parent = element.parentElement
  while (parent) {
    if (parent.id?.startsWith('react-extension-')) {
      return true
    }
    parent = parent.parentElement
  }
  return false
}
