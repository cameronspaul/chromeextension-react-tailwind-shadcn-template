export function setupCommandListener() {
  chrome.commands.onCommand.addListener(async (command) => {
    console.log('Command received:', command)

    switch (command) {
      case 'open_side_panel': {
        const currentWindow = await chrome.windows.getCurrent()
        if (currentWindow.id) {
          await chrome.sidePanel.open({ windowId: currentWindow.id })
        }
        break
      }
      case '_execute_action':
        // Default action command - popup will open automatically
        break
    }
  })
}
