# Data Model: AI Agents Pipeline

## PipelineState

Tracks the state and progress of the AI pipeline for a given video.

**Fields**:
- `_id`: ObjectId (MongoDB auto-generated)
- `videoId`: String (required, reference to Video document)
- `userId`: String (required, reference to User document)
- `status`: Enum — `"pending"`, `"security_checking"`, `"security_failed"`, `"seo_generating"`, `"completed"`, `"error"`
- `current_stage`: String — `"security_check"`, `"seo_generation"`, `"complete"`
- `progress_percentage`: Number (0-100)
- `security_result`: Boolean | null — true if passed, false if failed, null if not yet checked
- `seo_result`: Object | null — contains the SEO output package when complete
- `error`: String | null — error message if pipeline failed
- `created_at`: Date
- `updated_at`: Date

**Validation Rules**:
- `videoId` must reference an existing Video document
- `progress_percentage` must be between 0 and 100
- `seo_result` can only be populated when `status` is `"completed"`
- `security_result` must be set before transitioning to `"seo_generating"`

**State Transitions**:
```
pending → security_checking → security_failed (terminal)
                              ↓
                          seo_generating → completed (terminal)
                                           ↓
                                       error (terminal)
```

## SEOOutputPackage

Embedded document within `PipelineState.seo_result`.

**Fields**:
- `viral_score`: Number (0-100) — percentage probability of going viral
- `title`: String (max 100 characters, ideal 40-50)
- `description`: String (max 5000 words, first 2-3 lines should be 100-150 words with keywords)
- `tags`: Array of Strings — optimized tags/keywords
- `category_id`: String — YouTube category ID resolved via YouTube API
- `category_name`: String — human-readable category name

## SecurityCheckResult

Simple boolean stored in `PipelineState.security_result`.

- `true`: Video passed safety check; pipeline proceeds to SEO generation
- `false`: Video failed safety check; pipeline stops; video is blocked from further processing
- `null`: Security check not yet executed
