# Dependency audit policy

CI runs `npm audit --audit-level=high` and blocks high or critical advisories. The production dependency graph has no high or
critical findings after pinning `picomatch`, `postcss`, and `brace-expansion` to fixed releases.

The current Prisma 7 CLI brings a moderate advisory through its development package `@prisma/dev` and
`@hono/node-server`. npm only offers a fix by downgrading Prisma to 6.19.3, which would be a breaking database-toolchain change.
The vulnerable package is not loaded by the API runtime; it is used by Prisma CLI during image build and migrations. Revisit
this exception when Prisma publishes a 7.x release with the patched transitive dependency, and record the upgrade in the change
log. Do not run `npm audit fix --force` automatically because it proposes that downgrade.
