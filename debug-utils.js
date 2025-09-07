/**
 * Debug Utilities for Notes Application
 * 
 * This file contains debugging code that was used during development.
 * Include this file in your HTML when you need to debug issues.
 * 
 * Usage: Add <script src="debug-utils.js"></script> to your HTML file
 */

// Debug logging utilities
const DebugLogger = {
  enabled: true,
  
  log: function(message, data = null) {
    if (this.enabled) {
      if (data) {
        console.log(`🔍 ${message}`, data);
      } else {
        console.log(`🔍 ${message}`);
      }
    }
  },
  
  error: function(message, data = null) {
    if (this.enabled) {
      if (data) {
        console.error(`❌ ${message}`, data);
      } else {
        console.error(`❌ ${message}`);
      }
    }
  },
  
  success: function(message, data = null) {
    if (this.enabled) {
      if (data) {
        console.log(`✅ ${message}`, data);
      } else {
        console.log(`✅ ${message}`);
      }
    }
  },
  
  warn: function(message, data = null) {
    if (this.enabled) {
      if (data) {
        console.warn(`⚠️ ${message}`, data);
      } else {
        console.warn(`⚠️ ${message}`);
      }
    }
  }
};

// Context menu debugging
const ContextMenuDebugger = {
  logContextMenuTrigger: function(contextMenuType, contextMenuId, target) {
    DebugLogger.log('Context menu triggered:', {
      contextMenuType,
      contextMenuId,
      target: target
    });
  },
  
  logContextMenuAction: function(action) {
    DebugLogger.log('Context menu action clicked:', action);
  },
  
  logContextData: function(contextType, contextId) {
    DebugLogger.log('Context data:', { contextType, contextId });
  },
  
  logContextDataCleared: function(originalType, originalId, currentType, currentId) {
    DebugLogger.error('CONTEXT DATA WAS CLEARED!', {
      original: { type: originalType, id: originalId },
      current: { type: currentType, id: currentId }
    });
    console.trace('Stack trace of where context was cleared:');
  }
};

// Rename functionality debugging
const RenameDebugger = {
  logRenameModalShown: function(contextType, contextId) {
    DebugLogger.log('showRenameModalWithData called:', { contextType, contextId });
  },
  
  logContextDataStored: function(contextType, contextId) {
    DebugLogger.log('Context data stored in modal dataset:', { contextType, contextId });
  },
  
  logConvertedId: function(id) {
    DebugLogger.log('Converted ID:', id);
  },
  
  logFoundItem: function(itemType, item) {
    DebugLogger.log(`Found ${itemType} for rename:`, item);
  },
  
  logSettingInputValue: function(value) {
    DebugLogger.log('Setting rename input value to:', value);
  },
  
  logRenameButtonClicked: function() {
    DebugLogger.log('Rename button clicked!');
  },
  
  logConfirmRename: function(contextType, contextId) {
    DebugLogger.log('confirmRenameWithData called with:', { contextType, contextId });
  },
  
  logNewName: function(name) {
    DebugLogger.log('New name:', name);
  },
  
  logParsedId: function(id) {
    DebugLogger.log('Parsed ID:', id);
  },
  
  logCallingRename: function(renameType) {
    DebugLogger.log(`Calling ${renameType}`);
  },
  
  logRenamePageCalled: function(pageId, newName) {
    DebugLogger.log('renamePage called:', { pageId, newName });
  },
  
  logAvailablePages: function(pages) {
    DebugLogger.log('Available pages:', pages);
  },
  
  logPageUpdated: function() {
    DebugLogger.log('Page updated, saving data...');
  },
  
  logDataSaved: function() {
    DebugLogger.log('Data saved, rendering pages...');
  },
  
  logHideModal: function() {
    DebugLogger.log('hideRenameModal called');
  },
  
  logBeforeClearing: function(contextType, contextId) {
    DebugLogger.log('Before clearing - contextMenuType:', contextType, 'contextMenuId:', contextId);
  },
  
  logAfterClearing: function(contextType, contextId) {
    DebugLogger.log('After clearing - contextMenuType:', contextType, 'contextMenuId:', contextId);
  }
};

// Data persistence debugging
const DataDebugger = {
  logDataLoaded: function(source) {
    DebugLogger.success(`Data loaded from ${source}`);
  },
  
  logDataSaved: function(source) {
    DebugLogger.success(`Data saved to ${source}`);
  },
  
  logSavingPage: function(pageData) {
    DebugLogger.log('💾 Saving page:', pageData);
  },
  
  logEncryptedContent: function() {
    DebugLogger.log('🔒 Encrypted content for private section');
  },
  
  logPlainContent: function() {
    DebugLogger.log('🔓 Saved plain content');
  }
};

// Context data watcher for debugging context clearing issues
const ContextWatcher = {
  watchContextData: function(originalType, originalId, contextObject) {
    const checkContextData = () => {
      if (contextObject.contextMenuType !== originalType || contextObject.contextMenuId !== originalId) {
        ContextMenuDebugger.logContextDataCleared(
          originalType, 
          originalId, 
          contextObject.contextMenuType, 
          contextObject.contextMenuId
        );
      }
    };
    
    // Check every 100ms
    const intervalId = setInterval(checkContextData, 100);
    
    // Return cleanup function
    return () => clearInterval(intervalId);
  }
};

// Event listener debugging
const EventDebugger = {
  logEventSetup: function(elementId) {
    DebugLogger.log(`Setting up ${elementId} event listener`);
  },
  
  logElementNotFound: function(elementId) {
    DebugLogger.error(`${elementId} not found!`);
  },
  
  logEventTriggered: function(eventType, elementId) {
    DebugLogger.log(`${eventType} event triggered on ${elementId}`);
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DebugLogger,
    ContextMenuDebugger,
    RenameDebugger,
    DataDebugger,
    ContextWatcher,
    EventDebugger
  };
}

// Make available globally
window.DebugUtils = {
  DebugLogger,
  ContextMenuDebugger,
  RenameDebugger,
  DataDebugger,
  ContextWatcher,
  EventDebugger
};
