# Claude Code Scope Rules
# Defines what Claude can and cannot modify in this repository
never_modify:
  # Package manager lock files - auto-generated
  - "**/package-lock.json"
  - "**/yarn.lock"
  - "**/pnpm-lock.yaml"
  - "**/bun.lockb"
  
  # Environment files - contain secrets
  - "**/.env"
  - "**/.env.local"
  - "**/.env.production"
  - "**/.env.*.local"
  
  # Git metadata
  - ".git/**"
  - ".gitignore"
  - ".gitattributes"
  
  # Build outputs - auto-generated
  - "**/dist/**"
  - "**/build/**"
  - "**/.next/**"
  - "**/out/**"
  - "**/node_modules/**"
  
  # Prisma generated files
  - "**/prisma/generated/**"
  - "**/.prisma/**"
  
  # IDE and OS files
  - "**/.vscode/**"
  - "**/.idea/**"
  - "**/*.swp"
  - "**/.DS_Store"
  
  # Coverage and test outputs
  - "**/coverage/**"
  - "**/.nyc_output/**"
  
  # Logs
  - "**/*.log"
  - "**/logs/**"

ask_before_modifying:
  # Core configuration files
  - "package.json"              # Dependencies and scripts
  - "tsconfig.json"            # TypeScript config
  - "turbo.json"               # Monorepo build config
  - "next.config.js"           # Next.js config
  - "nest-cli.json"            # NestJS config
  
  # Database schema
  - "**/prisma/schema.prisma"  # Critical: Database structure
  
  # Docker and infrastructure
  - "docker-compose.yml"
  - "Dockerfile"
  - "**/Dockerfile"
  
  # CI/CD configurations
  - ".github/workflows/**"
  - ".gitlab-ci.yml"
  - "azure-pipelines.yml"
  
  # Critical backend files
  - "**/src/main.ts"           # App entry point
  - "**/src/app.module.ts"     # Root module
  
  # Environment templates
  - "**/.env.example"
  - "**/.env.template"
  
  # Security files
  - "**/.npmrc"
  - "**/.yarnrc"
  
  # Documentation (if exists)
  - "README.md"
  - "CONTRIBUTING.md"
  - "CHANGELOG.md"

safe_to_modify:
  # Source code
  - "apps/backend-uptime/src/**/*.ts"
  - "apps/web/app/**/*.tsx"
  - "apps/web/app/**/*.ts"
  - "apps/web/components/**/*.tsx"
  - "apps/web/lib/**/*.ts"
  - "apps/web/hooks/**/*.ts"
  
  # Tests
  - "**/*.spec.ts"
  - "**/*.test.ts"
  - "**/*.e2e-spec.ts"
  
  # Styles
  - "**/*.css"
  - "**/*.scss"
  - "**/tailwind.config.ts"
  
  # DTOs and types
  - "**/dto/**/*.ts"
  - "**/types/**/*.ts"
  - "**/*.interface.ts"
  - "**/*.type.ts"
  
  # Utilities and helpers
  - "**/utils/**"
  - "**/helpers/**"
  - "**/lib/**"
  
  # Claude documentation
  - "CLAUDE.md"
  - "**/.claude.md"
  - ".claudescoperules"

