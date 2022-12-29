# Spammy guardian


<div align="center">
  <img src="spammy-logo.png" alt="spammy logo" width="200" />
</div>

<br />

> GitHub Action deleting comments and closing issues based on repetitive occurrences in a comment.

## Motivation

Being hit by fake spam accounts is a common problem for open-source projects. This GitHub Action is a simple way to prevent spammy comments. A target example with mass tags is the following:

```
Check my photos on **url**
@AZE @AZE @AZE @AZE @AZE @AZE @AZE @AZE
```

## Inputs

| Input         | Required | Description                                    | Default           |
|---------------|----------|------------------------------------------------|-------------------|
| minOccurences | false    | min count of occurrences to trigger the action | 5                 |
| regex         | false    | Regex to test the occurrences against          | /@(\w+)/g         |
| title         | false    | optional title replacement for closed issues   | '[Moderated]'       |
| body          | false    | optional body replacement for closed issues    | 'Moderated content' |


## workflow_dispatch inputs

| Input         | Required | Description                                                                    | Default |
|---------------|----------|--------------------------------------------------------------------------------|---------|
| issueId       | false    | to test the action against all comments from an issue (workflow-dispatch only) |              |


## Triggers

| Name              | Description                                   |
|-------------------|-----------------------------------------------|
| issue_comment     | to test on comment creation                   |
| issues            | to test on issue creation                     |
| workflow_dispatch | manual run on an issue (requires an issue id) |


## Workflow examples

### on issue comment

```yaml
name: Spammy Guardian
on: [issue_comment]
jobs:
  spammy-guardian:
    runs-on: ubuntu-latest
    steps:
      - uses: kerhub/spammy-guardian@v1.0.0
        with:
          minOccurrences: 5
          regex: /@(\w+)/g
```

### on issue creation

```yaml
name: Spammy Guardian
on: 
  issues:
    types: [opened]
jobs:
  spammy-guardian:
    runs-on: ubuntu-latest
    steps:
      - uses: kerhub/spammy-guardian@v1.0.0
        with:
          minOccurrences: 5
          regex: /@(\w+)/g  
```

## on workflow_dispatch

```yaml
name: Spammy Guardian
on: 
  workflow_dispatch:
    inputs:
      issueId:
        description: 'Issue ID'
        required: true
jobs:
  spammy-guardian:
    runs-on: ubuntu-latest
    steps:
      - uses: kerhub/spammy-guardian@v1.0.0
        with:
          minOccurrences: 5
          regex: /@(\w+)/g  
```

## Credits

<a href="https://www.flaticon.com/free-icons/shield" title="shield icons">Logo created by HJ Studio - Flaticon</a>
