import { createShadowRootUI } from '../shadow-dom'

/**
 * UI creation utilities for the content script
 */

export function createFloatingUI() {
  const button = document.createElement('button')
  button.id = 'react-extension-floating-button'

  const iconImg = document.createElement('img')
  iconImg.src = chrome.runtime.getURL('icons/icon48.png')
  iconImg.alt = 'Extension Icon'
  iconImg.style.cssText = `
    width: 28px;
    height: 28px;
    border-radius: 6px;
    pointer-events: none;
  `
  button.appendChild(iconImg)

  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 2147483647;
    transition: transform 0.2s, box-shadow 0.2s;
  `

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)'
    button.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)'
  })

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)'
    button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
  })

  button.addEventListener('click', async () => {
    try {
      await chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' })
    } catch (error) {
      console.error('Failed to open side panel:', error)
    }
  })

  const host = document.createElement('div')
  host.id = 'react-extension-host'
  const shadow = host.attachShadow({ mode: 'open' })
  shadow.appendChild(button)

  document.body.appendChild(host)
}

export async function injectComponent(componentType: string, props: Record<string, unknown>) {
  const container = document.createElement('div')
  container.id = 'react-extension-injected-component'
  container.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 2147483647;
  `

  document.body.appendChild(container)
  createShadowRootUI(container, componentType, props)

  console.log(`[Content Script] Injected component: ${componentType}`)
}

export function removeComponent() {
  const container = document.getElementById('react-extension-injected-component')
  if (container) {
    container.remove()
    console.log('[Content Script] Removed injected component')
  }
}
