# Contributing to BrewCrate

Thanks for your interest in improving BrewCrate. This is a teaching project, so
contributions that make it a clearer, more realistic learning environment are
especially welcome.

## Ground rules

- **Keep it local.** BrewCrate is designed to run on localhost or inside an
  isolated container. Never add code that encourages deploying it publicly.
- **Keep the flaws realistic.** The learning value comes from code that looks
  like ordinary production code. Please do not add comments that point at or
  label the intentional weaknesses — the answer key in `SOLUTIONS.md` is the
  place for that.
- **Keep it original.** All code here is written from scratch. Do not paste code
  from other projects.

## Getting set up

```bash
npm install
npm run seed
npm start
```

The app runs at `http://127.0.0.1:3000`.

## Making changes

1. Create a branch for your change.
2. Keep the code style consistent with the existing files (2-space indent,
   single quotes, small focused route files).
3. Run `node --check` on any file you touch and confirm the server still boots.
4. If you add or change an intentional weakness, update `SOLUTIONS.md` with the
   location, exploitation steps, difficulty, and the fix.
5. Open a pull request describing what you changed and why.

## Reporting issues

Use the issue tracker for bugs in the app's normal functionality (things that
break the shopping experience), documentation gaps, or ideas for new training
scenarios.
