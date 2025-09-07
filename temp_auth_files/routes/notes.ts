import { Router, Response } from 'express';
import { authService, AuthRequest } from '../auth/auth.js';
import { database, Note, User as DatabaseUser } from '../database/database.js';
import bcrypt from 'bcryptjs';

const router = Router();

// Get user's notes
router.get('/', authService.authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { category } = req.query;

    let notes: Note[];

    if (category) {
      notes = await database.getNotesByUser(userId, category as string);
    } else {
      notes = await database.getNotesByUser(userId);
    }

    // Don't return password hashes or encrypted content
    const safeNotes = notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.is_encrypted ? '[Encrypted]' : note.content,
      category: note.category,
      isEncrypted: note.is_encrypted,
      hasPassword: !!note.password_hash,
      createdAt: note.created_at,
      updatedAt: note.updated_at
    }));

    res.json({ notes: safeNotes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch notes' 
    });
  }
});

// Get specific note (with password verification if needed)
router.get('/:id', authService.authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const noteId = parseInt(req.params.id);
    const { password } = req.query;

    // Validate note ID
    if (isNaN(noteId)) {
      return res.status(400).json({ 
        error: 'Invalid note ID' 
      });
    }

    // Get all user notes to find the specific one
    const notes = await database.getNotesByUser(userId);
    const note = notes.find(n => n.id === noteId);

    if (!note) {
      return res.status(404).json({ 
        error: 'Note not found' 
      });
    }

    // Check if note is password protected
    if (note.password_hash) {
      if (!password) {
        return res.status(401).json({ 
          error: 'Password required to access this note',
          requiresPassword: true
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password as string, note.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Invalid password' 
        });
      }
    }

    // Return note content
    res.json({
      note: {
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.category,
        isEncrypted: note.is_encrypted,
        hasPassword: !!note.password_hash,
        createdAt: note.created_at,
        updatedAt: note.updated_at
      }
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch note' 
    });
  }
});

// Create new note
router.post('/', authService.authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      title,
      content,
      category = 'general',
      password,
      isEncrypted = false
    } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ 
        error: 'Title and content are required' 
      });
    }

    // Hash password if provided
    let passwordHash: string | undefined;
    if (password) {
      const saltRounds = 12;
      passwordHash = await bcrypt.hash(password, saltRounds);
    }

    // Create note
    const createData: any = {
      user_id: userId,
      title,
      content,
      category,
      is_encrypted: isEncrypted
    };
    
    if (passwordHash) {
      createData.password_hash = passwordHash;
    }
    
    const noteId = await database.createNote(createData);

    res.status(201).json({
      message: 'Note created successfully',
      note: {
        id: noteId,
        title,
        category,
        isEncrypted,
        hasPassword: !!passwordHash,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ 
      error: 'Failed to create note' 
    });
  }
});

// Update note
router.put('/:id', authService.authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const noteId = parseInt(req.params.id || '0');
    const {
      title,
      content,
      category,
      password,
      currentPassword,
      isEncrypted
    } = req.body;

    // Validate note ID
    if (isNaN(noteId)) {
      return res.status(400).json({ 
        error: 'Invalid note ID' 
      });
    }

    // Get all user notes to find the specific one
    const notes = await database.getNotesByUser(userId);
    const existingNote = notes.find(n => n.id === noteId);

    if (!existingNote) {
      return res.status(404).json({ 
        error: 'Note not found' 
      });
    }

    // Check if note is password protected and verify current password
    if (existingNote.password_hash) {
      if (!currentPassword) {
        return res.status(401).json({ 
          error: 'Current password required to update this note' 
        });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, existingNote.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Invalid current password' 
        });
      }
    }

    // Hash new password if provided
    let passwordHash = existingNote.password_hash;
    if (password !== undefined) {
      if (password) {
        const saltRounds = 12;
        passwordHash = await bcrypt.hash(password, saltRounds);
      } else {
        passwordHash = undefined; // Remove password protection
      }
    }

    // Update note
    const updateData: any = {
      title: title || existingNote.title,
      content: content || existingNote.content,
      category: category || existingNote.category,
      is_encrypted: isEncrypted !== undefined ? isEncrypted : existingNote.is_encrypted
    };
    
    if (passwordHash !== undefined) {
      updateData.password_hash = passwordHash;
    }
    
    await database.updateNote(noteId, updateData);

    res.json({
      message: 'Note updated successfully'
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ 
      error: 'Failed to update note' 
    });
  }
});

