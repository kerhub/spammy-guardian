const core = require('@actions/core');
const github = require('@actions/github');
const RegexParser = require("regex-parser");

const token = core.getInput('token');
const octokit = github.getOctokit(token);

const validateBody = (body) => {
    const minOccurrences = core.getInput('minOccurrences');
    const regex = RegexParser(core.getInput('regex'));

    if (!new RegExp(regex)) {
        throw new Error('Invalid regex');
    }

    if (minOccurrences < 0 || !minOccurrences.match(/\d+/g)) {
        throw new Error('minOccurrences must be a positive number');
    }

    const occurrencesCount = (body.match(regex) || []).length;
    return occurrencesCount < minOccurrences;
}

const sanitizeComment = async (body, commentId) => {
    const isValid = validateBody(body);

    if (!isValid) {
        const owner = github.context.repo.owner;
        const repo = github.context.repo.repo;
        await octokit.rest.issues.deleteComment({
            owner,
            repo,
            comment_id: commentId
        });
    }
}

const sanitizeIssue = async (body) => {
    const isValid = validateBody(body);

    if (!isValid) {
        const title = core.getInput('title');
        const body = core.getInput('body');

        await octokit.rest.issues.update({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.payload.issue.number,
            state: 'closed',
            title,
            body
        });
    }
}

const main = async () => {
    // check if runned by workflow_dispatch
    if (github.context.eventName === 'workflow_dispatch') {
        const issueId = github.context.payload.inputs.issueId;

        if (!issueId) {
            throw new Error('You must provide an issue id with manual runs');
        } else {
            // Check all comments from the issue
            const comments = await octokit.rest.issues.listComments({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                issue_number: issueId
            });

            if (!comments.data.length) {
                throw new Error('No comments found for this issue');
            } else {
                for await (const comment of comments.data) {
                    await sanitizeComment(comment.body, comment.id);
                }
            }
        }
    } else if (github.context.eventName === 'issue_comment') {
        // Check only the comment that triggered the workflow
        const body = github.context.payload.comment.body;
        const commentId = github.context.payload.comment.id;
        await sanitizeComment(body, commentId);
    } else if (github.context.eventName === 'issues' && github.context.payload.action === 'opened') {
        // Check on issue creation
        await sanitizeIssue(github.context.payload.issue.body);
    } else {
        throw new Error('This action only works on issue comments and issue opened');
    }
}

try {
    main();
} catch (error) {
    core.setFailed(error.message);
}
