# AI Analysis Module

This module provides the foundation for the future BetterU AI Assistant.

## Purpose

The AI Assistant (when implemented) will analyze user data to:
- Identify mood patterns and emotional trends
- Correlate habits with outcomes  
- Suggest improvements based on historical data
- Answer natural language questions about user's journey

## Current Status

**Foundation Complete** ✓ - Ready for AI implementation

This module currently provides:
- Type definitions for AI-consumable data
- Mapper functions to convert domain objects
- Stubbed functions for future implementation
- Comprehensive documentation

## Files

- `analysis-types.ts` - Core types and mapper functions
- `analysis-types.test.ts` - Test suite for mappers
- `../../docs/ai-assistant-roadmap.md` - Full implementation roadmap

## Usage Example

```typescript
import { mapDiaryEntryToAnalyzableItem } from "@/lib/ai/analysis-types";

// Convert a diary entry for AI analysis
const entry = await prisma.diaryEntry.findUnique({ where: { id } });
const analyzableItem = mapDiaryEntryToAnalyzableItem(entry);

// analyzableItem now has:
// - Standardized structure across all data types
// - mood and tags for pattern analysis
// - text content ready for AI processing
// - metadata for contextual understanding
```

## Next Steps

When implementing the AI Assistant:

1. **Choose AI Provider**
   - OpenAI GPT-4 / Claude / Gemini
   - Consider costs and privacy

2. **Implement Timeline Builder**
   - Complete `buildUserTimelineForRange()` function
   - Load and combine all user data
   - Sort chronologically

3. **Create Prompt Templates**
   - Design prompts for different query types
   - Include context and formatting instructions

4. **Build Chat Interface**
   - Create UI components
   - Handle streaming responses
   - Manage conversation context

5. **Add Privacy Controls**
   - User consent for AI features
   - Option for local-only analysis
   - Data anonymization

See `/docs/ai-assistant-roadmap.md` for complete details.

## Database Schema

### DiaryEntry (AI-Ready)

```prisma
model DiaryEntry {
  id        String   @id
  userId    String
  date      DateTime
  title     String?
  content   String
  mood      String?    // NEW: For mood tracking
  tags      String[]   // NEW: For categorization
  // ... other fields
}
```

The `mood` and `tags` fields are optional and don't affect existing functionality.

## Architecture

```
User Data Sources
├── DiaryEntry (mood, tags, content)
├── Habit (frequency, completions, streaks)
├── Goal (progress, milestones, status)
└── CalendarEvent (schedule, calendar, activities)
         ↓
    Mapper Functions
         ↓
  AnalyzableItem[] (unified format)
         ↓
   Timeline Builder (future)
         ↓
    AI Analysis (future)
         ↓
  Insights & Suggestions
```

## Data Privacy

- All mapper functions are pure (no side effects)
- No AI provider integration yet
- User data stays in database
- Ready for privacy-preserving local analysis
- Future: user control over AI access

## Testing

Run the test suite:
```typescript
import { runMapperTests } from "@/lib/ai/analysis-types.test";
runMapperTests();
```

## Contributing

When adding new data types for AI analysis:

1. Add mapper function in `analysis-types.ts`
2. Follow the `AnalyzableItem` interface
3. Include relevant metadata
4. Add tests in `analysis-types.test.ts`
5. Update documentation

---

Last Updated: December 11, 2025  
Status: Foundation Complete - Not Yet Implemented
