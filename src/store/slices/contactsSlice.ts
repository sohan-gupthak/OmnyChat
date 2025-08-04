import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Contact, UserContactsResponse } from '../../types';
import { UserService } from '../../services';

// Define the state interface
interface ContactsState {
  contacts: Contact[];
  selectedContact: Contact | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: ContactsState = {
  contacts: [],
  selectedContact: null,
  isLoading: false,
  error: null
};

// Async thunks
export const fetchContacts = createAsyncThunk(
  'contacts/fetchContacts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await UserService.getContacts();
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Failed to fetch contacts');
      }
      
      // Process contacts to ensure contactId is properly set
      const contacts = response.data.contacts.map(contact => {
        // If contactId is undefined, use the contact's id as the contactId
        return {
          ...contact,
          contactId: contact.contactId || contact.id,
          // Initialize other required fields if they don't exist
          isOnline: contact.isOnline || false,
          unreadCount: contact.unreadCount || 0
        };
      });
      
      console.log('Processed contacts:', contacts);
      return contacts;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch contacts');
    }
  }
);

export const addContact = createAsyncThunk(
  'contacts/addContact',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await UserService.addContact(userId);
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Failed to add contact');
      }
      return response.data.contact;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add contact');
    }
  }
);

export const removeContact = createAsyncThunk(
  'contacts/removeContact',
  async (contactId: number, { rejectWithValue }) => {
    try {
      const response = await UserService.removeContact(contactId);
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to remove contact');
      }
      return contactId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove contact');
    }
  }
);

// Contacts slice
const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    selectContact: (state, action: PayloadAction<Contact | null>) => {
      state.selectedContact = action.payload;
    },
    updateContactPresence: (state, action: PayloadAction<{ userId: number; isOnline: boolean }>) => {
      const { userId, isOnline } = action.payload;
      const contact = state.contacts.find(c => c.contactId === userId);
      if (contact) {
        contact.isOnline = isOnline;
        if (isOnline) {
          contact.lastSeen = new Date().toISOString();
        }
      }
    },
    updateUnreadCount: (state, action: PayloadAction<{ contactId: number; increment: boolean }>) => {
      const { contactId, increment } = action.payload;
      const contact = state.contacts.find(c => c.contactId === contactId);
      if (contact) {
        if (increment) {
          contact.unreadCount += 1;
        } else {
          contact.unreadCount = 0;
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Contacts
    builder.addCase(fetchContacts.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchContacts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.contacts = action.payload;
    });
    builder.addCase(fetchContacts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Add Contact
    builder.addCase(addContact.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(addContact.fulfilled, (state, action) => {
      state.isLoading = false;
      state.contacts.push(action.payload);
    });
    builder.addCase(addContact.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Remove Contact
    builder.addCase(removeContact.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(removeContact.fulfilled, (state, action) => {
      state.isLoading = false;
      state.contacts = state.contacts.filter(contact => contact.contactId !== action.payload);
      if (state.selectedContact && state.selectedContact.contactId === action.payload) {
        state.selectedContact = null;
      }
    });
    builder.addCase(removeContact.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { selectContact, updateContactPresence, updateUnreadCount, clearError } = contactsSlice.actions;
export default contactsSlice.reducer;
