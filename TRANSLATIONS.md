# Multi-Language Translation System

This application includes a comprehensive multi-language translation system supporting Indonesian (Bahasa Indonesia) and English.

## Features

- **Two Languages**: English (en) and Indonesian (id)
- **Persistent Language Selection**: Language preference is saved to localStorage
- **Easy Translation Switching**: Language switcher dropdown in the UI
- **Organized Translation Structure**: JSON-based translations organized by feature modules
- **Type-Safe Translation Hook**: `useLanguage()` hook for accessing translations

## Architecture

### Translation Files

Translation files are stored in `/locales/`:
- `/locales/en.json` - English translations
- `/locales/id.json` - Indonesian translations

### Translation Structure

Each translation file is organized by feature:
- `common`: Common UI elements (Save, Cancel, Delete, etc.)
- `auth`: Authentication pages (Login, Register, Password Reset)
- `dashboard`: Dashboard layouts (Admin, User)
- `evacuation`: Air medical evacuation forms and displays
- `users`: User management pages
- `audit`: Audit logging pages
- `messages`: System messages and notifications

### Components

#### LanguageProvider
Located in `/app/context/language-context.tsx`

The context provider that manages:
- Current language state
- Language persistence to localStorage
- HTML lang attribute updates
- Translation lookup function

**Usage:**
```tsx
import { LanguageProvider } from '@/app/context/language-context'

export default function RootLayout({ children }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  )
}
```

#### useLanguage Hook
Access translations in any client component:

```tsx
'use client';

import { useLanguage } from '@/app/context/language-context'

export function MyComponent() {
  const { t, language, setLanguage } = useLanguage()
  
  return (
    <div>
      <p>{t('auth.login')}</p>
      <p>Current language: {language}</p>
    </div>
  )
}
```

#### LanguageSwitcher Component
Located in `/components/language-switcher.tsx`

Dropdown menu for switching between languages:
- Shows current language (EN or ID)
- Displays full language names in dropdown
- Uses checkmark to indicate current selection

**Usage:**
```tsx
import { LanguageSwitcher } from '@/components/language-switcher'

export default function Layout() {
  return (
    <div>
      <LanguageSwitcher />
    </div>
  )
}
```

## Usage in Components

### Basic Translation

```tsx
const { t } = useLanguage()

return <h1>{t('auth.login')}</h1> // "Login" or "Masuk"
```

### Translation with Fallback

```tsx
const { t } = useLanguage()

return <p>{t('custom.key', 'Default text')}</p>
```

### Language Switching

```tsx
const { language, setLanguage } = useLanguage()

// Switch to Indonesian
setLanguage('id')

// Switch to English
setLanguage('en')
```

### Access Full Translations Object

```tsx
const { translations } = useLanguage()

// Access entire translation object
console.log(translations.auth.login)
```

## Adding New Translations

### Step 1: Add to English Translation File (`/locales/en.json`)

```json
{
  "myfeature": {
    "title": "My Feature Title",
    "description": "Feature description",
    "button": "Click me"
  }
}
```

### Step 2: Add to Indonesian Translation File (`/locales/id.json`)

```json
{
  "myfeature": {
    "title": "Judul Fitur Saya",
    "description": "Deskripsi fitur",
    "button": "Klik saya"
  }
}
```

### Step 3: Use in Component

```tsx
const { t } = useLanguage()

return (
  <div>
    <h1>{t('myfeature.title')}</h1>
    <p>{t('myfeature.description')}</p>
    <button>{t('myfeature.button')}</button>
  </div>
)
```

## Implemented Translations

### Authentication Pages
- Login page (completely translated)
- Register page (completely translated)
- Password reset pages (ready for translation)
- All auth-related messages

### Common Elements
- Navigation labels
- Button labels
- Form field labels
- Error messages

### Evacuation System
- Form field labels (Air Medical Evacuation)
- Status options
- Priority levels
- Medical terminology

### Dashboard
- Admin dashboard labels
- User dashboard labels
- Statistics labels

## Best Practices

1. **Keep Keys Descriptive**: Use dot notation for hierarchy
   - Good: `auth.login.submitButton`
   - Bad: `btn` or `submit`

2. **Maintain Consistent Structure**: Both language files should have identical keys
   
3. **Handle Missing Translations**: Always provide a fallback
   ```tsx
   t('key.path', 'Default fallback text')
   ```

4. **Use Translations in Messages**: Keep user-facing text in translation files
   ```tsx
   // Good
   toast({ title: t('auth.loginSuccess') })
   
   // Avoid
   toast({ title: 'Login Successful' })
   ```

5. **Group Related Translations**: Organize by feature or page
   ```json
   {
     "evacuation": {
       "form": { ... },
       "status": { ... },
       "messages": { ... }
     }
   }
   ```

## Language Persistence

The selected language is automatically saved to localStorage with key `language`. When the user revisits the site, their language preference is restored.

To reset language preference:
```tsx
localStorage.removeItem('language')
```

## HTML Lang Attribute

The `<html>` element's `lang` attribute is automatically updated based on the selected language:
- English: `<html lang="en">`
- Indonesian: `<html lang="id">`

This improves accessibility and SEO.

## Current Language Coverage

| Feature | En | Id | Status |
|---------|----|----|--------|
| Common UI | ✓ | ✓ | Complete |
| Authentication | ✓ | ✓ | Complete |
| Dashboard | ✓ | ✓ | Complete |
| Evacuation Forms | ✓ | ✓ | Complete |
| User Management | ✓ | ✓ | Complete |
| Audit Logs | ✓ | ✓ | Complete |
| System Messages | ✓ | ✓ | Complete |

## Future Enhancements

- [ ] Add more languages (Spanish, French, etc.)
- [ ] Language selector in user settings
- [ ] RTL language support (Arabic, Hebrew)
- [ ] Date/time formatting based on locale
- [ ] Number formatting based on locale
- [ ] Language-specific validation messages
