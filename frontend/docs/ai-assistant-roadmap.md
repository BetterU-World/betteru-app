# BetterU AI Assistant Roadmap

## Overview

The BetterU AI Assistant will be an intelligent companion that helps users gain insights from their personal data. By analyzing diary entries, habits, goals, and calendar events, it will answer questions, identify patterns, and provide personalized recommendations.

## Vision

The AI assistant will transform BetterU from a tracking tool into an intelligent life coach that:
- Understands your emotional patterns over time
- Recognizes habits that correlate with better outcomes
- Suggests actionable improvements based on your history
- Provides context-aware reminders and encouragement

## Example Questions the AI Should Answer

### Temporal Pattern Analysis
- "Was I feeling like this around this time last year?"
- "Are there patterns in my diary entries each winter?"
- "What was I working on when I felt most productive?"
- "How has my mood changed over the past 6 months?"

### Habit & Behavior Insights
- "Which habits correlate with better moods?"
- "What activities help me feel less anxious?"
- "Do I sleep better on days I exercise?"
- "What's my habit completion rate compared to last month?"

### Goal Progress & Motivation
- "What goals have I completed in the past year?"
- "Am I making progress on my health goals?"
- "What obstacles have prevented me from completing goals before?"
- "What strategies worked best for achieving past goals?"

### Schedule & Life Balance
- "How much time do I spend on work vs. personal activities?"
- "When am I most likely to skip my morning routine?"
- "What days of the week am I most productive?"
- "Are there any scheduling conflicts with my goals?"

### Proactive Suggestions
- "Based on your recent mood entries, you might want to [suggestion]"
- "You're maintaining a 30-day streak on meditation - great work!"
- "It's been 2 weeks since you reflected on Goal X - want to update it?"
- "You mentioned feeling stressed 3 times this week - would you like to see patterns?"

## Technical Architecture

### Data Preparation Layer (IMPLEMENTED ✓)

The foundation is now in place:

1. **Enhanced Diary Model**
   - `mood` field: Optional string for mood tracking (e.g., "happy", "anxious", "tired")
   - `tags` field: String array for categorizing themes and topics
   - These fields are optional and backward-compatible

2. **AnalyzableItem Interface**
   - Unified data structure across all BetterU content types
   - Normalizes diary entries, habits, goals, and calendar events
   - Provides consistent schema for AI consumption

3. **Mapper Functions** (`/lib/ai/analysis-types.ts`)
   - `mapDiaryEntryToAnalyzableItem()` - Converts diary entries
   - `mapHabitToAnalyzableItem()` - Converts habits with completion stats
   - `mapGoalToAnalyzableItem()` - Converts goals with progress metrics
   - `mapCalendarEventToAnalyzableItem()` - Converts calendar events
   - All mappers are pure functions, no side effects

4. **Timeline Builder** (Stubbed)
   - `buildUserTimelineForRange()` - Will aggregate all user data
   - Returns chronologically sorted AnalyzableItem[]
   - Ready for implementation when AI features are added

### Future Implementation Phases

#### Phase 1: Data Collection & Context Building
- Implement `buildUserTimelineForRange()` to fetch and combine all user data
- Add helper functions for mood aggregation
- Create correlation detection utilities
- Build context window management for LLM prompts

#### Phase 2: AI Integration
- Choose AI provider (OpenAI GPT-4, Anthropic Claude, etc.)
- Implement prompt engineering system
- Create conversation context management
- Add streaming response handling
- Implement rate limiting and cost controls

#### Phase 3: Intelligent Features
- **Pattern Recognition**
  - Mood pattern analysis over time
  - Habit adherence correlation with outcomes
  - Goal completion predictors
  - Calendar activity analysis

- **Proactive Insights**
  - Daily/weekly summary generation
  - Anomaly detection (unusual patterns)
  - Milestone celebrations
  - Gentle reminders and encouragement

- **Conversational Interface**
  - Natural language question answering
  - Follow-up question handling
  - Context-aware suggestions
  - Multi-turn conversations

#### Phase 4: Advanced Features
- Voice interaction support
- Predictive analytics for goal achievement
- Personalized recommendations engine
- Privacy-preserving local analysis options
- Export insights to PDF/presentations

## Data Privacy & Security

Critical considerations:
- All AI analysis must respect user privacy
- Option for local-only analysis (no external API calls)
- Clear consent for any data sent to AI providers
- Data anonymization when possible
- User control over what data the AI can access
- Transparent logging of AI interactions

## UI Integration Points

### Chat Interface
- Floating chat button in app
- Dedicated AI assistant page
- Inline suggestions in diary, habits, goals

### Insight Cards
- Dashboard widgets showing key insights
- Trend graphs and visualizations
- "Ask AI about this" buttons on content

### Smart Suggestions
- Enhanced calendar suggestions using AI
- Habit recommendations based on mood
- Goal decomposition assistance

## Implementation Checklist

### Completed ✓
- [x] Add `mood` and `tags` fields to DiaryEntry model
- [x] Create AnalyzableItem interface
- [x] Implement mapper functions for all data types
- [x] Stub buildUserTimelineForRange function
- [x] Create AI assistant roadmap documentation

### Next Steps
- [ ] Choose AI provider and evaluate costs
- [ ] Implement buildUserTimelineForRange with real data fetching
- [ ] Design conversation context management system
- [ ] Create prompt templates for common queries
- [ ] Build chat UI component
- [ ] Add API route for AI queries
- [ ] Implement rate limiting and usage tracking
- [ ] Add user preferences for AI features
- [ ] Create privacy policy for AI features
- [ ] Test with real user data (anonymized)

## Code References

Key files for future AI development:
- `/lib/ai/analysis-types.ts` - Data preparation and mappers
- `/prisma/schema.prisma` - DiaryEntry model with mood & tags
- `/app/api/diary/*` - Diary API routes (reference for data loading)
- `/app/api/habits/*` - Habit API routes
- `/app/api/goals/*` - Goal API routes
- `/app/api/calendar-events/*` - Calendar API routes

## Example Prompt Templates (Future)

```typescript
// Example structure for future AI prompts

const MOOD_ANALYSIS_PROMPT = `
Analyze the user's mood patterns from their diary entries:
{timeline_json}

Identify:
1. Most common moods
2. Mood trends over time
3. Potential triggers for negative moods
4. Positive patterns to reinforce

Provide insights in a supportive, encouraging tone.
`;

const HABIT_CORRELATION_PROMPT = `
Analyze correlations between habits and outcomes:
{habit_data_json}
{diary_data_json}

Find relationships between:
- Habit completion and mood
- Habit consistency and goal progress
- Time of day and habit success

Suggest which habits to prioritize.
`;
```

## Success Metrics

When implemented, measure:
- User engagement with AI features
- Accuracy of pattern detection
- User satisfaction with insights
- Impact on goal completion rates
- Frequency of AI-assisted decisions
- Privacy concerns or issues

## Notes

- Start with simple, well-defined queries
- Gradually expand capabilities based on user feedback
- Always prioritize user privacy and control
- Make AI features optional and opt-in
- Provide transparent explanations of insights
- Allow users to correct or dismiss AI suggestions

---

Last Updated: December 11, 2025
Status: Foundation Complete - Ready for Phase 1 Implementation