user_preferences:
  # STRICT FILE MODIFICATION POLICY
  explicit_file_targeting:
    - "ONLY modify files that the user EXPLICITLY mentions by name or path"
    - "If user says 'fix the login component', ask which specific file to modify"
    - "If user says 'add a test for UserService', ONLY modify user.service.spec.ts"
    - "Never modify related files 'just in case' or 'to be helpful'"
    - "When unsure which file to modify, ALWAYS ask the user first"
  
  # TESTING ISOLATION RULE
  testing_modifications:
    - "When user asks to create/modify tests, ONLY touch test files (*.spec.ts, *.test.ts, *.e2e-spec.ts)"
    - "NEVER modify the source code file being tested unless explicitly requested"
    - "If a test requires source code changes, inform the user and ask permission"
    - "Example: 'To test UserService, I'll only modify user.service.spec.ts. The source file user.service.ts will NOT be touched.'"
  
  # SINGLE FILE FOCUS
  one_file_at_a_time:
    - "Default to modifying ONE file per user request"
    - "If multiple files need changes, list them and ask which to start with"
    - "Only modify multiple files if user explicitly says 'update X, Y, and Z files'"
    - "After modifying one file, ask before proceeding to others"
  
  # EXPLICIT CONFIRMATION REQUIRED
  confirmation_before_action:
    - "Before ANY file modification, state clearly: 'I will modify [filename]. Proceed?'"
    - "Show what will be changed before changing it"
    - "If user request is ambiguous, ask for clarification instead of assuming"

# ============================================================================
# MODIFICATION PATTERNS
# ============================================================================

patterns:
  # When modifying database schema:
  database_changes:
    - "Always ask before modifying schema.prisma"
    - "Suggest migration name after schema changes"
    - "Warn about data loss in migrations"
    - "Remind to run: npx prisma migrate dev"
  
  # When adding dependencies:
  dependency_changes:
    - "Always ask before adding new packages"
    - "Explain why the dependency is needed"
    - "Check for existing similar packages first"
    - "Suggest npm/yarn/pnpm command to run"
  
  # When modifying API endpoints:
  api_changes:
    - "Ensure endpoint follows /api/v1/ prefix convention"
    - "Add proper authentication guards if needed"
    - "Update DTOs with validation decorators"
    - "Consider backward compatibility"
    - "ONLY modify the specific file mentioned by user"
  
  # When modifying environment variables:
  env_changes:
    - "Never modify .env files directly"
    - "Update .env.example instead"
    - "Document new variables in CLAUDE.md"
    - "Remind user to update their local .env"
  
  # When adding new features:
  feature_changes:
    - "Follow existing module structure"
    - "Create tests ONLY in test files when requested"
    - "Update relevant .claude.md documentation ONLY if user asks"
    - "Don't automatically modify related files"


special_rules:
  # Prisma migrations
  prisma:
    - "Never manually edit migration files in prisma/migrations/"
    - "Always generate migrations using prisma migrate dev"
    - "Never delete existing migrations in production"
  
  # Monorepo rules
  monorepo:
    - "Install workspace dependencies at root level"
    - "Install app-specific dependencies in respective app folders"
    - "Changes to one app should not break others"
  
  # Security
  security:
    - "Never commit sensitive data (API keys, passwords)"
    - "Always use environment variables for secrets"
    - "Validate all user inputs in DTOs"
    - "Use JwtAuthGuard on protected routes"
  
  # Code quality
  quality:
    - "Run linter before suggesting changes: npm run lint"
    - "Follow existing code style and patterns"
    - "Add TypeScript types for all functions"
    - "Write descriptive commit-ready summaries"


workflows:
  # Before making changes:
  before_changes:
    - "Confirm the EXACT file(s) to be modified with the user"
    - "Read relevant .claude.md files for context"
    - "Check if similar code exists elsewhere (but don't modify it)"
    - "Verify change aligns with project architecture"
    - "State clearly: 'I will modify [filename]. No other files will be touched.'"
  
  # After making changes:
  after_changes:
    - "Suggest running tests: npm run test (but don't auto-create tests)"
    - "Suggest linting: npm run lint"
    - "Only mention documentation if user asks"
    - "Provide clear commit message suggestion"
    - "Ask if user wants to modify another file"
  
  # When user asks to "fix" something:
  fixing_issues:
    - "First, understand the full error context"
    - "Ask which specific file to fix"
    - "Check logs, error messages, and stack traces"
    - "Look for similar issues in the codebase (read-only)"
    - "Explain the root cause before fixing"
    - "Modify ONLY the file user specifies"
    - "Suggest preventive measures"
  
  # When user asks for testing:
  testing_workflow:
    - "Confirm the test file to create/modify (e.g., user.service.spec.ts)"
    - "NEVER modify the source file being tested"
    - "If source code needs changes for testing, inform user and STOP"
    - "Focus exclusively on the test file"
    - "After tests are done, ask if source code changes are needed"
  
  # When user request is ambiguous:
  ambiguous_requests:
    - "Don't assume which files to modify"
    - "Ask: 'Which file should I modify: [list options]?'"
    - "Wait for explicit confirmation before proceeding"
    - "Example: User says 'add validation' → Ask: 'Which file: dto/create-user.dto.ts or user.controller.ts?'"