// Delete note
router.delete('/:id', authService.authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const noteId = parseInt(req.params.id || '0');
    const { password } = req.body;

    // Validate note ID
    if (isNaN(noteId)) {
      return res.status(400).json({ 
        error: 'Invalid note ID' 
      });
    }

    // Get all user notes to find the specific one
    const notes = await database.getNotesByUser(userId);
    const existingNote = notes.find(n => n.id === noteId);

    if (!existingNote) {
      return res.status(404).json({ 
        error: 'Note not found' 
      });
    }

    // Check if note is password protected and verify password
    if (existingNote.password_hash) {
      if (!password) {
        return res.status(401).json({ 
          error: 'Password required to delete this note' 
        });
      }

      const isValidPassword = await bcrypt.compare(password, existingNote.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Invalid password' 
        });
      }
    }

    // Delete note
    await database.deleteNote(noteId);

    res.json({
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ 
      error: 'Failed to delete note' 
    });
  }
});

// Get note categories
router.get('/categories/list', authService.authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const notes = await database.getNotesByUser(userId);

    // Extract unique categories
    const categories = [...new Set(notes.map(note => note.category))];

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories' 
    });
  }
});

// Search notes
router.get('/search/:query', authService.authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const query = (req.params.query || '').toLowerCase();
    const { category } = req.query;

    let notes = await database.getNotesByUser(userId);

    // Filter by category if specified
    if (category) {
      notes = notes.filter(note => note.category === category);
    }

    // Search in title and content
    const searchResults = notes.filter(note => 
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query)
    );

    // Don't return password hashes or encrypted content
    const safeResults = searchResults.map(note => ({
      id: note.id,
      title: note.title,
      content: note.is_encrypted ? '[Encrypted]' : note.content.substring(0, 200) + (note.content.length > 200 ? '...' : ''),
      category: note.category,
      isEncrypted: note.is_encrypted,
      hasPassword: !!note.password_hash,
      createdAt: note.created_at,
      updatedAt: note.updated_at
    }));

    res.json({ 
      query,
      results: safeResults,
      totalResults: safeResults.length
    });
  } catch (error) {
    console.error('Search notes error:', error);
    res.status(500).json({ 
      error: 'Failed to search notes' 
    });
  }
});

// Export notes (for future implementation)
router.get('/export/:format', authService.authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const format = req.params.format || '';
    const { category, password } = req.query;

    if (!['json', 'txt', 'csv'].includes(format)) {
      return res.status(400).json({ 
        error: 'Invalid export format. Supported formats: json, txt, csv' 
      });
    }

    let notes = await database.getNotesByUser(userId);

    // Filter by category if specified
    if (category) {
      notes = notes.filter(note => note.category === category);
    }

    // For now, just return JSON format
    // TODO: Implement actual file export functionality
    const exportData = {
      exportDate: new Date().toISOString(),
      totalNotes: notes.length,
      notes: notes.map(note => ({
        title: note.title,
        content: note.is_encrypted ? '[Encrypted]' : note.content,
        category: note.category,
        createdAt: note.created_at,
        updatedAt: note.updated_at
      }))
    };

    res.json(exportData);
  } catch (error) {
    console.error('Export notes error:', error);
    res.status(500).json({ 
      error: 'Failed to export notes' 
    });
  }
});

export default router;
