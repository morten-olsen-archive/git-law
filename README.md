# Git Law

Validate/enforce Github repository policies across your entire organization, personal space or only on a select set of repos. Everything build for running using Github's own infrastructure (Actions), so no new tools or services required. Create your own rules and policies or rely on community made setups.

## This is WIP

This project as well as it's documentation is still very much in the early stages and should not yet be relied on.

**V1 roadmap**

- [x] Core functionality
- [ ] Publish to NPM
- [ ] Setup CI/CD
- [ ] Extended CLI options (dry-run, limited runs, etc.)
- [ ] Github Action templates
- [ ] Setup as a Github App
- [ ] Publish as a Github Actions
- [ ] Add tests
- [ ] Add more build in rules
- [ ] Add reporters for webhooks, email, slack and github
- [ ] Refactor for maintainability

## Usage

This project uses node tooling which will be required to run locally.

Start by creating a new NPM project using `npm init --yes` and then add Git Law `npm install git-law`. That's it, you are ready to create your setup.

Your config should be inside `gitlaw.js`, let's start with a simple example

```javascript
import { HelloWorld, consoleReporter } from 'git-law';

module.exports = {
  auth: {
    token: 'your-personal-access-token',
  },
  repos: {
    include: ['my/repo'],
  },
  rules: {
    myFirstRule: new HelloWorld(),
  },
  policy: {
    default: {
      myFirstRule: 'recommend',
    },
  },
  reporters: [
    consoleReporter,
  ],
};
```

You can safely run the above rule, it will not make any changes, so replace the token with your own and the include to one of your repositories and run `npx git-law`. This will generate a compliance report and print it to the screen. (Not that you should not include your token in an actual config, instead use `process.env.GITHUB_TOKEN` or a secret manager)

So lets go over the elements:

* `auth`: this is where you setup Github access. Currently only personal access tokens are supported, but soon also Github App credentials can be provided
* `repos`: this contains the list of repos to include/exclude. If left out all repos that the token grants access to are included. These can also be provided with wildcard (`*/some-repo` and `some-user/*`)
* `rules`: this is where you create a list of named and configured rules that can be used to create policies.
* `policies/default`: here you create your default policies, which will apply to all repos (unless overridden). You use the names created in the `rules` section and give them a policy type of either `enforced` (these will be auto applied), `required` (these is treaded as the repo being incompliant, but will not auto enfoce) or `recommended` (the repo is considered compliant, but will raise a warning)
* `reporters`: after a compliance report has been created this is passed to a reporter, in this case it just prints it to the console, but could send a mail, write on Slack, update a dashboard, call a webhook or any other action.

Another example config can be seen ad [demo-config.ts](./demo-config.ts)

### Per repo configuration

Since not all repositories are created equal you will most likely need some flexibility in terms of what is enforced where, and for this there are a few different strategies that can be combined and used

#### Include/Exclude

The simples is to only include the repos that you want to validate. This does not allow any pr. repo customization, but allows you to only validate specific repos

#### Github App Installation (soon)

Like the exclude/include but instead managed by installing or uninstalling the app into specific repos.

#### Repo project file

The repos can have a "repo policy" file, which would be located at `.github/gitlaw.yml` by default. This is made available for all rules, so they can use this for pr. repo configuration. Additionally a `onlyConfiguredRepos: true` property can be added to the confg, to ONLY run on projects with a repo policy file.

#### Overrides

Inside the `policy` property of the configuration an `overrides` section can be provided where specific rules can be applied, have their type changed or be removed.

```
{
  policy: {
    default: {
      ruleA: 'enforced',
      ruleB: 'recommended',
    },
    overrides: {
      'morten-olsen/*': {
        ruleA: undefined,
        ruleC: 'required',
      }
    }
  }
}
```

In the above example, even though my default config is to enforce `ruleA` and recommend `ruleB`, for projects under the `morten-olsen` user `ruleA` is removed, `ruleB` is still recommended and `ruleC` is required.

## Setting up on Github

... WIP, how to configure Github Actions for automatically running and reporting

## Custom rules

...WIP, see [./src/rules](./src/rules) for some example rules

## Custom reporters 

...WIP, see [./src/reporters](./src/reporters) for some example reporters