conventions:
  # Naming
  naming:
    - "Use camelCase for variables and functions"
    - "Use PascalCase for classes and components"
    - "Use kebab-case for file names"
    - "Prefix interfaces with 'I' if using interface pattern"
  
  # File organization
  files:
    - "Group related files in feature folders"
    - "Keep DTOs in dedicated dto/ folders"
    - "Place types in types/ folder for shared types"
    - "Co-locate tests with source files"
  
  # Error handling
  errors:
    - "Use NestJS built-in exceptions"
    - "Return meaningful error messages"
    - "Log errors with proper context"
    - "Use try-catch in async operations"
  
  # Comments
  comments:
    - "Comment complex business logic"
    - "Document public APIs with JSDoc"
    - "Explain 'why' not 'what' in comments"
    - "Keep comments up-to-date with code"

always_remember:
  - "⚠️ CRITICAL: Only modify files that user EXPLICITLY mentions by name"
  - "⚠️ TESTING RULE: When creating/modifying tests, ONLY touch test files (*.spec.ts, *.test.ts)"
  - "⚠️ ONE FILE AT A TIME: Default to modifying one file per request"
  - "⚠️ ASK FIRST: When uncertain which file to modify, always ask the user"
  - "This is a production monitoring application - reliability is critical"
  - "Backend uses BullMQ for background jobs - consider queue implications"
  - "Frontend uses Next.js App Router - respect server/client boundaries"
  - "Database uses Prisma - always create migrations for schema changes"
  - "Authentication uses JWT - protect sensitive routes"
  - "Follow the existing patterns - consistency matters"
  - "When in doubt, ask the user before proceeding"

correct_behavior_examples:
  example_1:
    user_request: "Add a test for the UserService"
    correct_response: "I'll create/modify the test file apps/backend-uptime/src/user/user.service.spec.ts. The source file user.service.ts will NOT be modified. Proceed?"
    incorrect_response: "I'll modify user.service.ts and user.service.spec.ts" # ❌ WRONG
  
  example_2:
    user_request: "Fix the login validation"
    correct_response: "Which file should I modify? Options: 1) dto/login.dto.ts (validation rules) 2) auth.controller.ts (endpoint validation) 3) auth.service.ts (business logic)"
    incorrect_response: "I'll update the login.dto.ts, auth.controller.ts, and auth.service.ts" # ❌ WRONG
  
  example_3:
    user_request: "Update the monitor status logic"
    correct_response: "Which file should I modify: uptime.service.ts or uptime.processor.ts?"
    incorrect_response: "*modifies both files without asking*" # ❌ WRONG
  
  example_4:
    user_request: "Add unit tests for the create monitor endpoint"
    correct_response: "I'll modify uptime.service.spec.ts to add tests for the create method. The source file uptime.service.ts will NOT be touched. Proceed?"
    incorrect_response: "*modifies both uptime.service.ts and uptime.service.spec.ts*" # ❌ WRONG
  
  example_5:
    user_request: "Modify apps/web/components/monitors/monitor-card.tsx to add a delete button"
    correct_response: "I'll modify apps/web/components/monitors/monitor-card.tsx to add the delete button. Proceed?"
    incorrect_response: "*also modifies other monitor components or creates a new hook*" # ❌ WRONG