# Contributing to Rimmel.js

Hey, welcome to Rimmel.js and the wonderful world of reactive markup and Stream-Oriented Programming.

Here you can find all ways you can contribute to this project and help us shape and evolve this new exciting programming paradigm

- 💫 [Star the repo](https://github.com/reactivehtml/rimmel) (this may sound silly, but even the most clever engineers are biased, they don't even look at a project if it doesn't have "enough" stars.
- ⌨️ Use it in your projects and discover this new programming paradigm.
- 📖 Improve documentation, create tutorials, videos — that can be right here or your blog, your youtube channel. Any medium that's exposed to the Internet works
- 🤔 Raise issues — Anything not working? Open a bug report here
- 🛠️ Pull requests — PRs are all welcome

# Development Guidelines
We really favour concise, short and efficient code. Giving a proper definition of that is very hard, so at least trying to stick with the style of the rest of the code would be appreciated.
If you find something that can or should be improved noneteless, please raise it. We don't want to just impose a style because we like it, we want a UI library that's great!

## Testing
Being a low-level library very large applications can depend on, it's critical to have an excellent test coverage.
How do we know we do indeed have a great test coverage? Structure and Test architecture. We use patterns like the testing pyramid and BDD-style divide-and-conquer approaches to make it easy to check if use cases are grouped in sensible ways and each group of scenarios is covered adequately.

We also introduced things like Stryker that randomly mutates code and checks if that cause any tests to fail. If it doesn't, we know where we need to improve.

Did we ever mention the importance of manual testing? Test automation is great, but you only ever get perfect test automation after you went through a number of manual iterations. Just [clone a project on Stackblitz](https://stackblitz.com/edit/rimmel-click-counter) and run your stuff. It's not just going to be fun, you'll have an opportunity to test in real life your changes and the impact of your contribution.

## Types
Being Rimmel a library, strong, end-to-end typing is what we want to make application development as pleasurable as efficient as possible. We also understand some things are still difficult to type. If TypeScript doesn't have a key feature that's needed, it's better to open a case with TypeScript and push for changes, rather than just settle with nasty workarounds.
