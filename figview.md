# SurveyChat - Technical Specification

## Overview
AI-powered survey builder with conversational completion mode. Researchers create surveys via prompts or manual building. Participants complete as forms or chat.

## Architecture

### Data Models

```typescript
interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: number;
  shareId: string; // URL-safe unique ID
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'short_text' | 'long_text' | 'rating' | 'yes_no';
  text: string;
  required: boolean;
  options?: string[]; // for multiple_choice
  maxRating?: number; // for rating (default 5)
}

interface Response {
  id: string;
  surveyId: string;
  answers: Record<string, Answer>; // questionId -> Answer
  completedAt?: number;
  currentQuestionIndex: number; // for chat mode
}

interface Answer {
  questionId: string;
  value: string | number;
}
```

### Storage Schema

**Keys:**
- `survey:{surveyId}` → Survey object
- `response:{responseId}` → Response object
- `survey-index` → Array of survey IDs (for researcher dashboard)

## Feature Specifications

### 1. AI Survey Generation

**Endpoint:** Anthropic Messages API  
**Model:** `claude-sonnet-4-20250514`

**Prompt Template:**
```
Generate a survey based on this request: {userPrompt}

Return ONLY valid JSON matching this schema:
{
  "title": "string",
  "description": "string", 
  "questions": [
    {
      "type": "multiple_choice|short_text|long_text|rating|yes_no",
      "text": "string",
      "required": boolean,
      "options": ["string"] // only for multiple_choice
    }
  ]
}

Use SurveyMonkey best practices. No markdown, no explanations.
```

**Flow:**
1. User enters prompt → API call
2. Parse JSON response
3. Load into editor (editable state)
4. User can modify before saving

### 2. Manual Builder UI

**Components:**
- Question type selector (dropdown)
- Question text input
- Dynamic options editor (for multiple_choice)
- Required toggle
- Drag-to-reorder (array reordering)
- Delete button

**Actions:**
- Add question → push to questions array
- Edit question → update by index
- Delete question → filter by id
- Reorder → swap array positions

### 3. Form Completion Mode

**Layout:**
- All questions visible at once
- Scrollable page
- Progress bar at top (answered/total)
- Submit button at bottom

**Validation:**
- Check required fields on submit
- Show error states for missing answers
- Prevent submit until valid

### 4. Chat Completion Mode

**Layout:**
- Single question per screen
- Progress: "Question X of Y"
- "Back" and "Next" buttons
- Auto-advance on answer (for yes_no, multiple_choice)

**Navigation:**
- Back button → currentQuestionIndex--
- Next button → save answer, currentQuestionIndex++
- Progress saved to storage on each answer

**State Management:**
```typescript
const [currentIndex, setCurrentIndex] = useState(0);
const [answers, setAnswers] = useState<Record<string, Answer>>({});

// Save on every answer
useEffect(() => {
  storage.set(`response:{responseId}`, { answers, currentIndex });
}, [answers, currentIndex]);
```

### 5. Share & Routing

**Routes:**
- `/` → Researcher dashboard (list surveys)
- `/create` → Builder interface
- `/survey/:shareId` → Participant view (mode selector)
- `/survey/:shareId/form` → Form mode
- `/survey/:shareId/chat` → Chat mode

**Share Link Generation:**
```typescript
const shareId = crypto.randomUUID().substring(0, 8);
const shareUrl = `${window.location.origin}/survey/${shareId}`;
```

## UI Components

### Core Components
1. **SurveyBuilder** - Question editor with AI generation
2. **QuestionEditor** - Single question edit interface
3. **FormView** - Traditional form completion
4. **ChatView** - Conversational completion
5. **ProgressBar** - Visual completion indicator
6. **ShareModal** - Display/copy share link

### Design System
- **Colors:** Primary blue (#3b82f6), neutral grays
- **Typography:** System font stack, clear hierarchy
- **Spacing:** 4px base unit, consistent padding
- **Components:** Clean, minimal SurveyMonkey-inspired aesthetic

## Error Handling

### API Errors
```typescript
try {
  const response = await fetch('/api/anthropic', {...});
  if (!response.ok) throw new Error('Generation failed');
  const data = await response.json();
  const parsed = JSON.parse(data.content[0].text);
} catch (error) {
  // Show user-friendly error
  setError('Failed to generate survey. Please try again.');
}
```

### Storage Errors
- Wrap all storage calls in try-catch
- Show error UI if storage unavailable
- Graceful degradation (disable persistence)

## Performance Considerations

- Debounce auto-save (500ms)
- Lazy load survey list (paginate if >50 surveys)
- Memoize question components
- Virtual scrolling for long surveys (>20 questions)

## Security & Validation

- Sanitize user input (XSS prevention)
- Validate JSON schema from AI
- Max limits: 50 questions/survey, 500 chars/question
- Rate limit API calls (client-side: 1 req/2sec)

## Testing Checklist

- [ ] AI generation produces valid survey JSON
- [ ] All 5 question types render correctly
- [ ] Form mode validation works
- [ ] Chat mode navigation (forward/back)
- [ ] Answers persist across page refresh
- [ ] Share links load correct survey
- [ ] Multiple responses to same survey work
- [ ] Progress indicator accurate
- [ ] Mobile responsive

## Deployment

**Build:** Single-page React app  
**Host:** Static hosting (Vercel/Netlify)  
**API:** Anthropic API key in environment variable

```bash
# Environment
ANTHROPIC_API_KEY=sk-ant-xxx

# Build
npm run build

# Deploy
vercel deploy
```

## Future Enhancements (Post-v1)
- Response analytics dashboard
- Question branching logic
- Export responses to CSV
- Survey templates library
- Multi-language support
