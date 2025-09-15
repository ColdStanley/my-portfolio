# JD2CV Full - AI Resume Customization

## Target Icon Button (LangChain AI)

**Location**: Second row of JD card, left side of Lightning button

### Complete Feature List

1. **Pre-validation**
   - Check personal info exists in localStorage
   - Validate basic information (name + email) completeness

2. **LangChain AI Processing** (90-97 seconds)
   - **Parent Agent**: Role classification (8 role categories)
   - **Role Expert + Non-Work Expert**: Parallel customization
   - **Reviewer Agent**: Style unification and final review

3. **Real-time Progress Display**
   - SSE progress modal with 3-step visualization
   - Token consumption counter (bottom-right corner)

4. **Data Storage**
   - Update localStorage: customized personal info
   - Store work experience to localStorage (by JD ID)

5. **PDF Generation & Download**
   - V2 API generates complete resume PDF
   - Auto-download to user's local machine

6. **Database Upload**
   - Auto-upload PDF file to Supabase
   - Link to JD record

7. **Experience Auto-Storage** (New Feature)
   - Parse work experience text into individual records
   - Store to experience_records table
   - Auto-overwrite on duplicate JD generation

8. **State Management**
   - 180-second countdown display during generation
   - Disabled interaction during generation

### Core Functionality
One-click complete AI resume customization workflow from JD analysis to PDF generation.

---

**Last Updated**: September 2025